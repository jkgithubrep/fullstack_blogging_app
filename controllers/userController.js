const { ValidationError } = require("../errors");
const User = require("../models/User");

exports.home = function (req, res) {
  if (req.session.user) {
    res.render("home-dashboard", { username: req.session.user.username });
  } else {
    res.render("home-guest");
  }
};

exports.register = function (req, res) {
  console.log("Data submitted", req.body);
  const user = new User(req.body);
  user
    .register()
    .then(() => {
      res.send("User successfully registered");
    })
    .catch((err) => {
      if (err instanceof ValidationError) {
        res.send(err.message);
      } else {
        res.redirect("/");
      }
    });
};

exports.login = function (req, res) {
  const user = new User(req.body);
  user
    .login()
    .then(() => {
      req.session.user = { username: user.data.username };
      req.session.save((err) => {
        if (err) console.log(err);
        res.redirect("/");
      });
    })
    .catch((err) => {
      console.log(err.message);
      res.redirect("/");
    });
};

exports.logout = function (req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
