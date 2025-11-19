"use client";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Bolt, Moon, Sun, User2, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";
import UserCreditProgress from "./UserCreditProgress";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const [chatHistory, setChatHistory] = useState([]);
  const router = useRouter();

  const handleNewChat = () => {
    // Redirect to home (fresh chat)
    router.push("/");
  };

  useEffect(() => {
    user && GetChatHistory();
  }, [user]);

  const GetChatHistory = async () => {
    const q = query(
      collection(db, "chatHistory"),
      where("userEmail", "==", user?.primaryEmailAddress?.emailAddress)
    );
    const querySnapshot = await getDocs(q);

    // Collect docs then set state once to avoid duplicate appends
    const chats = [];
    querySnapshot.forEach((d) => {
      chats.push(d.data());
    });

    // Sort by lastUpdated descending (newest first). Handle Firestore Timestamp.
    chats.sort((a, b) => {
      const getTime = (c) => {
        const t = c?.lastUpdated;
        if (!t) return 0;
        if (typeof t.toDate === "function") return t.toDate().getTime();
        if (typeof t.seconds === "number") return t.seconds * 1000;
        return new Date(t).getTime ? new Date(t).getTime() : Number(t) || 0;
      };
      return getTime(b) - getTime(a);
    });

    setChatHistory(chats);
  };

  const GetLastUserMessageFormChat = (chat) => {
    const allMessages = Object.values(chat.messages || {}).flat();
    const userMessages = allMessages.filter((msg) => msg.role == "user");

    const lastUserMsg = userMessages.length
      ? userMessages[userMessages.length - 1].content
      : null;

    // normalize lastUpdated to JS Date
    let lastUpdated = chat.lastUpdated;
    if (lastUpdated && typeof lastUpdated.toDate === "function") {
      lastUpdated = lastUpdated.toDate();
    } else if (lastUpdated && typeof lastUpdated.seconds === "number") {
      lastUpdated = new Date(lastUpdated.seconds * 1000);
    } else if (!lastUpdated) {
      lastUpdated = Date.now();
    }

    const formattedDate = moment(lastUpdated).fromNow();

    return {
      chatId: chat.chatId,
      message: lastUserMsg,
      lastMsgDate: formattedDate,
    };
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-3 ">
          <div className="flex justify-between items-center ">
            <div className="flex items-center gap-3">
              <Image src={"/logo.svg"} alt="logo" width={60} height={60} />
              <h2 className="font-bold text-2xl"> 360°.AI</h2>
            </div>

            <div>
              {!mounted ? (
                // Placeholder to avoid SSR mismatch
                <Button variant="ghost">
                  <Sun />
                </Button>
              ) : theme === "light" ? (
                <Button variant="ghost" onClick={() => setTheme("dark")}>
                  <Sun />
                </Button>
              ) : (
                <Button onClick={() => setTheme("light")}>
                  <Moon />
                </Button>
              )}
            </div>
          </div>
          {!user ? (
            <Button className="mt-7 w-full" size="lg" onClick={handleNewChat}>
              New Chat
            </Button>
          ) : (
            <Button className="mt-7 w-full" size="lg" onClick={handleNewChat}>
              New Chat
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup />
        <div className="p-3">
          <h2 className="font-bold text-lg p-2 ">Chat</h2>
          {!user && (
            <p className="text-sm text-gray-400 p-2">
              Sign in to Start chating with multiple Ai Model
            </p>
          )}
          {/* {chatHistory.map((chat, index) => (
            <div key={index} className="mt-2 ">
              <div className="hover:bg-gray-100 p-3 cursor-pointer">
                <h2 className="text-sm text-gray-400">
                  {GetLastUserMessageFormChat(chat).lastMsgDate}
                </h2>
                <h2 className="text-lg line-clamp-1 ">
                  {GetLastUserMessageFormChat(chat).message}
                </h2>
              </div>

              <hr className="my-1" />
            </div>
          ))} */}
          {chatHistory.map((chat, index) => {
            const lastInfo = GetLastUserMessageFormChat(chat);

            return (
              <Link
                href={"?chatId=" + chat.chatId}
                key={index}
                className="mt-2 "
              >
                <div className="hover:bg-gray-100 p-3 cursor-pointer">
                  <h2 className="text-sm text-gray-400">
                    {lastInfo.lastMsgDate}
                  </h2>
                  <h2 className="text-lg line-clamp-1 ">{lastInfo.message}</h2>
                </div>

                <hr className="my-1" />
              </Link>
            );
          })}
        </div>
        <SidebarGroup />
      </SidebarContent>

      <SidebarFooter>
        <div className="p-3 mb-10">
          {!user ? (
            <SignInButton mode="modal">
              <Button className={"w-full"} size={"lg"}>
                Sign In / Sign Up
              </Button>
            </SignInButton>
          ) : (
            <div>
              <UserCreditProgress />
              <Button className={"w-full mb-3 "}>
                {" "}
                <Zap /> Upgrade Plan{" "}
              </Button>
              <Button className="flex w-full" variant={"ghost"}>
                <User2 /> <h2>Settings</h2>
              </Button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
