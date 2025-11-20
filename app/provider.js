"use client";
import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useUser } from "@clerk/nextjs";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import { DefaultModel } from "@/shared/AiModelsShared";
import { UserDetailContext } from "@/context/UserDetailContext";

function Provider({ children, ...props }) {
  const { user, isLoaded, isSignedIn } = useUser();

  const [aiSelectedModels, setAiSelectedModels] = useState(DefaultModel);
  const [userDetail, setUserDetail] = useState(null);
  const [messages, setMessages] = useState({});

  /* -----------------------------------------
      Create user when available
  ----------------------------------------- */
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!user?.primaryEmailAddress?.emailAddress) return;

    CreateNewUser();
  }, [isLoaded, isSignedIn, user]);

  /* -----------------------------------------
      Update preferred model ONLY when:
      - user exists
      - user document exists
  ----------------------------------------- */
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!user?.primaryEmailAddress?.emailAddress) return;

    if (userDetail) {
      updateAIModelSelectionPref();
    }
  }, [aiSelectedModels, userDetail]);

  /* -----------------------------------------
      Update the model pref
  ----------------------------------------- */
  const updateAIModelSelectionPref = async () => {
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) return; // prevent crash

      const docRef = doc(db, "users", email);

      await updateDoc(docRef, {
        selectedModelPref: aiSelectedModels,
      });
    } catch (err) {
      console.error("Failed to update selected model in DB:", err);
    }
  };

  /* -----------------------------------------
      Create the user in Firestore
  ----------------------------------------- */
  const CreateNewUser = async () => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;

    const userRef = doc(db, "users", email);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      console.log("Existing User");
      const data = userSnap.data();

      setAiSelectedModels(data?.selectedModelPref ?? DefaultModel);
      setUserDetail(data);

      return;
    }

    const userData = {
      name: user?.fullName ?? "",
      email: email,
      createdAt: new Date(),
      reminaingMsg: 5,
      plan: "Free",
      credits: 1000,
      selectedModelPref: DefaultModel,
    };

    await setDoc(userRef, userData);
    console.log("New User Data Saved");
    setUserDetail(userData);
  };

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
        <AiSelectedModelContext.Provider
          value={{
            aiSelectedModels,
            setAiSelectedModels,
            messages,
            setMessages,
          }}
        >
          <SidebarProvider>
            <AppSidebar />

            <div className="w-full">
              <AppHeader />
              {children}
            </div>
          </SidebarProvider>
        </AiSelectedModelContext.Provider>
      </UserDetailContext.Provider>
    </NextThemesProvider>
  );
}

export default Provider;
