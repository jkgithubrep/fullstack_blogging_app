const Post = require("../models/Post");
const { ValidationError } = require("../errors");

exports.viewCreateScreen = function (req, res) {
  res.render("create-post", { postErrors: req.flash("postErrors") });
};

exports.create = function (req, res) {
  const post = new Post(req.body);
  post
    .create()
    .then(() => {
      res.send("Post successfully created");
    })
    .catch((err) => {
      console.log(err);
      if (err instanceof ValidationError) {
        req.flash("postErrors", err.message);
      } else {
        req.flash("postErrors", "Please try again later");
        console.log(err);
      }
      req.session.save(() => {
        res.redirect("/create-post");
      });
    });
};
