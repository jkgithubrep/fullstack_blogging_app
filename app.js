const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const markdown = require("marked");
const router = require("./router");
const apiRouter = require("./router-api");
const csrf = require("csurf");

const app = express();

/**
 * Use built-in middleware to parse incoming requests with urlencoded payloads.
 * A new body object containing the parsed data is populated on the request
 * object after the middleware.
 */
app.use(express.urlencoded({ extended: false }));

/**
 * Use built-in middleware to parse incoming requests with JSON payloads.
 * A new body object containing the parsed data is populated on the request
 * object after the middleware.
 */
app.use(express.json());

app.use("/api", apiRouter);

// Use express-session middleware
let sessionOptions = {
  secret: "This is my secret",
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ client: require("./db") }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    sameSite: true,
  },
};
app.use(session(sessionOptions));

// Use flash middleware to handle flash messages
app.use(flash());

// Indicate express to use static files in the public folder.
app.use(express.static("public"));

// Indicate express where to find the HTML templates.
app.set("views", "views");

// Indicate express where which template engine to use.
app.set("view engine", "ejs");

/**
 * Add middleware to store several infos in the response locals variable
 * and therefore make it available to the views rendered during that request /
 * response cycle.
 */

app.use(csrf());

app.use(function (req, res, next) {
  res.locals.renderMarkdown = function (content) {
    return markdown(content);
  };
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");
  res.locals.user = req.session.user;
  res.locals.csrfToken = req.csrfToken();

  req.visitorId = req.session.user ? req.session.user.userId : 0;
  next();
});

app.use(function (err, req, res, next) {
  if (err) {
    if (err.code === "EBADCSRFTOKEN") {
      req.flash("errors", "Cross-site request scripting not allowed.");
      req.session.save(() => res.redirect("/"));
    } else {
      res.render("404");
    }
  } else {
    next();
  }
});

// App will handle requests using the router defined in router.js.
app.use("/", router);

module.exports = app;
