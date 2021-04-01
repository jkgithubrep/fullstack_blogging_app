const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");
const followController = require("./controllers/followController");

// User routes
router.get("/", userController.home);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

router.get(
  "/profile/:username",
  userController.ifUserExists,
  userController.sharedProfileData,
  userController.displayProfileScreen
);

router.get(
  "/profile/:username/followers",
  userController.ifUserExists,
  userController.sharedProfileData,
  userController.displayFollowersScreen
);

router.get(
  "/profile/:username/following",
  userController.ifUserExists,
  userController.sharedProfileData,
  userController.displayFollowingScreen
);

// Posts routes
router.get(
  "/create-post",
  userController.mustBeLoggedIn,
  postController.displayCreateScreen
);

router.post(
  "/create-post",
  userController.mustBeLoggedIn,
  postController.create
);

// The route parameter "id" will be available in the req.params object
// See: https://expressjs.com/en/guide/routing.html#route-parameters
router.get("/post/:id", postController.displayViewSingleScreen);
router.get(
  "/post/:id/edit",
  userController.mustBeLoggedIn,
  postController.displayEditScreen
);
router.post(
  "/post/:id/edit",
  userController.mustBeLoggedIn,
  postController.edit
);
router.post(
  "/post/:id/delete",
  userController.mustBeLoggedIn,
  postController.delete
);

// router.post("/search", userController.mustBeLoggedIn, postController.search);
router.post("/search", postController.search);

// Follow routes
router.post(
  "/addFollow/:username",
  userController.mustBeLoggedIn,
  followController.addFollow
);

router.post(
  "/removeFollow/:username",
  userController.mustBeLoggedIn,
  followController.removeFollow
);

module.exports = router;
