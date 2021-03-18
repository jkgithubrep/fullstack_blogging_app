const { ValidationError } = require("../errors");
const usersCollection = require("../db").collection("users");
const validator = require("validator");

class User {
  constructor(data) {
    this.data = data;
    this.errors = [];
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

  async verifyUsername() {
    const { username } = this.data;
    if (username == "") throw new ValidationError("Username can not be empty.");
    if (!validator.isAlphanumeric(username))
      throw new ValidationError(
        "Username can only contain letters and numbers."
      );
    if (username.length < 3)
      throw new ValidationError("Username should have at least 3 characters.");
    if (username.length > 50)
      throw new ValidationError("Username should not exceed 50 characters.");
    const userFound = await usersCollection.findOne({ username: username });
    if (userFound) throw new ValidationError("Username already exists.");
  }

  verifyEmail() {
    const { email } = this.data;
    if (!validator.isEmail(email))
      throw new ValidationError("Invalid email address.");
  }

  async validate() {
    await this.verifyUsername();
    this.verifyEmail();
    console.log("User is valid");
  }

  async register() {
    this.cleanUp();
    await this.validate();
    await usersCollection.insertOne(this.data);
  }

  async login() {
    this.cleanUp();
    const userFound = await usersCollection.findOne({
      username: this.data.username,
    });
    if (userFound) {
      return;
    } else {
      throw new ValidationError("Invalid username or password ");
    }
  }
}

module.exports = User;
