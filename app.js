const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const router = require("./router");

const app = express();

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

// Indicate express to use static files in the public folder.
app.use(express.static("public"));

// Indicate express where to find the HTML templates.
app.set("views", "views");

// Indicate express where which template engine to use.
app.set("view engine", "ejs");

/**
 * Add middleware to store user session info in the response local variable
 * and therefore make it available to the views rendered during that request /
 * response cycle.
 */
app.use(function (req, res, next) {
  req.visitorId = req.session.user ? req.session.user.userId : 0;
  res.locals.user = req.session.user;
  next();
});

// App will handle requests using the router defined in router.js.
app.use("/", router);

module.exports = app;
