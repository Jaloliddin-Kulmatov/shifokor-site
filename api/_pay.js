// Online payment for consultations through Payme (Merchant API) and Click (SHOP API).
// Each switches on only when its settings are in the server's environment:
//   PAYME_MERCHANT_ID, PAYME_KEY            from the Payme business cabinet (PAYME_KEY is the cashbox key)
//   PAYME_TEST=1                            use Payme's test checkout while testing with the test key
//   PAYME_IKPU, PAYME_PACKAGE_CODE          optional: the service's IKPU (MXIK) and package codes for the fiscal receipt
//   CLICK_SERVICE_ID, CLICK_MERCHANT_ID, CLICK_SECRET_KEY   from the Click merchant cabinet
// In the cabinets, the endpoint is <site>/api/app?pay=payme or <site>/api/app?pay=click, and Payme's account field is "consult".
// The patient pays the price the doctor had when accepting; the money goes to the merchant account that owns these keys.
const crypto = require("crypto");

const env = (k) => (process.env[k] || "").trim();
const PAYME = !!(env("PAYME_MERCHANT_ID") && env("PAYME_KEY"));
const CLICK = !!(env("CLICK_SERVICE_ID") && env("CLICK_MERCHANT_ID") && env("CLICK_SECRET_KEY"));
const EXPIRE = 12 * 3600e3;   // Payme: a transaction not paid within 12 hours is cancelled
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const sum = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const md5 = (s) => crypto.createHash("md5").update(s).digest("hex");
function same(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// Payme's error codes, with the message in the three languages it shows
const PE = {
  auth: [-32504, "Ruxsat yo‘q", "Недостаточно привилегий", "Insufficient privileges"],
  parse: [-32700, "So‘rovni o‘qib bo‘lmadi", "Ошибка разбора запроса", "Can't parse the request"],
  method: [-32601, "Bunday amal yo‘q", "Метод не найден", "Method not found"],
  system: [-32400, "Tizim xatosi", "Системная ошибка", "System error"],
  amount: [-31001, "Noto‘g‘ri summa", "Неверная сумма", "Wrong amount"],
  notx: [-31003, "Tranzaksiya topilmadi", "Транзакция не найдена", "Transaction not found"],
  state: [-31008, "Amalni bajarib bo‘lmaydi", "Невозможно выполнить операцию", "Can't perform this operation"],
  account: [-31050, "Ariza topilmadi", "Заявка не найдена", "Consultation not found"],
  unpayable: [-31051, "Bu ariza to‘lov kutmayapti", "Эта заявка не ожидает оплаты", "This consultation isn't waiting for payment"],
  busy: [-31052, "Bu ariza uchun boshqa to‘lov kutilmoqda", "Для этой заявки уже ожидается другая оплата", "Another payment for this consultation is in progress"]
};
class PErr extends Error { constructor(k, data) { super(k); this.k = k; this.data = data; } }

module.exports = function ({ q, notifyUser, site }) {
  const payable = (c) => !!c && c.status === "accepted" && c.pay_status === "due" && c.price > 0;
  const consultById = async (id) => (UUID.test(String(id || "")) ? (await q("select id, n, status, pay_status, price, doctor_id from app_consults where id = $1", [id])).rows[0] : null);
  const txOf = async (provider, ext) => (await q("select * from app_payments where provider = $1 and ext_id = $2", [provider, ext])).rows[0];
  const num = (r) => r && Object.assign(r, { amount: Number(r.amount), create_time: Number(r.create_time), perform_time: Number(r.perform_time), cancel_time: Number(r.cancel_time), ext_time: r.ext_time == null ? null : Number(r.ext_time), n: Number(r.n) });

  // the transaction and the consultation change together, so a payment is never half recorded
  async function perform(tx, provider, now) {
    const r = await q(
      "with p as (update app_payments set state = 2, perform_time = $2 where id = $1 and state = 1 returning consult_id) " +
      "update app_consults c set pay_status = 'paid', paid_at = now(), pay_provider = $3 from p where c.id = p.consult_id and c.pay_status = 'due' returning c.id, c.n, c.doctor_id",
      [tx.id, now, provider]
    );
    const c = r.rows[0];
    if (c && c.doctor_id) await notifyUser(c.doctor_id, "Shifokor: bemor to‘lov qildi (ariza №" + c.n + "). Endi javob yozishingiz yoki qo‘ng‘iroq qilishingiz mumkin. " + site() + "/#/consult/" + c.id);
    return !!c;
  }
  async function cancel(tx, reason, now) {
    if (tx.state === 1) await q("update app_payments set state = -1, cancel_time = $2, reason = $3 where id = $1 and state = 1", [tx.id, now, reason]);
    else if (tx.state === 2) {
      const r = await q(
        "with p as (update app_payments set state = -2, cancel_time = $2, reason = $3 where id = $1 and state = 2 returning consult_id) " +
        "update app_consults c set pay_status = 'refunded' from p where c.id = p.consult_id and c.pay_status = 'paid' returning c.id, c.n, c.doctor_id",
        [tx.id, now, reason]
      );
      const c = r.rows[0];
      if (c && c.doctor_id) await notifyUser(c.doctor_id, "Shifokor: ariza №" + c.n + " uchun to‘lov bemorga qaytarildi.");
    }
  }

  // ---------- Payme: JSON-RPC calls from Payme's servers ----------
  async function payme(req, body) {
    const id = body && typeof body === "object" && body.id != null ? body.id : null;
    const err = (k, data) => ({ error: { code: PE[k][0], message: { uz: PE[k][1], ru: PE[k][2], en: PE[k][3] }, data: data || null }, id });
    const ok = (result) => ({ result, id });
    const auth = /^Basic\s+(\S+)$/i.exec(req.headers.authorization || "");
    if (!PAYME || !auth || !same(auth[1], Buffer.from("Paycom:" + env("PAYME_KEY")).toString("base64"))) return err("auth");
    if (!body || typeof body !== "object" || typeof body.method !== "string") return err("parse");
    const p = body.params && typeof body.params === "object" ? body.params : {};
    const tid = String(p.id || "");
    try {
      const check = async () => {
        const c = await consultById(p.account && p.account.consult);
        if (!c) throw new PErr("account", "consult");
        if (!payable(c)) throw new PErr("unpayable", "consult");
        if (Math.round(Number(p.amount)) !== c.price * 100) throw new PErr("amount");
        return c;
      };
      const known = async () => { const tx = num(await txOf("payme", tid)); if (!tx) throw new PErr("notx"); return tx; };
      switch (body.method) {
        case "CheckPerformTransaction": {
          const c = await check();
          const res = { allow: true };
          if (env("PAYME_IKPU")) res.detail = { receipt_type: 0, items: [{ title: "Onlayn tibbiy maslahat, ariza №" + c.n, price: c.price * 100, count: 1, code: env("PAYME_IKPU"), package_code: env("PAYME_PACKAGE_CODE"), vat_percent: 0 }] };
          return ok(res);
        }
        case "CreateTransaction": {
          if (!tid || tid.length > 64) return err("parse");
          const now = Date.now();
          let tx = num(await txOf("payme", tid));
          if (tx) {
            if (tx.state !== 1) throw new PErr("state");
            if (now - tx.create_time > EXPIRE) { await cancel(tx, 4, now); throw new PErr("state"); }
            return ok({ create_time: tx.create_time, transaction: tx.id, state: 1 });
          }
          const c = await check();
          for (const o of (await q("select * from app_payments where consult_id = $1 and provider = 'payme' and state = 1", [c.id])).rows.map(num)) {
            if (now - o.create_time > EXPIRE) await cancel(o, 4, now); else throw new PErr("busy", "consult");
          }
          try {
            tx = (await q("insert into app_payments (consult_id, account, provider, ext_id, ext_time, amount, create_time) values ($1, $1, 'payme', $2, $3, $4, $5) returning id", [c.id, tid, Math.round(Number(p.time)) || now, c.price * 100, now])).rows[0];
          } catch (e) {
            if (e && e.code === "23505") throw new PErr("busy", "consult");   // two payments started at the same moment
            throw e;
          }
          return ok({ create_time: now, transaction: tx.id, state: 1 });
        }
        case "PerformTransaction": {
          const tx = await known(), now = Date.now();
          if (tx.state === 2) return ok({ transaction: tx.id, perform_time: tx.perform_time, state: 2 });
          if (tx.state !== 1) throw new PErr("state");
          if (now - tx.create_time > EXPIRE) { await cancel(tx, 4, now); throw new PErr("state"); }
          const c = await consultById(tx.consult_id);
          if (!payable(c) || c.price * 100 !== tx.amount) throw new PErr("state");   // Payme then cancels it
          if (!(await perform(tx, "payme", now))) throw new PErr("state");
          return ok({ transaction: tx.id, perform_time: now, state: 2 });
        }
        case "CancelTransaction": {
          let tx = await known();
          if (tx.state > 0) { await cancel(tx, Math.round(Number(p.reason)) || null, Date.now()); tx = num(await txOf("payme", tid)); }
          return ok({ transaction: tx.id, cancel_time: tx.cancel_time, state: tx.state });
        }
        case "CheckTransaction": {
          const tx = await known();
          return ok({ create_time: tx.create_time, perform_time: tx.perform_time, cancel_time: tx.cancel_time, transaction: tx.id, state: tx.state, reason: tx.reason == null ? null : tx.reason });
        }
        case "GetStatement": {
          const r = await q("select * from app_payments where provider = 'payme' and create_time between $1 and $2 order by create_time", [Math.round(Number(p.from)) || 0, Math.round(Number(p.to)) || 0]);
          return ok({ transactions: r.rows.map(num).map((tx) => ({ id: tx.ext_id, time: tx.ext_time || tx.create_time, amount: tx.amount, account: { consult: tx.account }, create_time: tx.create_time, perform_time: tx.perform_time, cancel_time: tx.cancel_time, transaction: tx.id, state: tx.state, reason: tx.reason == null ? null : tx.reason })) });
        }
        default: return err("method");
      }
    } catch (e) {
      if (e instanceof PErr) return err(e.k, e.data);
      console.error("payme", body.method, e && e.message);
      return err("system");
    }
  }

  // ---------- Click: Prepare (action 0) and Complete (action 1) from Click's servers ----------
  async function click(body) {
    const b = body && typeof body === "object" ? body : {};
    const f = (k) => String(b[k] == null ? "" : b[k]);
    const action = f("action");
    const reply = (error, note, extra) => Object.assign({ click_trans_id: Number(f("click_trans_id")) || 0, merchant_trans_id: f("merchant_trans_id") }, extra || {}, { error, error_note: note });
    if (!CLICK) return reply(-8, "Error in request from click");
    if (action !== "0" && action !== "1") return reply(-3, "Action not found");
    const sign = md5(f("click_trans_id") + f("service_id") + env("CLICK_SECRET_KEY") + f("merchant_trans_id") + (action === "1" ? f("merchant_prepare_id") : "") + f("amount") + action + f("sign_time"));
    if (f("service_id") !== env("CLICK_SERVICE_ID") || !same(sign, f("sign_string").toLowerCase())) return reply(-1, "SIGN CHECK FAILED!");
    if (!/^\d{1,20}$/.test(f("click_trans_id"))) return reply(-8, "Error in request from click");
    try {
      const c = await consultById(f("merchant_trans_id"));
      const now = Date.now();
      if (action === "0") {
        if (!c) return reply(-5, "Consultation does not exist");
        if (c.pay_status === "paid") return reply(-4, "Already paid");
        if (!payable(c)) return reply(-9, "Consultation isn't waiting for payment");
        if (Number(f("amount")) !== c.price) return reply(-2, "Incorrect parameter amount");
        let tx = num(await txOf("click", f("click_trans_id")));
        if (!tx) tx = num((await q("insert into app_payments (consult_id, account, provider, ext_id, amount, create_time) values ($1, $1, 'click', $2, $3, $4) on conflict (provider, ext_id) do update set ext_id = excluded.ext_id returning *", [c.id, f("click_trans_id"), c.price * 100, now])).rows[0]);
        if (tx.state < 0) return reply(-9, "Transaction cancelled");
        return reply(0, "Success", { merchant_prepare_id: tx.n });
      }
      const tx = num(await txOf("click", f("click_trans_id")));
      if (!tx || String(tx.n) !== f("merchant_prepare_id")) return reply(-6, "Transaction does not exist");
      if (tx.state === 2) return reply(-4, "Already paid");
      if (tx.state < 0) return reply(-9, "Transaction cancelled");
      if (Number(f("error")) < 0) { await cancel(tx, 2, now); return reply(-9, "Transaction cancelled"); }   // the payment failed on Click's side
      if (Math.round(Number(f("amount")) * 100) !== tx.amount) return reply(-2, "Incorrect parameter amount");
      if (!payable(c) || !(await perform(tx, "click", now))) {
        await cancel(tx, 5, now);
        return c && c.pay_status === "paid" ? reply(-4, "Already paid") : reply(-9, "Transaction cancelled");
      }
      return reply(0, "Success", { merchant_confirm_id: tx.n });
    } catch (e) {
      console.error("click", action, e && e.message);
      return reply(-7, "Failed to update user");
    }
  }

  // where the patient's browser goes to pay; it comes back to the consultation page
  function link(c, provider, lang) {
    const back = site() + "/#/consult/" + c.id;
    if (provider === "payme" && PAYME) {
      const raw = "m=" + env("PAYME_MERCHANT_ID") + ";ac.consult=" + c.id + ";a=" + c.price * 100 + ";l=" + (lang === "ru" ? "ru" : lang === "en" ? "en" : "uz") + ";c=" + back;
      return (env("PAYME_TEST") ? "https://checkout.test.paycom.uz/" : "https://checkout.paycom.uz/") + Buffer.from(raw).toString("base64");
    }
    if (provider === "click" && CLICK) {
      return "https://my.click.uz/services/pay?" + new URLSearchParams({ service_id: env("CLICK_SERVICE_ID"), merchant_id: env("CLICK_MERCHANT_ID"), amount: String(c.price), transaction_param: c.id, return_url: back }).toString();
    }
    return null;
  }

  return { PAYME, CLICK, ON: PAYME || CLICK, payable, payme, click, link, sum };
};
