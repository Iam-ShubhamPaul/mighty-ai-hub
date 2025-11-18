"use client";
import AiModelList from "@/shared/AiModelList";
import Image from "next/image";
import React, { useContext, useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader, Lock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import { Value } from "@radix-ui/react-select";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useUser } from "@clerk/nextjs";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";

// const cleanMarkdown = (text = "") => {
//   return text
//     .replace(/\r\n/g, "\n")          // normalize windows
//     .replace(/\n{2,}/g, "\n")        // convert double+ newlines into ONE line
//     .trim();
// };

function AiMultiModels() {
  const { user } = useUser();
  const [aiModelList, setAiModelList] = useState(AiModelList);
  const { aiSelectedModels, setAiSelectedModels, messages, setMessages } =
    useContext(AiSelectedModelContext);

  const onToggleChange = (model, value) => {
    setAiModelList((prev) =>
      prev.map((m) => (m.model === model ? { ...m, enable: value } : m))
    );

    setAiSelectedModels((prev) => ({
      ...prev,
      [model]: {
        ...(prev?.[model] ?? {}),
        enable: value,
      },
    }));
  };

  console.log(aiSelectedModels);

  const onSelectValue = async (parentModel, value) => {
    const newSelected = {
      ...aiSelectedModels,
      [parentModel]: {
        modelId: value,
      },
    };
    setAiSelectedModels(newSelected);

    // Update to Firebase Db with the new selected state (avoid stale state)
    
  };

  return (
    <div className="flex flex-1 h-[75vh] border-b">
      {aiModelList.map((model, index) => (
        <div
          key={index}
          className={`flex flex-col border-r overflow-auto transition-all duration-150 h-full
            ${model.enable ? "flex-1 min-w-[400px]" : "flex-none w-[100px]"}
          `}
        >
          <div className="flex w-full items-center h-[70px] justify-between border-b p-4">
            <div className="flex items-center gap-4">
              <Image
                src={model.icon}
                alt={model.model}
                width={24}
                height={24}
              />

              {model.enable && (
                <Select
                  defaultValue={
                    aiSelectedModels?.[model.model]?.modelId ??
                    model.subModel?.[0]?.id ??
                    ""
                  }
                  onValueChange={(value) => onSelectValue(model.model, value)}
                  disabled={model.premium}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue
                      placeholder={
                        aiSelectedModels?.[model.model]?.modelId ??
                        model.subModel?.[0]?.id ??
                        "Select model"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup className="p-3">
                      <SelectLabel className={"text-sm text-gray-400 "}>
                        Free
                      </SelectLabel>
                      {model.subModel.map(
                        (subModel, i) =>
                          subModel.premium == false && (
                            <SelectItem key={i} value={subModel.id}>
                              {subModel.name}
                            </SelectItem>
                          )
                      )}
                    </SelectGroup>
                    <SelectGroup className="p-3">
                      <SelectLabel className={"text-sm text-gray-400 "}>
                        Premium
                      </SelectLabel>
                      {model.subModel.map(
                        (subModel, i) =>
                          subModel.premium == true && (
                            <SelectItem
                              key={i}
                              value={subModel.name}
                              disabled={subModel.premium}
                            >
                              {subModel.name}{" "}
                              {subModel.premium && <Lock className="h-4 w-4" />}
                            </SelectItem>
                          )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              {model.enable ? (
                <Switch
                  checked={model.enable}
                  onCheckedChange={(v) => onToggleChange(model.model, v)}
                />
              ) : (
                <MessageSquare
                  className="cursor-pointer"
                  onClick={() => onToggleChange(model.model, true)}
                />
              )}
            </div>
          </div>
          {model.premium && model.enable && (
            <div className="flex items-center justify-center h-full ">
              <Button>
                {" "}
                <Lock /> Upgrade to unlock
              </Button>
            </div>
          )}
          {model.enable && (
            <div className="flex-1 p-4">
              <div className="flex-1 p-4 space-y-2 ">
                {messages[model.model]?.map((m, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-md ${
                      m.role == "user"
                        ? "bg-blue-100 text-blue-900"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {m.role == "assistant" && (
                      <span className="text-sm text-gray-800">
                        {m.model ?? model.model}
                      </span>
                    )}
                    <div className="flex gap-3 items-center">
                      {/* {m.content == 'loading' && <> <Loader className="animate-spin" /><span>Thinking...</span> </>} */}
                      {/* <Markdown remarkPlugins={[remarkGfm]}>
                       
                        {cleanMarkdown(m.content)} 
                      </Markdown> */}

                      {m.content}

                      {/* {m.content !== 'loading' && <h2>{m.content}</h2> } */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AiMultiModels;
