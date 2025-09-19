import { pgTable, text, serial, integer, boolean, timestamp, varchar, decimal, bigint, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // UUID from Supabase Auth
  email: text("email"),
  username: text("username").unique(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  college: text("college"),
  bio: text("bio"),
  profile_picture: text("profile_picture"),
  created_at: timestamp("created_at").defaultNow(),
});

export const cafes = pgTable("cafes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  campus: text("campus"),
  google_place_id: text("google_place_id"),
  geoapify_place_id: text("geoapify_place_id"),
  osm_id: bigint("osm_id", { mode: "number" }),
  lat: decimal("lat", { precision: 10, scale: 8 }),
  lng: decimal("lng", { precision: 11, scale: 8 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  category: text("category").default("cafe"),
  cuisine_type: text("cuisine_type").default("coffee"),
  price_range: text("price_range").default("$$"),
  created_at: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cafe_id: varchar("cafe_id").notNull().references(() => cafes.id),
  user_id: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  blurb: text("blurb"),
  photo_url: text("photo_url"),
  tagged_friends: jsonb("tagged_friends").default(sql`'[]'::jsonb`),
  created_at: timestamp("created_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id).unique(),
  notifications: boolean("notifications").default(true),
  preferred_cafes: text("preferred_cafes").array(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  follower_id: varchar("follower_id").notNull().references(() => users.id),
  followee_id: varchar("followee_id").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
});

export const userFavorites = pgTable("user_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id),
  item_name: text("item_name").notNull(),
  item_type: text("item_type").notNull(), // 'coffee' or 'food'
  created_at: timestamp("created_at").defaultNow(),
});

export const sharedCafes = pgTable("shared_cafes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id),
  cafe_id: varchar("cafe_id").notNull().references(() => cafes.id),
  caption: text("caption"),
  created_at: timestamp("created_at").defaultNow(),
});

export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id),
  shared_cafe_id: varchar("shared_cafe_id").notNull().references(() => sharedCafes.id),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
});

export const insertCafeSchema = createInsertSchema(cafes).omit({
  id: true,
  created_at: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  created_at: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  created_at: true,
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  created_at: true,
});

export const insertSharedCafeSchema = createInsertSchema(sharedCafes).omit({
  id: true,
  created_at: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  created_at: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCafe = z.infer<typeof insertCafeSchema>;
export type Cafe = typeof cafes.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof follows.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertSharedCafe = z.infer<typeof insertSharedCafeSchema>;
export type SharedCafe = typeof sharedCafes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Like = typeof likes.$inferSelect;
