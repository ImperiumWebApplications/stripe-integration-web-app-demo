const dotenv = require("dotenv");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");
const { ObjectId } = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
const { buffer } = require("micro");

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.yz6eyqz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const corsHandler = cors({ origin: true });

const storeCheckoutSession = async (session) => {
  try {
    await client.connect();
    const collection = client.db("test").collection("sessions");
    await collection.insertOne(session);
    console.log("Session stored in MongoDB");
  } catch (error) {
    console.error("Error storing session in MongoDB:", error);
  } finally {
    await client.close();
  }
};

const handleRequest = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }
  const rawBody = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userEmail = session.customer_details.email;

    const sessionToStore = {
      _id: new ObjectId(),
      sessionId: session.id,
      userEmail,
    };

    await storeCheckoutSession(sessionToStore);
  }

  res.status(200).json({ received: true });
};

module.exports = (req, res) => {
  corsHandler(req, res, () => handleRequest(req, res));
};
