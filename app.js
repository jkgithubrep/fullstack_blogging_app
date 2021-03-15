const express = require("express");
const router = require("./router");

const app = express();

// Indicate express to use static files in the public folder
app.use(express.static("public"));
// Indicate express where to find the HTML templates
app.set("views", "views");
// Indicate express where which template engine to use
app.set("view engine", "ejs");
// App will handle requests using the router defined in router.js
app.use("/", router);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
