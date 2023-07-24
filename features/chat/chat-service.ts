"use server";
import "server-only";

import { SqlQuerySpec } from "@azure/cosmos";
import { nanoid } from "nanoid";
import { memoryContainer } from "../common/cosmos";

export const FindAllChats = async (chatThreadID: string) => {
  const container = await memoryContainer();

  const querySpec: SqlQuerySpec = {
    query:
      "SELECT * FROM root r WHERE r.type=@type AND r.threadId = @threadId AND r.isDeleted=@isDeleted",
    parameters: [
      {
        name: "@type",
        value: "CHAT_MESSAGE",
      },
      {
        name: "@threadId",
        value: chatThreadID,
      },
      {
        name: "@isDeleted",
        value: false,
      },
    ],
  };

  const { resources } = await container.items
    .query<ChatMessageModel>(querySpec)
    .fetchAll();

  return resources;
};

export const UpsertChat = async (chatModel: ChatMessageModel) => {
  const modelToSave: ChatMessageModel = {
    ...chatModel,
    id: nanoid(),
    createdAt: new Date(),
    type: "CHAT_MESSAGE",
    isDeleted: false,
  };

  const container = await memoryContainer();
  await container.items.upsert(modelToSave);
};

export const inertPromptAndResponse = async (
  threadID: string,
  userQuestion: string,
  assistantResponse: string
) => {
  await UpsertChat({
    ...newChatModel(),
    content: userQuestion,
    threadId: threadID,
    role: "user",
  });
  await UpsertChat({
    ...newChatModel(),
    content: assistantResponse,
    threadId: threadID,
    role: "assistant",
  });
};

export const newChatModel = (): ChatMessageModel => {
  return {
    content: "",
    threadId: "",
    role: "user",
    id: nanoid(),
    createdAt: new Date(),
    type: "CHAT_MESSAGE",
    isDeleted: false,
  };
};

export interface ChatMessageModel {
  id: string;
  createdAt: Date;
  isDeleted: boolean;
  threadId: string;
  content: string;
  role: chatRole;
  type: "CHAT_MESSAGE";
}

export type chatRole = "system" | "user" | "assistant" | "function";
