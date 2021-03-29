const Post = require("../models/Post");
const { ValidationError, RequestParamError } = require("../errors");

exports.viewCreateScreen = function (req, res) {
  res.render("create-post", { postErrors: req.flash("postErrors") });
};

exports.create = function (req, res) {
  const post = new Post(req.body, req.session.user.userId);
  post
    .create()
    .then(() => {
      res.send("Post successfully created");
    })
    .catch((err) => {
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

exports.viewSingle = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    post.formatDateForDisplay();
    res.render("single-post", { post: post.data });
  } catch (err) {
    if (err instanceof RequestParamError) {
      req.flash("errors", err.message);
    } else {
      req.flash("errors", "Please try again later");
      console.log(err);
    }
    req.session.save(() => {
      res.render("404");
    });
  }
};
