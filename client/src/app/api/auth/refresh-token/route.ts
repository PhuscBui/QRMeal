import authApiRequest from "@/apiRequests/auth";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST() {
  const cookieStore = cookies();
  const refreshToken = (await cookieStore).get("refresh_token")?.value;
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
    const { payload } = await authApiRequest.sRefreshToken({
      refresh_token: refreshToken,
    });

    const decodedAccessToken = jwt.decode(payload.result.access_token) as {
      exp: number;
    };
    const decodedRefreshToken = jwt.decode(payload.result.refresh_token) as {
      exp: number;
    };
    (await cookieStore).set("accessToken", payload.result.access_token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: decodedAccessToken.exp * 1000,
    });
    (await cookieStore).set("refreshToken", payload.result.refresh_token, {
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
