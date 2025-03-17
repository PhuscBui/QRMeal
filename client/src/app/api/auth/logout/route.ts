import authApiRequest from "@/apiRequests/auth";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();
  const accessToken = (await cookieStore).get("access_token")?.value;
  const refreshToken = (await cookieStore).get("refresh_token")?.value;
  (await cookieStore).delete("access_token");
  (await cookieStore).delete("refresh_token");

  if (!accessToken || !refreshToken) {
    return Response.json(
      {
        message: "Access token or refresh token is missing",
      },
      {
        status: 200,
      }
    );
  }

  try {
    const result = await authApiRequest.sLogout({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return Response.json(result.payload);
  } catch (error) {
    return Response.json(
      {
        message: "Internal server error",
      },
      {
        status: 200,
      }
    );
  }
}
