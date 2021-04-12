const Post = require("../models/Post");
const User = require("../models/User");
const { ValidationError, RequestParamError } = require("../errors");

exports.displayCreateScreen = function (req, res) {
  res.render("create-post");
};

exports.create = function (req, res) {
  const post = new Post(req.body, req.session.user.userId);
  post
    .create()
    .then((postId) => {
      res.redirect(`/post/${postId}`);
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

exports.apiCreate = function (req, res) {
  const post = new Post(req.body, req.apiUser._id);
  post
    .create()
    .then((postId) => {
      res.json(`Post ${postId} successfully created.`);
    })
    .catch((err) => {
      let errorMessage = err.message;
      if (!(err instanceof ValidationError)) {
        errorMessage = "Please try again later.";
        console.log(err);
      }
      res.json(errorMessage);
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

exports.delete = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    if (!post.data.isOwnedByVisitor) {
      throw new ValidationError(
        "You do not have the permission to perform that action"
      );
    }
    await post.delete();
    req.flash("success", "Post successfully deleted");
    req.session.save(() =>
      res.redirect(`/profile/${post.data.author.username}`)
    );
  } catch (err) {
    if (err instanceof RequestParamError || err instanceof ValidationError) {
      req.flash("errors", err.message);
    } else {
      req.flash("errors", "Please try again later");
      console.log(err);
    }
    req.session.save(() => res.redirect("/"));
  }
};

exports.apiDelete = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.apiUser._id);
    if (!post.data.isOwnedByVisitor) {
      throw new ValidationError(
        "You do not have the permission to perform that action"
      );
    }
    await post.delete();
    res.json("Post successfully deleted.");
  } catch (err) {
    let errorMessage = err.message;
    if (!(err instanceof RequestParamError || err instanceof ValidationError)) {
      errorMessage = "Please, try again later.";
      console.log(err);
    }
    res.json(errorMessage);
  }
};

exports.search = async function (req, res) {
  try {
    let posts = await Post.search(req.body.searchTerms);
    res.send(posts);
  } catch (err) {
    console.log(err);
    res.sendStatus(404);
  }
};

exports.getPostsByAuthor = async function (req, res) {
  try {
    const userFound = await User.findUserByUsername(req.params.username);
    const posts = await Post.findByAuthorId(userFound._id);
    res.json(posts);
  } catch (err) {
    res.json("Invalid request.");
  }
};
