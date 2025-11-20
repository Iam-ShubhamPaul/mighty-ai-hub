"use client";

import { Suspense } from "react";
import ChatInputBox from "./_components/ChatInputBox";

export default function Home() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <ChatInputBox />
    </Suspense>
  );
}
