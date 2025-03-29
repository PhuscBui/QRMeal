import guestApiRequest from "@/apiRequests/guest";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  if (!accessToken || !refreshToken) {
    return Response.json(
      {
        message: "Không nhận được access token hoặc refresh token",
      },
      {
        status: 200,
      }
    );
  }
  try {
    const result = await guestApiRequest.sLogout({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return Response.json(result.payload);
  } catch (error) {
    console.log(error);
    return Response.json(
      {
        message: "Lỗi khi gọi API đến server backend",
      },
      {
        status: 200,
      }
    );
  }
}
