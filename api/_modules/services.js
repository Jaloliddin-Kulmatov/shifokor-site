// Payments (Payme, Click), "Onalar uchun" and medicines: modules built with what they need from the core.
const crypto = require("crypto");
const { q } = require("../_core/db");
const { Fail, bad } = require("../_core/errors");
const { UUID, str, phoneOf, today } = require("../_core/validate");
const { sha, need, isAdmin } = require("../_core/auth");
const site = require("../_core/site");
const { notifyUser } = site;
const N = require("./notify");

const P = require("./pay")({ q, notifyUser, site: site.url });
const O = require("./ona")({ q, N, sha, crypto, site: site.url, today, Fail, bad, need, UUID, str });
const M = require("./meds")({ q, notifyUser, site: site.url, Fail, bad, need, UUID, str, isAdmin, phoneOf });

module.exports = { P, O, M };
