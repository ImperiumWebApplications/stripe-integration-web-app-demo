import { Button } from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";
import "./App.css";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
  const handleCheckout = async () => {
    const stripe = await stripePromise;

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        <Button variant="contained" color="primary" onClick={handleCheckout}>
          Checkout
        </Button>
      </header>
    </div>
  );
}

export default App;
