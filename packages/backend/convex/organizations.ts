import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

export const createOrg = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const orgId = await ctx.db.insert("organizations", {
      name: name,
      ownerId: identity.subject,
      createdAt: Date.now()
    })
    await ctx.db.insert("users", {
      name: identity.name!,
      clerkId: identity.subject,
      email: identity.email!,
      avatarUrl: identity.pictureUrl!
    })

    await ctx.db.insert("orgMemberships", {
      orgId,
      userId: identity.subject,
      role: "owner",
      joinedAt: Date.now(),
    });

    const channelId = await ctx.db.insert("channels", {
      orgId,
      name: "general",
      isPrivate: false,
      createdBy: identity.subject,
      createdAt: Date.now(),
    });

    return { orgId, channelId };
  },
});

export const getOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const memberships = await ctx.db
      .query("orgMemberships")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const orgs = await Promise.all(
      memberships.map(async (membership) => {
        const org = (await ctx.db.get(membership.orgId as any)) as Doc<"organizations">;
        if (!org) {
          throw new Error("Organization not found");
        }
        return org;
      })
    );

    return orgs;
  },
});