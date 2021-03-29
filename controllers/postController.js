const Post = require("../models/Post");
const { ValidationError, RequestParamError } = require("../errors");

exports.displayCreateScreen = function (req, res) {
  res.render("create-post");
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
        req.flash("errors", err.message);
      } else {
        req.flash("errors", "Please try again later");
        console.log(err);
      }
      req.session.save(() => {
        res.redirect("/create-post", { errors: req.flash("errors") });
      });
    });
};

exports.displayViewSingleScreen = async function (req, res) {
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

exports.displayEditScreen = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    if (!post.data.isOwnedByVisitor)
      throw new ValidationError(
        "You do not have the permission to access this page."
      );
    res.render("edit-post", { post: post.data });
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

exports.edit = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    if (!post.data.isOwnedByVisitor) {
      throw new ValidationError(
        "You do not have the permission to perform that action"
      );
    }
    post.data = {
      title: req.body.title,
      body: req.body.body,
    };
    await post.update();
    req.flash("success", "Post successfully updated");
    req.session.save(() => res.redirect(`/post/${req.params.id}`));
  } catch (err) {
    if (err instanceof ValidationError) {
      req.flash("errors", err.message);
      req.session.save(() => res.redirect(`/post/${req.params.id}/edit`));
    } else {
      if (err instanceof RequestParamError) {
        req.flash("errors", err.message);
      } else {
        req.flash("errors", "Please try again later");
        console.log(err);
      }
      req.session.save(() => res.redirect("/"));
    }
  }
};
