var express = require("express");
const fetch = require("node-fetch");
var router = express.Router();

router.get("/stores/:lat/:lng/:m", async (req, res, next) => {
  const { lat, lng, m } = req.params;
  const url = `https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/storesByGeo/json?lat=${lat}&lng=${lng}&m=${m}`;
  const headers = {
    "Content-Type": "application/json; charset=utf-8"
  };
  const response = await fetch(url, {
    method: "get",
    headers: headers
  });
  const json = await response.json();
  res.json(json);
});

module.exports = router;
