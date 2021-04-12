const { ValidationError } = require("../errors");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");
const User = require("../models/User");
const Follow = require("../models/Follow");

function saveSessionAfterLoginOrRegister(req, res, user) {
  req.session.user = {
    gravatar: user.gravatar,
    username: user.data.username,
    userId: user.data._id,
  };
  req.session.save((err) => {
    if (err) console.log(err);
    res.redirect("/");
  });
}

function handleErrorWhenLoginOrRegister(req, res, err, action) {
  if (err instanceof ValidationError) {
    req.flash(action === "login" ? "errors" : "regErrors", err.message);
  } else {
    req.flash("errors", "Please try again later.");
    console.log(err);
  }
  req.session.save(() => {
    res.redirect("/");
  });
}

exports.mustBeLoggedIn = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash("errors", "You must be logged in to perform that action.");
    req.session.save(() => {
      res.redirect("/");
    });
  }
};

exports.apiMustBeLoggedIn = function (req, res, next) {
  try {
    req.apiUser = jwt.verify(req.body.token, process.env.JWTSECRET);
    next();
  } catch {
    res.json("Invalid token.");
  }
};

exports.home = async function (req, res) {
  try {
    if (req.session.user) {
      let feed = await Post.getFeed(req.session.user.userId);
      res.render("home-dashboard", { feed: feed });
    } else {
      res.render("home-guest", {
        regErrors: req.flash("regErrors"),
      });
    }
  } catch (err) {
    console.log(err);
    res.render("404");
  }
};

exports.register = function (req, res) {
  const user = new User(req.body);
  user
    .register()
    .then(() => {
      saveSessionAfterLoginOrRegister(req, res, user);
    })
    .catch((err) => {
      handleErrorWhenLoginOrRegister(req, res, err, "register");
    });
};

exports.login = function (req, res) {
  const user = new User(req.body);
  user
    .login()
    .then(() => {
      saveSessionAfterLoginOrRegister(req, res, user);
    })
    .catch((err) => {
      handleErrorWhenLoginOrRegister(req, res, err, "login");
    });
};

exports.apiLogin = function (req, res) {
  const user = new User(req.body);
  user
    .login()
    .then(() => {
      const userJwt = jwt.sign({ _id: user.data._id }, process.env.JWTSECRET, {
        expiresIn: "7d",
      });
      res.json(userJwt);
    })
    .catch(() => {
      res.json("Incorrect username or password");
    });
};

exports.logout = function (req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.ifUserExists = async function (req, res, next) {
  try {
    let requestedProfile = await User.findUserByUsername(req.params.username);
    if (requestedProfile) {
      req.requestedProfile = requestedProfile;
      next();
    }
  } catch (err) {
    console.log(err);
    res.render("404");
  }
};

exports.sharedProfileData = async function (req, res, next) {
  try {
    let requestedProfileId = req.requestedProfile._id;
    req.isVisitorOwnProfile = req.visitorId
      ? requestedProfileId.equals(req.visitorId)
      : false;
    if (req.visitorId) {
      req.visitorIsFollowingRequestedProfile = await Follow.isFollowing(
        requestedProfileId,
        req.visitorId
      );
    }
    [
      req.requestedProfile.countPosts,
      req.requestedProfile.countFollowers,
      req.requestedProfile.countFollowing,
    ] = await Promise.all([
      Post.countPosts(requestedProfileId),
      Follow.countFollowers(requestedProfileId),
      Follow.countFollowing(requestedProfileId),
    ]);
    next();
  } catch (err) {
    console.log(err);
    res.render("404");
  }
};

exports.displayProfileScreen = async function (req, res) {
  try {
    if (req.requestedProfile) {
      const userPosts = await Post.findByAuthorId(req.requestedProfile._id);
      res.render("profile", {
        view: "posts",
        profile: req.requestedProfile,
        posts: userPosts,
        visitorFollowing: req.visitorIsFollowingRequestedProfile,
        isVisitorOwnProfile: req.isVisitorOwnProfile,
      });
    } else {
      res.render("404");
    }
  } catch (err) {
    console.log(err);
    res.render("404");
  }
};

exports.displayFollowersScreen = async function (req, res) {
  try {
    if (req.requestedProfile) {
      const followers = await Follow.getFollowers(req.requestedProfile._id);
      res.render("profile-linked", {
        view: "followers",
        profile: req.requestedProfile,
        linkedProfiles: followers,
        visitorFollowing: req.visitorIsFollowingRequestedProfile,
        isVisitorOwnProfile: req.isVisitorOwnProfile,
      });
    } else {
      res.render("404");
    }
  } catch (err) {
    console.log(err);
    res.render("404");
  }
};

exports.displayFollowingScreen = async function (req, res) {
  try {
    if (req.requestedProfile) {
      const following = await Follow.getFollowing(req.requestedProfile._id);
      res.render("profile-linked", {
        view: "following",
        profile: req.requestedProfile,
        linkedProfiles: following,
        visitorFollowing: req.visitorIsFollowingRequestedProfile,
        isVisitorOwnProfile: req.isVisitorOwnProfile,
      });
    } else {
      res.render("404");
    }
  } catch (err) {
    console.log(err);
    res.render("404");
  }
};

exports.doesUsernameExist = async function (req, res) {
  try {
    await User.findUserByUsername(req.body.username);
    res.json(true);
  } catch (err) {
    res.json(false);
  }
};

exports.doesEmailExist = async function (req, res) {
  try {
    await User.findUserByEmail(req.body.email);
    res.json(true);
  } catch (err) {
    res.json(false);
  }
};
