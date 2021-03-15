const express = require("express");
const router = require("./router");

const app = express();

/**
 * Use built-in middleware to parse incoming requests with urlencoded payloads.
 * A new body object containing the parsed data is populated on the request
 * object after the middleware.
 */
app.use(express.urlencoded({ extended: false }));

/**
 * Use built-in middleware to parse incoming requests with JSON payloads.
 * A new body object containing the parsed data is populated on the request
 * object after the middleware.
 */
app.use(express.json());

// Indicate express to use static files in the public folder.
app.use(express.static("public"));

// Indicate express where to find the HTML templates.
app.set("views", "views");

// Indicate express where which template engine to use.
app.set("view engine", "ejs");

// App will handle requests using the router defined in router.js.
app.use("/", router);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
