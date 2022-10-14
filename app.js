var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var hbs = require("express-handlebars");
var app = express();
var session = require("express-session");
var db = require("./config/connection");
var app = express();
var fileUpload = require("express-fileupload");
let helpers = require("handlebars-helpers")();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use((req, res, next) => {
  if (!req.user) {
    res.header(
      "Cache-Control",
      "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
  }
  next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.engine(
  "hbs",
  hbs.engine({
    helpers: {
      inc: function (value, options) {
        return parseInt(value) + 1;
      }
    },
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partial/",
  })
);
app.use(session({ secret: "Key", cookie: { maxAge: 6000000 } }));
app.use(fileUpload());

db.connect((err) => {                                 
  if (err) console.log("Connection Error");
  else console.log("Connected");
});
app.use("/", indexRouter); 
app.use("/admin", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});  

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {}; 

  // render the error page
  res.status(err.status || 500);  
  res.render("error");     
});

module.exports = app;  