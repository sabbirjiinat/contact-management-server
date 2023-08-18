const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9a4nghi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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

    const userCollection = client.db("contactManagement").collection("users");
    const contactUserCollection = client
      .db("contactManagement")
      .collection("contactUsers");
    const sharedContactCollection = client
      .db("contactManagement")
      .collection("sharedContact");

    /* Get all users */
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    /*all users Save to mongoDB  */
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const option = { upsert: true };
      const updatedDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(query, updatedDoc, option);
      res.send(result);
    });

    /* Create new contact user  */
    app.post("/contactUsers", async (req, res) => {
      const user = req.body;
      const result = await contactUserCollection.insertOne(user);
      res.send(result);
    });

    /* Get all contact */
    app.get("/contactUsers", async (req, res) => {
      const email = req.query.postUserEmail;
      // const search = req.query.search;
      const query = { postUserEmail: email };
      // const searchQuery = { name: { $regex: search, $options: "i" } };
      // if (searchQuery) {
      //   const result = await contactUserCollection.find(searchQuery).toArray();
      //   res.send(result);
      // }else{

      const result = await contactUserCollection.find(query).toArray();
      res.send(result);
      // }
    });

    /* Patch single contact */
    app.patch("/contactUsers/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateUser = req.body;
      const updateDoc = {
        $set: {
          name: updateUser.name,
          email: updateUser.email,
          number: updateUser.number,
          image_url: updateUser.image_url,
        },
      };
      const result = await contactUserCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    /* Delete single contact */
    app.delete("/contactUsers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await contactUserCollection.deleteOne(query);
      res.send(result);
    });

    /* Get shared contact for logged in user */
    app.get('/sharedContact',async(req,res)=>{
      const email = req.query.sendTo;
      const query = {sendTo:email};
      const result = await sharedContactCollection.find(query).toArray();
      res.send(result);
    })

    /* Post Shared Contact */
    app.post("/sharedContact", async (req, res) => {
      const contact = req.body;
      const result = await sharedContactCollection.insertOne(contact);
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
  res.send(`Your contact management is running on port ${port}`);
});

app.listen(port, () => {
  console.log(`Your contact management is running on  ${port}`);
});
