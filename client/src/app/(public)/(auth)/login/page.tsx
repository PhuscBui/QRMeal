import LoginForm from "@/app/(public)/(auth)/login/login-form";
import { Suspense } from "react";
import Image from "next/image";

export default function Login() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Login Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Image Section */}
      <div className="w-full md:w-1/2 bg-gray-100 hidden md:flex items-center justify-center relative">
        <div className="relative w-full h-full">
          <Image src="/login.png" alt="Login background" fill priority />
          {/* Optional overlay text */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            {/* <div className="bg-black bg-opacity-30 p-6 rounded-lg text-white">
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="mt-2">Sign in to access your account</p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
