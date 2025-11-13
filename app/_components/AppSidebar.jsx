"use client";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
          <Button className="mt-7 w-full" size="lg">
            New Chat
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup />
        <div className="p-3">
          <h2 className="font-bold text-lg p-2 ">Chat</h2>
          <p className="text-sm text-gray-400 p-2">
            Sign in to Start chating with multiple Ai Model
          </p>
        </div>
        <SidebarGroup />
      </SidebarContent>

      <SidebarFooter>
        <div className="p-3 mb-10">
          <Button className={"w-full"} size={"lg"}>
            Sign In / Sign Up
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
