"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Hash,
  Lock,
  Plus,
  Search,
  Settings,
  Smile,
  Paperclip,
  Send,
  MoreHorizontal,
  ChevronDown,
  Bell,
  HelpCircle,
  User,
  DoorClosed,
  LogOut,
} from "lucide-react";
import { SignOutButton, useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { CreateChannelModal } from "./create-channel-modal";
import { type Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import Message from "./message";

interface Message {
  id: string;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
  reactions?: { emoji: string; count: number }[];
}

interface Channel {
  id: string;
  name: string;
  type: "channel" | "dm";
  unread?: number;
  isPrivate?: boolean;
}

export function SlackInterface() {
  const [selectedChannel, setSelectedChannel] = useState<Id<"channels"> | null>(
    null
  );
  const [message, setMessage] = useState("");
  const { isSignedIn, user, isLoaded } = useUser();
  const organizations = useQuery(api.organizations.getOrganizations);
  const orgId = organizations?.[0]?._id;
  const channels = useQuery(
    api.channels.getChannels,
    orgId ? { orgId } : "skip"
  );

  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0]._id);
    }
  }, [channels, selectedChannel]);

  const messages = useQuery(
    api.messages.listMessages,
    selectedChannel ? { channelId: selectedChannel } : "skip"
  );

  const directMessages: Channel[] = [
    { id: "alice", name: "Alice Johnson", type: "dm", unread: 2 },
    { id: "bob", name: "Bob Smith", type: "dm" },
    { id: "carol", name: "Carol Davis", type: "dm", unread: 1 },
  ];

  //   const messages: Message[] = [
  //     {
  //       id: "1",
  //       user: "Alice Johnson",
  //       avatar: "/diverse-woman-portrait.png",
  //       content:
  //         "Hey team! Just pushed the latest updates to the design system. Would love to get your feedback on the new components.",
  //       timestamp: "9:42 AM",
  //       reactions: [
  //         { emoji: "👍", count: 3 },
  //         { emoji: "🎉", count: 1 },
  //       ],
  //     },
  const sendMessage = useMutation(api.messages.sendMessage);

  const handleSendMessage = async () => {
    if (message.trim()) {
      await sendMessage({ text: message, channelId: selectedChannel! });
      setMessage("");
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
        {/* Workspace Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-sidebar-primary rounded flex items-center justify-center">
                <span className="text-xs font-bold text-sidebar-primary-foreground">
                  {organizations?.[0]?.name[0] || "N"}
                </span>
              </div>
              <span className="font-semibold text-sm">
                {organizations?.[0]?.name || "No org"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2">
          <div className="py-2 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Bell className="mr-2 h-4 w-4" />
              All unreads
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <User className="mr-2 h-4 w-4" />
              Threads
            </Button>
          </div>

          <Separator className="my-2 bg-sidebar-border" />

          {/* Channels */}
          <div className="py-2">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wide">
                Channels
              </span>
              {/* <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 text-sidebar-foreground/70 hover:bg-sidebar-accent"
              >
                <Plus className="h-3 w-3" />
              </Button> */}
              {organizations?.[0]?._id && (
                <CreateChannelModal orgId={organizations[0]._id} />
              )}
            </div>
            <div className="space-y-0.5">
              {channels?.map((channel) => (
                <Button
                  key={channel._id}
                  variant={
                    selectedChannel === channel._id ? "secondary" : "ghost"
                  }
                  className={`w-full justify-start text-sm font-normal ${
                    selectedChannel === channel._id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  onClick={() => setSelectedChannel(channel._id)}
                >
                  {channel.isPrivate ? (
                    <Lock className="mr-2 h-4 w-4" />
                  ) : (
                    <Hash className="mr-2 h-4 w-4" />
                  )}
                  <span className="truncate">{channel.name}</span>
                  {/* {channel.unread && (
                    <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                      {channel.unread}
                    </Badge>
                  )} */}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="my-2 bg-sidebar-border" />

          {/* Direct Messages */}
          <div className="py-2">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wide">
                Direct messages
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 text-sidebar-foreground/70 hover:bg-sidebar-accent"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-0.5">
              {directMessages.map((dm) => (
                <Button
                  key={dm.id}
                  variant="ghost"
                  className="w-full justify-start text-sm font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span className="truncate">{dm.name}</span>
                  {dm.unread && (
                    <Badge
                      variant="destructive"
                      className="ml-auto h-5 px-1.5 text-xs"
                    >
                      {dm.unread}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* User Profile */}
        <div className="p-2 border-t border-sidebar-border">
          <div className="flex items-center gap-2 p-2 rounded hover:bg-sidebar-accent cursor-pointer">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>{user?.fullName?.split(" ")[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                Active
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-sidebar-foreground/70 hover:bg-sidebar-accent"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Channel Header */}
        <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <h1 className="font-semibold text-lg">{selectedChannel}</h1>
            <Badge variant="secondary" className="text-xs">
              1,234 members
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages?.map((msg) => (
              <Message
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
        <div className="p-4 border-t border-border">
          <div className="flex items-end gap-2 bg-card border border-border rounded-lg p-3">
            <div className="flex-1">
              <Input
                placeholder={`Message #general`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0"
              />
            </div>
            <div className="flex items-center gap-1">
              {/* <Button variant="ghost" size="sm" className="h-8 w-8 p-0"> */}
              {/* <LogOut className="h-4 w-4" /> */}
              <SignOutButton />
              {/* </Button> */}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
