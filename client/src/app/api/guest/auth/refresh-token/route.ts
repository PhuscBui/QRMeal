import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import guestApiRequest from "@/apiRequests/guest";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (!refreshToken) {
    return Response.json(
      {
        message: "Không tìm thấy refreshToken",
      },
      {
        status: 401,
      }
    );
  }
  try {
    const { payload } = await guestApiRequest.sRefreshToken({
      refresh_token: refreshToken,
    });

    const decodedAccessToken = jwt.decode(payload.result.access_token) as {
      exp: number;
    };
    const decodedRefreshToken = jwt.decode(payload.result.refresh_token) as {
      exp: number;
    };
    cookieStore.set("access_token", payload.result.access_token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: decodedAccessToken.exp * 1000,
    });
    cookieStore.set("refresh_token", payload.result.refresh_token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: decodedRefreshToken.exp * 1000,
    });
    return Response.json(payload);
  } catch (error: any) {
    console.log(error);
    return Response.json(
      {
        message: error.message ?? "Có lỗi xảy ra",
      },
      {
        status: 401,
      }
    );
  }
}
