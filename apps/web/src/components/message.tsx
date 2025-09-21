import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface Message {
  id: string;
  userId: string;
  createdAt: number;
  text: string;
  avatarUrl: string
  fullName: string
}

function formatTime(timestamp: any) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function Message(props: Message) {

  const { id, userId, createdAt, text, avatarUrl, fullName } = props;
  return (
    <div
      key={id}
      className="flex gap-3 group hover:bg-accent/50 -mx-4 px-4 py-2 rounded"
    >
      <Avatar className="h-9 w-9 mt-0.5">
        <AvatarImage src={avatarUrl || "/placeholder.svg"} />
        <AvatarFallback>
           {fullName
            .split(" ")
            .map((n) => n[0])
            .join("")} 
            
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-sm">{fullName}</span>
          <span className="text-xs text-muted-foreground">
            {formatTime(createdAt)}
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{text}</p>
        {/* {msg.reactions && (
          <div className="flex gap-1 mt-2">
            {msg.reactions.map((reaction, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs hover:bg-accent bg-transparent"
              >
                {reaction.emoji} {reaction.count}
              </Button>
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
}
