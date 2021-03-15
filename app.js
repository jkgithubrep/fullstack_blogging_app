const express = require("express");

const app = express();

// Indicate express to use static files in the public folder
app.use(express.static("public"));
// Indicate express where to find the HTML templates
app.set("views", "views");
// Indicate express where which template engine to use
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("home-guest");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
