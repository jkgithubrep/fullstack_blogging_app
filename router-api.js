const apiRouter = require("express").Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");

apiRouter.post("/login", userController.apiLogin);
apiRouter.post(
  "/create-post",
  userController.apiMustBeLoggedIn,
  postController.apiCreate
);
apiRouter.delete(
  "/post/:id",
  userController.apiMustBeLoggedIn,
  postController.apiDelete
);
apiRouter.get("/postsByAuthor/:username", postController.getPostsByAuthor);

module.exports = apiRouter;