import { pgTable, text, serial, integer, boolean, timestamp, varchar, decimal, bigint } from "drizzle-orm/pg-core";
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
  created_at: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cafe_id: varchar("cafe_id").notNull().references(() => cafes.id),
  user_id: varchar("user_id").notNull(),
  rating: integer("rating").notNull(),
  blurb: text("blurb"),
  photo_url: text("photo_url"),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCafe = z.infer<typeof insertCafeSchema>;
export type Cafe = typeof cafes.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
