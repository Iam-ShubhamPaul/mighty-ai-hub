"use client";
import { Button } from "@/components/ui/button";
import { Mic, Paperclip, Send } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import AiMultiModels from "./AiMultiModels";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useAuth, useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

function ChatInputBox() {
  const [userInput, setUserInput] = useState("");
  const { aiSelectedModels, messages, setMessages } = useContext(
    AiSelectedModelContext
  );

  const { user } = useUser();
  const [chatId, setChatId] = useState(null);
  const params = useSearchParams();

  const { has } = useAuth();

  // const paidUser = has({ plan: "unlimited_plan" });

  /* ---------------------------------------------
      Load chat when chatId changes
  --------------------------------------------- */
  useEffect(() => {
    const chatId_ = params.get("chatId");

    if (chatId_) {
      setChatId(chatId_);
      GetMessages(chatId_);
    } else {
      setMessages({});
      setChatId(uuidv4());
    }
  }, [params]);

  /* ---------------------------------------------
      Save messages only when AI finishes responding
  --------------------------------------------- */
  const SaveMessages = async (finalMessages) => {
    if (!chatId) return;
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const docRef = doc(db, "chatHistory", chatId);

    await setDoc(
      docRef,
      {
        chatId,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        messages: finalMessages,
        lastUpdated: Date.now(),
      },
      { merge: true }
    );
  };

  /* ---------------------------------------------
      Fetch old messages from Firestore
  --------------------------------------------- */
  const GetMessages = async (id) => {
    const docRef = doc(db, "chatHistory", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      setMessages({});
      return;
    }

    const data = docSnap.data();
    setMessages(data.messages || {});
  };

  /* ---------------------------------------------
      Handle user send input
  --------------------------------------------- */
  const handleSend = async () => {
    if (!userInput.trim()) return;

    if (!has({ plan: "unlimited_plan" })) {
      // 1️⃣ Check token limit
      const result = await axios.post("/api/user-remaining-msg", { token: 1 });
      const remainingToken = result?.data?.remainingToken;

      if (remainingToken <= 0) {
        toast.error("Maximum daily limit exceeded");
        return;
      }
    }
    const inputCopy = userInput;
    setUserInput("");

    // 2️⃣ Add user message to enabled models
    setMessages((prev) => {
      const updated = { ...prev };

      Object.keys(aiSelectedModels).forEach((modelKey) => {
        if (aiSelectedModels[modelKey].enable) {
          updated[modelKey] = [
            ...(updated[modelKey] ?? []),
            { role: "user", content: inputCopy },
          ];
        }
      });

      return updated;
    });

    // 3️⃣ Fetch responses for each model
    Object.entries(aiSelectedModels).forEach(
      async ([parentModel, modelInfo]) => {
        if (!modelInfo.modelId || !modelInfo.enable) return;

        // Insert "Thinking..." placeholder
        setMessages((prev) => ({
          ...prev,
          [parentModel]: [
            ...(prev[parentModel] ?? []),
            {
              role: "assistant",
              model: parentModel,
              loading: true,
              content: "Thinking...",
            },
          ],
        }));

        try {
          const res = await axios.post("/api/ai-multi-model", {
            model: modelInfo.modelId,
            msg: [{ role: "user", content: inputCopy }],
            parentModel,
          });

          const { aiResponse, model } = res.data;

          // Replace "Thinking..." with real message
          setMessages((prev) => {
            const arr = [...prev[parentModel]];
            const idx = arr.findIndex((m) => m.loading);

            if (idx !== -1) {
              arr[idx] = {
                role: "assistant",
                content: aiResponse,
                model,
                loading: false,
              };
            }

            const finalMessages = { ...prev, [parentModel]: arr };

            // 💾 Save only when real AI response added
            SaveMessages(finalMessages);

            return finalMessages;
          });
        } catch (error) {
          setMessages((prev) => ({
            ...prev,
            [parentModel]: [
              ...(prev[parentModel] ?? []),
              { role: "assistant", content: "⚠️ Error fetching response." },
            ],
          }));
        }
      }
    );
  };

  return (
    <div className="relative min-h-screen">
      <AiMultiModels />

      <div className="fixed bottom-0 left-0 w-full flex justify-center px-4 pb-4">
        <div className="w-full border rounded-xl shadow-md max-w-2xl p-4">
          <input
            type="text"
            placeholder="Ask me anything..."
            className="border-0 outline-none w-full"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <div className="mt-3 flex justify-between items-center">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="flex gap-5">
              <Button variant="ghost" size="icon">
                <Mic />
              </Button>
              <Button size="icon" onClick={handleSend}>
                <Send />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInputBox;




