const { ValidationError } = require("../errors");
const postsCollection = require("../db").db().collection("posts");

class Post {
  constructor(data) {
    this.data = data;
  }

  cleanUp() {
    const data = this.data;

    // Sanitize data
    const entries = Object.entries(data);
    for (const [key, value] of entries) {
      if (typeof value !== "string") data[key] = "";
    }

    // Remove bogus properties
    this.data = {
      title: data.title ? data.title.trim() : "",
      body: data.body ? data.body.trim() : "",
    };
  }

  validate() {
    if (this.data.title == "")
      throw new ValidationError("You must provide a title.");
    if (this.data.body == "")
      throw new ValidationError("Post content cannot be empty.");
  }

  addCreatedDate() {
    this.data.createdDate = new Date();
  }

  async create() {
    this.cleanUp();
    this.validate();
    this.addCreatedDate();
    await postsCollection.insertOne(this.data);
  }
}

module.exports = Post;
