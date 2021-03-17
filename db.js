require("dotenv").config();
const { MongoClient } = require("mongodb");

const database = "jsFullStackApp";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.o6yjh.mongodb.net/${database}`;

const client = new MongoClient(uri, {
  useUnifiedTopology: true,
});

async function connectDB() {
  try {
    // Connect the client to the server
    await client.connect();

    // Establish and verify connection
    await client.db("admin").command({ ping: 1 });

    module.exports = client.db();
    console.log("Connected successfully to the database server");
  } catch (err) {
    await client.close();
    throw err;
  }
}

connectDB()
  .then(() => {
    const app = require("./app");
    app.listen(process.env.PORT, () => {
      console.log(`Listening on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
