"use client";
import socket from "@/utils/socket";
import React, { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id); // x8WIv7-mJelg7on_ALbx
    });

    socket.on("disconnect", () => {
      console.log(socket.id); // undefined
    });
  }, []);
  return <div>Page</div>;
}
