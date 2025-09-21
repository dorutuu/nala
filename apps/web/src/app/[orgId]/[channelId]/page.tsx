"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";

export default function ChannelPage() {
    const params = useParams();
    const channelId = params.channelId as any;

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
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages?.map((msg) => (
                        <div key={msg._id} className="flex gap-3 group hover:bg-accent/50 -mx-4 px-4 py-2 rounded">
                            <Avatar className="h-9 w-9 mt-0.5">
                                <AvatarImage src={msg.author.avatarUrl} />
                                <AvatarFallback>
                                    {msg.author.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="font-semibold text-sm">{msg.author.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(msg._creationTime).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-sm text-foreground leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 border-t border-border">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-card border border-border rounded-lg p-3">
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
