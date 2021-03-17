const userCollection = require("../db").collection("users");
const validator = require("validator");

class User {
  constructor(data) {
    this.data = data;
  }

  cleanUp() {
    const data = this.data;

    // Remove bogus properties
    this.data = {
      username: data.username ? data.username.trim().toLowerCase() : "",
      email: data.email ? data.email.trim().toLowerCase() : "",
      password: data.password,
    };

    // Sanitize data
    const entries = Object.entries(data);
    for (const [key, value] of entries) {
      if (typeof value !== "string") data[key] = "";
    }
  }

  verifyUsername() {
    const { username } = this.data;
    if (username == "") throw new Error("Username can not be empty.");
    if (!validator.isAlphanumeric(username))
      throw new Error("Username can only contain letters and numbers.");
    if (username.length < 3)
      throw new Error("Username should have at least 3 characters.");
    if (username.length > 50)
      throw new Error("Username should not exceed 50 characters.");
  }

  verifyEmail() {
    const { email } = this.data;
    if (!validator.isEmail(email)) throw new Error("Invalid email address.");
  }

  validate() {
    this.verifyUsername();
    this.verifyEmail();
    console.log("User is valid");
  }

  register() {
    this.cleanUp();
    this.validate();
    userCollection.insertOne(this.data);
  }
}

module.exports = User;
