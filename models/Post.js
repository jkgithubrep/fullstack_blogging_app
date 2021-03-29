const { ValidationError, RequestParamError } = require("../errors");
const { ObjectID } = require("mongodb");
const User = require("./User");
const postsCollection = require("../db").db().collection("posts");

class Post {
  static async reusablePostQuery(uniqueOperations) {
    const commonOperations = [
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDoc",
        },
      },
      {
        $project: {
          title: 1,
          body: 1,
          createdDate: 1,
          author: {
            $arrayElemAt: ["$authorDoc", 0],
          },
        },
      },
      {
        $project: {
          author: {
            password: 0,
          },
        },
      },
    ];
    const aggOperations = [...uniqueOperations, ...commonOperations];
    const posts = await postsCollection.aggregate(aggOperations).toArray();
    return posts;
  }

  static async findSingleById(postId, visitorId) {
    if (typeof postId !== "string" || !ObjectID.isValid(postId)) {
      throw new RequestParamError("Invalid post id");
    }
    const posts = await this.reusablePostQuery([
      { $match: { _id: new ObjectID(postId) } },
    ]);
    let post = posts[0];
    post.isOwnedByVisitor = post.author._id.equals(visitorId);
    post.author.gravatar = new User({
      email: post.author.email,
    }).getGravatar().gravatar;
    return new Post(post);
  }

  static async findByAuthorId(authorId) {
    return await this.reusablePostQuery([
      { $match: { author: authorId } },
      { $sort: { createdDate: -1 } },
    ]);
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
