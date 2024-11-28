// pages/api/auth/callback/shopify.ts
import axios from "axios";

export default async function handler(req, res) {
  const { code, shop } = req.query;

  try {
    // Exchange the authorization code for an access token
    const response = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }
    );

    const { access_token } = response.data; // Token received from Shopify

    // Use the access token to fetch shop or user information (Example below)
    const shopData = await axios.get(
      `https://${shop}/admin/api/2023-10/shop.json`,
      {
        headers: {
          "X-Shopify-Access-Token": access_token,
        },
      }
    );

    console.log("Shop Data:", shopData.data);

    // Redirect the user to the app with the data or save the token
    res.redirect("http://localhost:3000"); // Adjust based on your flow
  } catch (error) {
    console.error("Error during token exchange:", error);
    res.status(500).send("Authentication failed");
  }
}
