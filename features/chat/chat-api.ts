import { LangChainStream, Message, StreamingTextResponse } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, LLMResult, SystemMessage } from "langchain/schema";
import { mostRecentMemory } from "./chat-helpers";
import { FindAllChats, inertPromptAndResponse } from "./chat-service";
import {
  EnsureChatThreadIsForCurrentUser,
  updateChatThreadTitle,
} from "./chat-thread-service";

export interface PromptGPTBody {
  id: string; // thread id
  model: string; // model name
}

export interface PromptGPTProps extends PromptGPTBody {
  messages: Message[];
}

export const PromptGPT = async (props: PromptGPTProps) => {
  const { messages, id, model } = props;
  const chatThread = await EnsureChatThreadIsForCurrentUser(id);
  const chats = await FindAllChats(id);

  const { stream, handlers } = LangChainStream();
  //last message
  const message = messages[messages.length - 1];
  await updateChatThreadTitle(chatThread, chats, model, message.content);

  const memory = mostRecentMemory(chats, 10);

  const chat = new ChatOpenAI({
    temperature: 0,
    streaming: true,
  });

  chat.predictMessages(
    [
      new SystemMessage(`-You are AzureChatGPT who is a helpful AI Assistant.
    - You will provide clear and concise queries, and you will respond with polite and professional answers.
    - You will answer questions truthfully and accurately.`),
      ...memory,
      new HumanMessage(message.content),
    ],
    {},
    [
      {
        ...handlers,
        handleLLMEnd: async (
          output: LLMResult,
          runId: string,
          parentRunId?: string | undefined,
          tags?: string[] | undefined
        ) => {
          await handlers.handleLLMEnd(output, runId);
          inertPromptAndResponse(
            id,
            message.content,
            output.generations[0][0].text
          );
        },
      },
    ]
  );

  return new StreamingTextResponse(stream);
};
