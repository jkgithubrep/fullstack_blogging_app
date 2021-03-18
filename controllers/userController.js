const { ValidationError } = require("../errors");
const User = require("../models/User");

exports.home = function (req, res) {
  res.render("home-guest");
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
      console.log("User successfully logged in");
      res.send("You're logged in");
    })
    .catch((err) => {
      console.log(err.message);
      res.redirect("/");
    });
};
