const dotenv = require("dotenv");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");

const corsHandler = cors({ origin: true });

const getUnitAmount = (priceOption) => {
  switch (priceOption) {
    case "basic":
      return 1000;
    case "silver":
      return 2000;
    case "gold":
      return 3000;
    default:
      throw new Error("Invalid price option");
  }
};

const handleRequest = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { priceOption } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Test Product",
            },
            unit_amount: getUnitAmount(priceOption),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while creating the checkout session.",
    });
  }
};

module.exports = (req, res) => {
  corsHandler(req, res, () => handleRequest(req, res));
};
