import { SqlQuerySpec } from "@azure/cosmos";
import { ChatMessageModel } from "../chat/chat-service";
import { ChatThreadModel } from "../chat/chat-thread-service";
import { memoryContainer } from "../common/cosmos";

export const FindAllChatThreadsForReporting = async (
  pageSize = 10,
  pageNumber = 0
) => {
  const container = await memoryContainer();

  const querySpec: SqlQuerySpec = {
    query: `SELECT * FROM root r WHERE r.type=@type ORDER BY r.createdAt DESC OFFSET ${
      pageNumber * pageSize
    } LIMIT ${pageSize}`,
    parameters: [
      {
        name: "@type",
        value: "CHAT_THREAD",
      },
    ],
  };

  const { resources } = await container.items
    .query<ChatThreadModel>(querySpec, {
      maxItemCount: pageSize,
    })
    .fetchNext();
  return { resources };
};

export const FindChatThreadByID = async (chatThreadID: string) => {
  const container = await memoryContainer();

  const querySpec: SqlQuerySpec = {
    query: "SELECT * FROM root r WHERE r.type=@type AND r.id=@id",
    parameters: [
      {
        name: "@type",
        value: "CHAT_THREAD",
      },

      {
        name: "@id",
        value: chatThreadID,
      },
    ],
  };

  const { resources } = await container.items
    .query<ChatThreadModel>(querySpec)
    .fetchAll();

  return resources;
};

export const FindAllChatsInThread = async (chatThreadID: string) => {
  const container = await memoryContainer();

  const querySpec: SqlQuerySpec = {
    query: "SELECT * FROM root r WHERE r.type=@type AND r.threadId = @threadId",
    parameters: [
      {
        name: "@type",
        value: "CHAT_MESSAGE",
      },
      {
        name: "@threadId",
        value: chatThreadID,
      },
    ],
  };
  const { resources } = await container.items
    .query<ChatMessageModel>(querySpec)
    .fetchAll();
  return resources;
};
