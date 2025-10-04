"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import {
  type Id,
  type Doc,
} from "@my-better-t-app/backend/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";

interface MessageInputProps {
  channelId: Id<"channels">;
  channelName: string | undefined;
  onMessageSent: () => void;
}

export function MessageInput({
  channelId,
  channelName,
  onMessageSent,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const { user } = useUser();
  const params = useParams();
  const orgId = params.orgId as Id<"organizations">;

  const optimisticUpdate = (
    ctx: any,
    { text, channelId }: { text: string; channelId: Id<"channels"> }
  ) => {
    try {
      if (!ctx || !user) return;

      const currentMessages = ctx.getQuery(api.messages.listMessages, {
        channelId: channelId as string,
      });

      if (currentMessages === undefined) {
        return;
      }

      const optimisticMessage: Doc<"messages"> & { author: Doc<"users"> } = {
        _id: new Date().toISOString() as Id<"messages">,
        _creationTime: Date.now(),
        channelId: channelId as Id<"channels">,
        orgId,
        userId: user.id,
        text,
        parentMessageId: "",
        createdAt: Date.now(),
        editedAt: Date.now(),
        author: {
          _id: user.id as Id<"users">,
          _creationTime: Date.now(),
          clerkId: user.id,
          name: user.fullName || "You",
          email: user.primaryEmailAddress?.emailAddress || "",
          avatarUrl: user.imageUrl || "",
        },
      };

      ctx.setQuery(
        api.messages.listMessages,
        { channelId: channelId as string },
        [...currentMessages, optimisticMessage]
      );
    } catch (error) {
      // Silently catch the error to prevent a crash.
    }
  };

  const sendMessage =
    useMutation(api.messages.sendMessage).withOptimisticUpdate(
      optimisticUpdate
    );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === "") return;

    try {
      await sendMessage({ channelId, text });
      onMessageSent();
    } catch (error) {
      console.error("Error sending message:", error);
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
