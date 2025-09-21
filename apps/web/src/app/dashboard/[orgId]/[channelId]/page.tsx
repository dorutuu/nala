"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import Message from "@/components/message";
import { type Id } from "@my-better-t-app/backend/convex/_generated/dataModel";

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.channelId as Id<"channels">;

  const messages = useQuery(api.messages.listMessages, { channelId });
  const sendMessage = useMutation(api.messages.sendMessage);

  const [text, setText] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === "") return;
    await sendMessage({ channelId, text });
    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-lg">#</h1>
        </div>
      </div>

      {/* Messages */}
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

      {/* Message Input */}
      <div className="p-4 border-t border-border shrink-0">
        <form
          onSubmit={handleSendMessage}
          className="flex items-end gap-2 bg-card border border-border rounded-lg p-3"
        >
          <div className="flex-1">
            <Input
              placeholder={`Message #${channelId}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              className="h-8 w-8 p-0"
              type="submit"
              disabled={!text.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
