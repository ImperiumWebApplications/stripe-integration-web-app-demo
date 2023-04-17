import { Button, Box } from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";
import "./App.css";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
  const handleCheckout = async (priceOption) => {
    const stripe = await stripePromise;

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceOption }),
      });

      const { sessionId } = await response.json();

      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="50%"
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleCheckout("basic")}
          >
            Basic
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleCheckout("silver")}
          >
            Silver
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleCheckout("gold")}
          >
            Gold
          </Button>
        </Box>
      </header>
    </div>
  );
}

export default App;
