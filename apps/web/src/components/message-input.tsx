"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { type Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface MessageInputProps {
  channelId: Id<"channels">;
  channelName: string | undefined;
}

export function MessageInput({ channelId, channelName }: MessageInputProps) {
  const [text, setText] = useState("");
  const sendMessage = useMutation(api.messages.sendMessage);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === "") return;

    // Optimistic update
    const optimisticMessage = {
      _id: new Date().toISOString(),
      _creationTime: Date.now(),
      channelId,
      text,
      userId: "(optimistic)",
      author: {
        name: "You",
        avatarUrl: "",
      },
    };

    try {
      await sendMessage({ channelId, text });
    } catch (error) {
      console.error("Error sending message:", error);
      // Revert optimistic update if there's an error
    }

    setText("");
  };

  return (
    <div className="p-4 border-t border-border">
      <form
        onSubmit={handleSendMessage}
        className="flex items-end gap-2 bg-card border border-border rounded-lg p-3"
      >
        <div className="flex-1">
          <Input
            placeholder={`Message #${channelName}`}
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
  );
}
