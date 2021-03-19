const { ValidationError } = require("../errors");
const User = require("../models/User");

exports.home = function (req, res) {
  if (req.session.user) {
    res.render("home-dashboard", {
      username: req.session.user.username,
      gravatar: req.session.user.gravatar,
    });
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
      req.session.user = {
        gravatar: user.gravatar,
        username: user.data.username,
      };
      req.session.save(() => {
        res.redirect("/");
      });
    })
    .catch((err) => {
      if (err instanceof ValidationError) {
        req.flash("regErrors", err.message);
      } else {
        req.flash("regErrors", "Please try again later.");
      }
      req.session.save(() => {
        res.redirect("/");
      });
    });
};

exports.login = function (req, res) {
  const user = new User(req.body);
  user
    .login()
    .then(() => {
      req.session.user = {
        gravatar: user.gravatar,
        username: user.data.username,
      };
      req.session.save((err) => {
        if (err) console.log(err);
        res.redirect("/");
      });
    })
    .catch((err) => {
      req.flash("errors", err.message);
      req.session.save(() => {
        res.redirect("/");
      });
    });
};

exports.logout = function (req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
