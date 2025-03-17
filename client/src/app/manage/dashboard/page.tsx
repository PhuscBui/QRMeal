import accountApiRequest from "@/apiRequests/account";
import { cookies } from "next/headers";

export default async function Dashboard() {
  const cookieStore = cookies();
  const accessToken = (await cookieStore).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }
  let name = "";
  try {
    const result = await accountApiRequest.sMe(accessToken);
    name = result.payload.result.name;
  } catch (error: any) {
    if (error.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }
  }
  return <div>Dashboard {name}</div>;
}
