const User = require("../models/User");

exports.home = function (req, res) {
  res.render("home-guest");
};

exports.register = function (req, res) {
  console.log("Data submitted", req.body);
  const user = new User(req.body);
  try {
    user.register();
    res.send("User successfully registered");
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
};
