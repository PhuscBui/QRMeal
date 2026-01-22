"use client";

import { useAppContext } from "@/components/app-provider";
import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
} from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

function Logout() {
  const { mutateAsync } = useLogoutMutation();
  const router = useRouter();
  const { setRole, disconnectSocket  } = useAppContext();
  const searchParams = useSearchParams();
  const refreshTokenFromUrl = searchParams.get("refreshToken");
  const accessTokenFromUrl = searchParams.get("accessToken");
  const t = useTranslations('auth');
  
  const ref = useRef<
    UseMutateAsyncFunction<
      {
        status: number;
        payload: unknown;
      },
      Error,
      void,
      unknown
    >
  >(null);
  useEffect(() => {
    if (
      !ref.current &&
      ((refreshTokenFromUrl &&
        refreshTokenFromUrl === getRefreshTokenFromLocalStorage()) ||
        (accessTokenFromUrl &&
          accessTokenFromUrl === getAccessTokenFromLocalStorage()))
    ) {
      ref.current = mutateAsync;
      mutateAsync().then(() => {
        setTimeout(() => {
          ref.current = null;
        }, 1000);
        setRole();
        disconnectSocket();
        router.push("/login");
      });
    } else {
      router.push("/");
    }
  }, [mutateAsync, router, refreshTokenFromUrl, accessTokenFromUrl, setRole, disconnectSocket]);
  return <div>{t('logout')}....</div>;
}
export default function LogoutPage() {
  return (
    <Suspense>
      <Logout />
    </Suspense>
  );
}

