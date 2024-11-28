import axios from "axios";
import { clerkClient } from "@clerk/nextjs/server";

// Your Shopify API credentials
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;

export default async function handler(req, res) {
  const { code, shop, state } = req.query;

  // Security measure: Verify the state to prevent CSRF
  if (state !== "your-randomly-generated-state") {
    return res.status(400).json({ error: "State mismatch" });
  }

  try {
    // Step 1: Exchange the authorization code for an access token
    const response = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code: code,
      }
    );

    const { access_token } = response.data;

    // Step 2: Fetch user info from Shopify using the access token
    const userInfoResponse = await axios.get(
      `https://${shop}/admin/api/2023-10/shop.json`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const user = userInfoResponse.data.shop;

    // Step 3: Check if user already exists in Clerk
    let clerkUser = await clerkClient.users.getUserList({
      emailAddress: user.email, // Use Shopify email to search in Clerk
    });

    if (clerkUser.length === 0) {
      // Step 4: If the user does not exist, create a new user in Clerk
      clerkUser = await clerkClient.users.createUser({
        first_name: user.name,
        email_addresses: [{ email: user.email }],
      });
    } else {
      // Step 5: If the user exists, you can either update them or use the existing user
      clerkUser = clerkUser[0];
    }

    // Step 6: Create a session for the Clerk user
    await clerkClient.sessions.createSession({
      userId: clerkUser.id,
    });

    // Step 7: Redirect the user to the dashboard or home page after login
    res.redirect(`/dashboard`);
  } catch (error) {
    console.error("Error exchanging code for access token", error);
    res.status(500).json({ error: "Failed to exchange code for access token" });
  }
}
