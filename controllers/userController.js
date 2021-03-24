const { ValidationError } = require("../errors");
const User = require("../models/User");

function saveSessionAfterLoginOrRegister(req, res, user) {
  req.session.user = {
    gravatar: user.gravatar,
    username: user.data.username,
    userId: user.data._id,
  };
  req.session.save((err) => {
    if (err) console.log(err);
    res.redirect("/");
  });
}

function handleErrorWhenLoginOrRegister(req, res, err, action) {
  if (err instanceof ValidationError) {
    req.flash(action === "login" ? "errors" : "regErrors", err.message);
  } else {
    req.flash("errors", "Please try again later.");
    console.log(err);
  }
  req.session.save(() => {
    res.redirect("/");
  });
}

exports.mustBeLoggedIn = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash("errors", "You must be logged in to perform that action.");
    req.session.save(() => {
      res.redirect("/");
    });
  }
};

exports.home = function (req, res) {
  if (req.session.user) {
    res.render("home-dashboard");
  } else {
    res.render("home-guest", {
      errors: req.flash("errors"),
      regErrors: req.flash("regErrors"),
    });
  }
};

exports.register = function (req, res) {
  console.log("Data submitted", req.body);
  const user = new User(req.body);
  user
    .register()
    .then(() => {
      saveSessionAfterLoginOrRegister(req, res, user);
    })
    .catch((err) => {
      handleErrorWhenLoginOrRegister(req, res, err, "register");
    });
};

exports.login = function (req, res) {
  const user = new User(req.body);
  user
    .login()
    .then(() => {
      saveSessionAfterLoginOrRegister(req, res, user);
    })
    .catch((err) => {
      handleErrorWhenLoginOrRegister(req, res, err, "login");
    });
};

exports.logout = function (req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
