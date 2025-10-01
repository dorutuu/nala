"use client";

import Message from "@/components/message";
import { MessageInput } from "@/components/message-input";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Hash, Lock } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.channelId as Id<"channels">;

  const channel = useQuery(api.channels.getChannel, { channelId });
  const messages = useQuery(api.messages.listMessages, { channelId });
  const nrOfMembers = useQuery(api.channels.countChannelMembers, { channelId });

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: messages?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
  });

  const scrollToBottom = () => {
    if (rowVirtualizer && messages && messages.length > 0) {
      rowVirtualizer.scrollToIndex(messages.length - 1, { align: "end" });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {channel?.isPrivate ? (
            <Lock className="mr-2 h-4 w-4" />
          ) : (
            <Hash className="mr-2 h-4 w-4" />
          )}
          <h1 className="font-semibold text-lg">{channel?.name}</h1>
          <Badge variant="secondary" className="text-xs">
            {`${nrOfMembers} members`}
          </Badge>
        </div>
        <ModeToggle />
      </div>

      <div ref={parentRef} className="flex-1 p-4 h-0 overflow-y-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem: any) => {
            const msg = messages![virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <Message
                  id={msg._id}
                  userId={msg.userId}
                  createdAt={msg.createdAt}
                  text={msg.text}
                  fullName={msg.author.name}
                  avatarUrl={msg.author.avatarUrl}
                />
              </div>
            );
          })}
        </div>
      </div>

      <MessageInput
        channelId={channelId}
        channelName={channel?.name}
        onMessageSent={scrollToBottom}
      />
    </div>
  );
}
