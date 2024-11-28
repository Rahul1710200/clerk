import { useUser } from "@clerk/nextjs";

export default function Dashboard() {
  const { user } = useUser();
  const shopifyAccessToken = user?.publicMetadata?.shopifyAccessToken;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Your Shopify Access Token: {shopifyAccessToken}</p>
    </div>
  );
}
