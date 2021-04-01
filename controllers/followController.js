const Follow = require("../models/Follow");

exports.addFollow = async function (req, res) {
  try {
    const follow = new Follow(req.params.username, req.visitorId);
    await follow.addFollow();
    req.flash("success", "You are now following this profile.");
    req.session.save(() => res.redirect(`/profile/${req.params.username}`));
  } catch (err) {
    console.log(err);
    res.render("404");
  }
};

exports.removeFollow = async function (req, res) {
  try {
    const follow = new Follow(req.params.username, req.visitorId);
    await follow.removeFollow();
    req.flash("success", "You do not follow this profile anymore.");
    req.session.save(() => res.redirect(`/profile/${req.params.username}`));
  } catch (err) {
    console.log(err);
    res.render("404");
  }
};
