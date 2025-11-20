// import { createContext } from "react";

// export const AiSelectedModelContext = createContext();

"use client";

import { createContext, useState, useEffect } from "react";
import AiModelList from "@/shared/AiModelList";

export const AiSelectedModelContext = createContext();

export default function AiSelectedModelProvider({ children }) {
  const [aiSelectedModels, setAiSelectedModels] = useState({});
  const [messages, setMessages] = useState({});

  // Initialize all models (GPT, Gemini, Grok, Llama, etc.)
  useEffect(() => {
    const initial = {};

    AiModelList.forEach((provider) => {
      initial[provider.model] = {
        enable: provider.enable ?? true,
        modelId: provider.subModel?.[0]?.id ?? null, // default submodel
      };
    });

    setAiSelectedModels(initial);
  }, []);

  return (
    <AiSelectedModelContext.Provider
      value={{ aiSelectedModels, setAiSelectedModels, messages, setMessages }}
    >
      {children}
    </AiSelectedModelContext.Provider>
  );
}
