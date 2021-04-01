const User = require("./User");
const { ObjectID } = require("mongodb");
const followsCollection = require("../db").db().collection("follows");

class Follow {
  static async reusableFollowQuery(uniqueOperations, finalOperations = []) {
    const commonOperations = [
      {
        $project: {
          _id: 0,
          username: {
            $arrayElemAt: ["$followerData.username", 0],
          },
          email: {
            $arrayElemAt: ["$followerData.email", 0],
          },
        },
      },
    ];

    const aggOperations = [
      ...uniqueOperations,
      ...commonOperations,
      ...finalOperations,
    ];

    const results = await followsCollection.aggregate(aggOperations).toArray();
    return results;
  }

  static async isFollowing(followedId, followingId) {
    let followDoc = await followsCollection.findOne({
      followedId: followedId,
      followingId: new ObjectID(followingId),
    });
    if (followDoc) return true;
    return false;
  }

  static async getFollowers(userId) {
    let followers = await this.reusableFollowQuery([
      {
        $match: { followedId: userId },
      },
      {
        $lookup: {
          from: "users",
          localField: "followingId",
          foreignField: "_id",
          as: "followerData",
        },
      },
    ]);

    followers.forEach((follower) => {
      follower.gravatar = new User({
        email: follower.email,
      }).getGravatar().gravatar;
    });

    return followers;
  }

  static async getFollowing(userId) {
    let following = await this.reusableFollowQuery([
      {
        $match: { followingId: userId },
      },
      {
        $lookup: {
          from: "users",
          localField: "followedId",
          foreignField: "_id",
          as: "followerData",
        },
      },
    ]);

    following.forEach((following) => {
      following.gravatar = new User({
        email: following.email,
      }).getGravatar().gravatar;
    });

    return following;
  }

  static async getFollowingIds(userId) {
    let followingIds = await followsCollection
      .aggregate([
        {
          $match: { followingId: userId },
        },
        {
          $project: {
            _id: 0,
            followedId: 1,
          },
        },
      ])
      .toArray();
    return followingIds.map((doc) => doc.followedId);
  }

  static countFollowers(id) {
    return followsCollection.find({ followedId: id }).count();
  }

  static countFollowing(id) {
    return followsCollection.find({ followingId: id }).count();
  }

  constructor(followedUsername, visitorId) {
    this.followedUsername = followedUsername;
    this.followingId = new ObjectID(visitorId);
  }

  async validate() {
    let followedUser = await User.findUserByUsername(this.followedUsername);
    this.followedId = followedUser._id;
  }

  async addFollow() {
    await this.validate();
    await followsCollection.insertOne({
      followedId: this.followedId,
      followingId: this.followingId,
    });
  }

  async removeFollow() {
    await this.validate();
    await followsCollection.findOneAndDelete({
      followedId: this.followedId,
      followingId: this.followingId,
    });
  }
}

module.exports = Follow;
