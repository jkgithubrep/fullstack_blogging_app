const { ValidationError, RequestParamError } = require("../errors");
const { ObjectID } = require("mongodb");
const User = require("./User");
const postsCollection = require("../db").db().collection("posts");

class Post {
  static async findSingleById(id) {
    if (typeof id !== "string" || !ObjectID.isValid(id)) {
      throw new RequestParamError("Invalid post id");
    }
    const posts = await postsCollection
      .aggregate([
        { $match: { _id: new ObjectID(id) } },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorDoc",
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [{ $arrayElemAt: ["$authorDoc", 0] }, "$$ROOT"],
            },
          },
        },
        {
          $project: {
            title: 1,
            body: 1,
            createdDate: 1,
            author: {
              username: "$username",
              email: "$email",
            },
          },
        },
      ])
      .toArray();
    let post = posts[0];
    post.author.gravatar = new User({
      email: post.author.email,
    }).getGravatar().gravatar;
    return new Post(post);
  }

  constructor(data, userId) {
    this.data = data;
    this.userId = userId ? new ObjectID(userId) : null;
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
