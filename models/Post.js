const { ValidationError, RequestParamError } = require("../errors");
const { ObjectID } = require("mongodb");
const postsCollection = require("../db").db().collection("posts");

class Post {
  static async findSingleById(id) {
    if (typeof id !== "string" || !ObjectID.isValid(id)) {
      throw new RequestParamError("Invalid post id");
    }
    const postData = await postsCollection.findOne({ _id: new ObjectID(id) });
    return new Post(postData);
  }

  constructor(data, userId) {
    this.data = data;
    this.userId = new ObjectID(userId);
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

  addMetaData() {
    this.data.createdDate = new Date();
    this.data.author = this.userId;
  }

  formatDateForDisplay() {
    const date = this.data.createdDate;
    console.log(date);
    this.data.dateFormatted = date
      ? `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
      : "";
  }

  async create() {
    this.cleanUp();
    this.validate();
    this.addMetaData();
    await postsCollection.insertOne(this.data);
  }
}

module.exports = Post;
