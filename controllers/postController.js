exports.viewCreateScreen = function (req, res) {
  res.render("create-post", { gravatar: req.session.user.gravatar });
};
