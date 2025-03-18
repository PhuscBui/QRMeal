import accountApiRequest from "@/apiRequests/account";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }
  let name = "";
  try {
    const result = await accountApiRequest.sMe(accessToken);
    name = result.payload.result.name;
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
  }
  return <div>Dashboard {name}</div>;
}
