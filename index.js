const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const admin = require("firebase-admin");

app.use(cors());
app.use(express.json());

// const serviceAccount = require("");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });


// const verifyToken = async (req, res, next) =>{
//   if(!req.headers.authorization){
//     return res.status(401).send({message : "Unauthorized Access"})
//   }
//   const token = req.headers.authorization.split(' ')[1]
//   if(!token){
//     return res.status(401).send({message : "Unauthorized Access"})
//   }
//   try{
//     // console.log(token);
//     userInfo = await admin.auth().verifyIdToken(token)
//     req.tokenEmail = userinfo.email
//     console.log(userInfo.email);
    
//     next()
//   }
//   catch {
//     return res.status(401).send({message : "Unauthorized access"})
//   }
// }

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@users.xgs9b3y.mongodb.net/?appName=Users`;

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
    // await client.connect();

    const db = client.db("community-cleanliness-db");
    const issuesCollection = db.collection("issues");
    const contributionCollection = db.collection("contributions");

    app.get("/issues", async (req, res) => {
      console.log('headers', req.headers)
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = issuesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/recent-issues", async (req, res) => {
      const projectFields = {
        title: 1,
        description: 1,
        category: 1,
        location: 1,
      };
      const cursor = issuesCollection
        .find()
        .sort({ date: -1 })
        .limit(6)
        .project(projectFields);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/issues/:id",  async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await issuesCollection.findOne(query);
      res.send(result);
    });

    app.put("/issues/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id, req.body);
      
      const updatedIssueData = req.body;
      const filter = { _id: new ObjectId(id)};
      const updatedData = {
        $set: updatedIssueData
      }
      const result = await issuesCollection.updateOne(filter, updatedData);
      res.send(result);
    });

    app.delete("/issues/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await issuesCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/issues/contribution/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = contributionCollection.find({ issueId: id });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/issues", async (req, res) => {
      const newIssue = req.body;
      const result = await issuesCollection.insertOne(newIssue);
      res.send(result);
    });

    app.get("/contribution", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = contributionCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/contribution", async (req, res) => {
      const newContribution = req.body;
      const result = await contributionCollection.insertOne(newContribution);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
