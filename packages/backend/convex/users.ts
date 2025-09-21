// import { mutation, query } from "./_generated/server";
// import { v } from "convex/values";

// export const getUser = query({
//   args: { userId: v.string() },
//   handler: async (ctx, { userId }) => {
//     const users = await ctx.db
//       .query("users")
//       .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
//       .order("asc")
//       .collect();

//       return Promise.all(
//         users.map(async (user) => {
//             ...user
//         })
//       )
//   },
// });
