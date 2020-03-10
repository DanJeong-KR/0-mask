const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const prettyjson = require("prettyjson");
const cors = require("cors");

const indexRouter = require("./routes/index");

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// morgan loger
morgan.token("header", function getBody(req) {
  const headers = { ...req.headers, "x-access-token": "" };
  return `** HEADER **\n${prettyjson.render(headers)}`;
});
morgan.token("body", function getBody(req) {
  return req.body ? `** BODY **\n${prettyjson.render(req.body)}` : "-";
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use(morgan("combined"))
// app.use(morgan(":header"))
// app.use(morgan(":body"))
app.use(cors());

app.use("/", indexRouter);

// Error handler
app.use(function onError(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  const error = {
    project: config.project,
    version: config.version,
    host: req.headers.host,
    "user-agent": req.headers["user-agent"],
    url: req.url,
    status: err.status || 500,
    method: req.method,
    message: err.message || err.text || "There was an error on API server",
    env: process.env.NODE_ENV
  };

  res.status(err.status || 500).json(error);
});

module.exports = app;
