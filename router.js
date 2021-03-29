const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");

// User
router.get("/", userController.home);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

router.get(
  "/profile/:username",
  userController.ifUserExists,
  userController.displayProfileScreen
);

// Posts
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

module.exports = router;
