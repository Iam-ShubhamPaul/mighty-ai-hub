"use client";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import { Moon, Sun, User2, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";
import UserCreditProgress from "./UserCreditProgress";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import PricingModal from "./PricingModal";

export function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const [chatHistory, setChatHistory] = useState([]);
  const router = useRouter();
  const [freeMsgCount, setFreeMsgCount] = useState(0);

  const{has}=useAuth();

  // const paidUser = has({ plan: "unlimited_plan" });

  const handleNewChat = () => {
    router.push("/");
  };

  /* Load chat history */
  useEffect(() => {
    if (user) {
      GetChatHistory();
      GetRemainingTokenMsg();
    }
  }, [user]);

  /* Token updates whenever messages change */
  const GetRemainingTokenMsg = async () => {
    const res = await axios.post("/api/user-remaining-msg");
    setFreeMsgCount(res.data.remainingToken);
  };

  const GetChatHistory = async () => {
    const q = query(
      collection(db, "chatHistory"),
      where("userEmail", "==", user?.primaryEmailAddress?.emailAddress)
    );

    const snapshot = await getDocs(q);

    const chats = [];
    snapshot.forEach((d) => chats.push(d.data()));

    chats.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));

    setChatHistory(chats);
  };

  const getPreview = (chat) => {
    const all = Object.values(chat.messages || {}).flat();
    const userMsgs = all.filter((m) => m.role === "user");
    const lastMsg = userMsgs[userMsgs.length - 1]?.content ?? "No messages";

    const time = moment(chat.lastUpdated).fromNow();

    return { lastMsg, time };
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image src={"/logo.svg"} alt="logo" width={60} height={60} />
              <h2 className="font-bold text-2xl">360°.AI</h2>
            </div>

            {!mounted ? (
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

          <Button className="mt-7 w-full" size="lg" onClick={handleNewChat}>
            New Chat
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup />
        <div className="p-3">
          <h2 className="font-bold text-lg p-2">Chat</h2>

          {!user && (
            <p className="text-sm text-gray-400 p-2">Sign in to see chats</p>
          )}

          {chatHistory.map((chat, i) => {
            const preview = getPreview(chat);

            return (
              <Link key={i} href={`?chatId=${chat.chatId}`}>
                <div className="hover:bg-gray-100 p-3">
                  <h2 className="text-sm text-gray-400">{preview.time}</h2>
                  <h2 className="text-lg line-clamp-1">{preview.lastMsg}</h2>
                </div>
                <hr />
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
              <Button className="w-full" size="lg">
                Sign In / Sign Up
              </Button>
            </SignInButton>
          ) : (
            <>
              {!has({ plan: "unlimited_plan" }) && (
                <div>
                  <UserCreditProgress remainingToken={freeMsgCount} />
                  <PricingModal>
                    <Button className="w-full mb-3">
                      <Zap /> Upgrade Plan
                    </Button>
                  </PricingModal>
                </div>
              )}
              <Button className="flex w-full" variant="ghost">
                <User2 /> Settings
              </Button>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
