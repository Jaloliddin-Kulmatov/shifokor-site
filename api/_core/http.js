// JSON responses and request bodies.
function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}
// RFC 7807 problem details, for the REST API (/api/v1)
function problem(res, status, code) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/problem+json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify({ type: "about:blank", title: code, status }));
}
function bodyOf(req) {
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
  return body && typeof body === "object" ? body : null;
}

module.exports = { send, problem, bodyOf };
