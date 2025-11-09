const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// DB_Username = community-cleanliness-db
// DB_Password = SINbWMGDblb8O8Y1

const uri =
  "mongodb+srv://community-cleanliness-db:SINbWMGDblb8O8Y1@users.xgs9b3y.mongodb.net/?appName=Users";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("community-cleanliness-db");
    const issuesCollection = db.collection("issues");

    app.get("/issues", async (req, res) => {
      const cursor = issuesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/recent-issues", async (req, res) => {
        const projectFields = {title : 1, description : 1, category : 1, location : 1}
      const cursor = issuesCollection.find().sort({date : -1}).limit(6).project(projectFields);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/issues", async (req, res) => {
      const newIssue = req.body;
      const result = await issuesCollection.insertOne(newIssue);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Community Server is running");
});

app.listen(port, () => {
  console.log(`Community server is running on port: ${port}`);
});
