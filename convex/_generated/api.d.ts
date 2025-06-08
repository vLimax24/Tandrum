/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as clerk from "../clerk.js";
import type * as duoConnections from "../duoConnections.js";
import type * as duoHabits from "../duoHabits.js";
import type * as duoInvites from "../duoInvites.js";
import type * as http from "../http.js";
import type * as treeItems from "../treeItems.js";
import type * as trees from "../trees.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  clerk: typeof clerk;
  duoConnections: typeof duoConnections;
  duoHabits: typeof duoHabits;
  duoInvites: typeof duoInvites;
  http: typeof http;
  treeItems: typeof treeItems;
  trees: typeof trees;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
