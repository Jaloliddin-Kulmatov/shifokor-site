// Results at the API boundary: a Fail carries an HTTP status and a short error code the site translates.
class Fail extends Error { constructor(status, code) { super(code); this.status = status; this.code = code; } }
const bad = (code) => { throw new Fail(400, code || "invalid"); };

// Turns a connection failure into a short reason without exposing the connection string or password.
function reasonOf(e) {
  const code = (e && e.code) || "", msg = String((e && e.message) || "");
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") return "host_not_found: check the host part of DATABASE_URL";
  if (code === "ENETUNREACH" || code === "EHOSTUNREACH" || /ENETUNREACH|EHOSTUNREACH/.test(msg)) return "network_unreachable: this is probably Supabase's direct (IPv6) connection; use the Transaction pooler string";
  if (code === "ECONNREFUSED") return "connection_refused: check the host and port";
  if (code === "ETIMEDOUT" || /timeout/i.test(msg)) return "timeout: the database didn't answer; check the host and port";
  if (code === "28P01" || /password authentication failed/i.test(msg)) return "wrong_password: check the password in DATABASE_URL (percent-encode special characters)";
  if (/tenant or user not found/i.test(msg)) return "wrong_user: for the pooler the user must be postgres.<project-ref>, copied as-is from Supabase";
  if (code === "3D000") return "database_not_found: the database name at the end of DATABASE_URL is wrong";
  if (/ssl|certificate/i.test(msg)) return "ssl: secure connection failed";
  if (/^(42|23)/.test(code)) return "schema: creating the tables failed (" + code + ")";
  return "unknown" + (code ? " (" + code + ")" : "");
}

module.exports = { Fail, bad, reasonOf };
