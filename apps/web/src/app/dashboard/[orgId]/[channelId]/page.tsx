"use client";

import Message from "@/components/message";
import { MessageInput } from "@/components/message-input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Hash } from "lucide-react";
import { useParams } from "next/navigation";

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.channelId as Id<"channels">;
  const channel = useQuery(api.channels.getChannel, { channelId });
  const messages = useQuery(api.messages.listMessages, { channelId });
  const nrOfMembers = useQuery(api.channels.countChannelMembers, { channelId });

  return (
    <div className="flex flex-col h-full">
      <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <h1 className="font-semibold text-lg">{`${channel?.name}`}</h1>
          <Badge variant="secondary" className="text-xs">
            {`${nrOfMembers} members`}{" "}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 h-0">
        <div className="space-y-4">
          {messages?.map((msg) => (
            <Message
              key={msg._id}
              id={msg._id}
              userId={msg.userId}
              createdAt={msg.createdAt}
              text={msg.text}
              fullName={msg.author.name}
              avatarUrl={msg.author.avatarUrl}
            />
          ))}
        </div>
      </ScrollArea>

      <MessageInput channelId={channelId} channelName={channel?.name} />
    </div>
  );
}
