"use client";
import { MenuItem } from "@/components/menu";
import { Button } from "@/components/ui/button";
import {
  ChatThreadModel,
  SoftDeleteChatThreadByID,
} from "@/features/chat/chat-thread-service";
import { MessageCircle, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FC } from "react";

interface Prop {
  menuItems: Array<ChatThreadModel>;
}

export const MenuItems: FC<Prop> = (props) => {
  const { id } = useParams();
  const router = useRouter();

  const sendData = async (threadID: string) => {
    await SoftDeleteChatThreadByID(threadID);
    router.refresh();
    router.replace("/chat");
  };

  return (
    <>
      {props.menuItems.map((thread) => (
        <MenuItem
          href={"/chat/" + thread.id}
          isSelected={id === thread.id}
          key={thread.id}
          className="justify-between group/item"
        >
          <MessageCircle size={16} />
          <span className="flex gap-2 items-center overflow-hidden flex-1">
            <span className="overflow-ellipsis truncate"> {thread.name}</span>
          </span>
          <Button
            className="invisible  group-hover/item:visible"
            size={"sm"}
            variant={"ghost"}
            onClick={async (e) => {
              e.preventDefault();
              const yesDelete = confirm(
                "Are you sure you want to delete this chat?"
              );
              if (yesDelete) {
                await sendData(thread.id);
              }
            }}
          >
            <Trash size={16} />
          </Button>
        </MenuItem>
      ))}
    </>
  );
};
