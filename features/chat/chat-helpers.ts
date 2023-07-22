import { AIMessage, HumanMessage } from "langchain/schema";
import { ChatMessageOutputModel } from "./chat-service";

export const mostRecentMemory = (
  chats: ChatMessageOutputModel[],
  memorySize: number
) => {
  return transformCosmosToLangchain(chats).slice(memorySize * -1);
};

export const transformCosmosToLangchain = (chats: ChatMessageOutputModel[]) => {
  return chats.map((m) => {
    if (m.role === "assistant") {
      return new AIMessage(m.content);
    }
    return new HumanMessage(m.content);
  });
};
