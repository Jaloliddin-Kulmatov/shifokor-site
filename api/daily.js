// Vercel runs this once a day at 10:00 Tashkent time (vercel.json "crons"): the follow-up checks after consultations.
const app = require("./app");
module.exports = (req, res) => { req.url = "/api/app?cron=daily"; return app(req, res); };
