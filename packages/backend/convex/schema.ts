import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  /**
   * Users
   * - Synced with Clerk IDs (identity provider)
   */
  users: defineTable({
    clerkId: v.string(), // Clerk userId for auth
    name: v.string(),
    email: v.string(),
    avatarUrl: v.string(),
  }).index("by_clerkId", ["clerkId"]),

  /**
   * Organizations (Workspaces)
   */
  organizations: defineTable({
    name: v.string(),
    ownerId: v.string(), // links to users.clerkId
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  /**
   * Organization Memberships
   * - Many-to-many: users <-> organizations
   */
  orgMemberships: defineTable({
    orgId: v.string(),
    userId: v.string(), // Clerk userId
    role: v.string(), // "owner" | "admin" | "member" | "guest"
    joinedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_user", ["userId"])
    .index("by_user_org", ["userId", "orgId"]),

  /**
   * Channels inside organizations
   */
  channels: defineTable({
    orgId: v.string(),
    name: v.string(),
    isPrivate: v.boolean(),
    createdBy: v.string(), // clerkId
    createdAt: v.number(),
    // unread: v.boolean()
  }).index("by_org", ["orgId"]),

  /**
   * Channel Memberships
   * - For private channels
   */
  channelMemberships: defineTable({
    channelId: v.string(),
    userId: v.string(),
    role: v.string(), // "member" | "moderator"
    joinedAt: v.number(),
  })
    .index("by_channel", ["channelId"])
    .index("by_user", ["userId"]),

  /**
   * Messages
   */
  messages: defineTable({
    channelId: v.string(),
    orgId: v.string(),
    userId: v.string(), // Clerk userId
    text: v.string(),
    parentMessageId: v.string(), // for threads (optional)
    createdAt: v.number(),
    editedAt: v.number(),
  }).index("by_channel", ["channelId"]),

  /**
   * Reactions (emoji reactions to messages)
   */
  reactions: defineTable({
    messageId: v.string(),
    userId: v.string(),
    emoji: v.string(),
  }).index("by_message", ["messageId"]),
});
