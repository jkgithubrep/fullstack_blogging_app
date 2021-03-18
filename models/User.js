const { ValidationError } = require("../errors");
const usersCollection = require("../db").db().collection("users");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

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

  async verifyEmail() {
    const { email } = this.data;
    if (!validator.isEmail(email))
      throw new ValidationError("Invalid email address.");
    const userFound = await usersCollection.findOne({ email: email });
    if (userFound) throw new ValidationError("Email address already used.");
  }

  verifyPassword() {
    const { password } = this.data;
    if (password.length < 8)
      throw new ValidationError("Password must have at least 12 characters.");
    if (password.lenght > 50)
      throw new ValidationError("Password should not exceed 50 characters.");
  }

  async validate() {
    await this.verifyUsername();
    await this.verifyEmail();
    this.verifyPassword();
  }

  async register() {
    this.cleanUp();
    await this.validate();
    this.data.password = await bcrypt.hash(this.data.password, saltRounds);
    await usersCollection.insertOne(this.data);
  }

  async login() {
    this.cleanUp();
    const userFound = await usersCollection.findOne({
      username: this.data.username,
    });
    if (!userFound) throw new ValidationError("Invalid username or password ");
    const match = await bcrypt.compare(this.data.password, userFound.password);
    if (!match) throw new ValidationError("Invalid username or password");
  }
}

module.exports = User;
