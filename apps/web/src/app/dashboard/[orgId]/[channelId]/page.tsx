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
import { AutoSizer, List } from "react-virtualized";
import "react-virtualized/styles.css";

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
          {channel?.isPrivate ? (
            <Lock className="mr-2 h-4 w-4" />
          ) : (
            <Hash className="mr-2 h-4 w-4" />
          )}
          <h1 className="font-semibold text-lg">{`${channel?.name}`}</h1>
          <Badge variant="secondary" className="text-xs">
            {`${nrOfMembers} members`}{" "}
          </Badge>
        </div>
        <ModeToggle />
      </div>

      <div className="flex-1 p-4 h-0">
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              rowCount={messages?.length || 0}
              rowHeight={80}
              rowRenderer={({ index, key, style }) => {
                const msg = messages![index];
                return (
                  <div key={key} style={style}>
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
              }}
            />
          )}
        </AutoSizer>
      </div>

      <MessageInput channelId={channelId} channelName={channel?.name} />
    </div>
  );
}
