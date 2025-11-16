"use client";
import React, { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useUser } from "@clerk/nextjs";

function Provider({ children, ...props }) {
  const { user, isLoaded, isSignedIn } = useUser();  // ✅ FIXED

  useEffect(()=>{
     if(user){
      CreateNewUser();
     }
  },[user])

  const CreateNewUser =async () => {
    if (!isLoaded || !isSignedIn) return;

    const userRef = doc(
      db,
      "users",
      user?.primaryEmailAddress?.emailAddress // ✅ Now works
    );

    const userSnap = await getDoc(userRef);

    if(userSnap.exists()){
      console.log("Existing User");
      return;
    } else {
      const userData={
        name:user?.fullName,
        email:user?.primaryEmailAddress?.emailAddress,
        createdAt:new Date(),
        reminaingMsg:5,  //Only for Free Users
        plan:'Free',
        credits:1000   // For Paid User
      }
      await setDoc(userRef , userData );
      console.log('New User Data Saved');
    }

    console.log("User ref created:", userRef);
  };

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <SidebarProvider>
        <AppSidebar />
        <div className="w-full">
          <AppHeader />
          {children}
        </div>
      </SidebarProvider>
    </NextThemesProvider>
  );
}

export default Provider;
