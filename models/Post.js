const { ValidationError, RequestParamError } = require("../errors");
const { ObjectID } = require("mongodb");
const User = require("./User");
const Follow = require("./Follow");
const postsCollection = require("../db").db().collection("posts");
const sanitizeHTML = require("sanitize-html");

class Post {
  static async reusablePostQuery(uniqueOperations, finalOperations = []) {
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
    const aggOperations = [
      ...uniqueOperations,
      ...commonOperations,
      ...finalOperations,
    ];
    const posts = await postsCollection.aggregate(aggOperations).toArray();
    return posts;
  }

  static async findSingleById(postId, visitorId) {
    if (typeof postId !== "string" || !ObjectID.isValid(postId)) {
      throw new RequestParamError("Invalid post id.");
    }
    const posts = await this.reusablePostQuery([
      { $match: { _id: new ObjectID(postId) } },
    ]);
    let post = posts[0];
    // Valid mongodb id but post id not found in the database
    if (!post) throw new RequestParamError("Invalid post id.");
    post.isOwnedByVisitor = post.author._id.equals(visitorId);
    post.author.gravatar = new User({
      email: post.author.email,
    }).getGravatar().gravatar;
    return new Post(post, visitorId, postId);
  }

  static async findByAuthorId(authorId) {
    return await this.reusablePostQuery([
      { $match: { author: authorId } },
      { $sort: { createdDate: -1 } },
    ]);
  }

  static async getFeed(userId) {
    let followingIds = await Follow.getFollowingIds(ObjectID(userId));
    let feed = await this.reusablePostQuery([
      { $match: { author: { $in: followingIds } } },
      { $sort: { createdDate: -1 } },
    ]);
    feed.forEach((post) => {
      post.author.gravatar = new User({
        email: post.author.email,
      }).getGravatar().gravatar;
    });
    return feed;
  }

  static async search(pattern) {
    if (typeof pattern !== "string")
      throw new RequestParamError("Invalid search pattern.");
    let posts = await this.reusablePostQuery(
      [{ $match: { $text: { $search: pattern } } }],
      [{ $sort: { score: { $meta: "textScore" } } }]
    );
    posts.forEach((post, index) => {
      post.author.gravatar = new User({
        email: post.author.email,
      }).getGravatar().gravatar;
      post.author._id = undefined;
      post.author.email = undefined;
      posts[index] = new Post(post);
      posts[index].formatDateForDisplay();
    });
    return posts;
  }

  static async countPosts(userId) {
    return postsCollection.find({ author: userId }).count();
  }

  constructor(data, userId, requestedPostId) {
    this.data = data;
    this.userId = userId ? new ObjectID(userId) : undefined;
    this.requestedPostId = requestedPostId
      ? new ObjectID(requestedPostId)
      : undefined;
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
      title: data.title ? sanitizeHTML(data.title.trim()) : "",
      body: data.body ? sanitizeHTML(data.body.trim()) : "",
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
    let result = await postsCollection.insertOne(this.data);
    return result.insertedId;
  }

  async update() {
    this.cleanUp();
    this.validate();
    await postsCollection.findOneAndUpdate(
      { _id: this.requestedPostId },
      {
        $set: {
          title: this.data.title,
          body: this.data.body,
        },
      }
    );
  }

  async delete() {
    await postsCollection.findOneAndDelete({ _id: this.requestedPostId });
  }
}

module.exports = Post;
