"use client";
import { useEffect } from "react";
import socket from "@/utils/socket";

export default function TestPage() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id); // x8WIv7-mJelg7on_ALbx
    });

    socket.on("disconnect", () => {
      console.log(socket.id); // undefined
    });
    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <div>
      <h1>Test Page</h1>
    </div>
  );
}
