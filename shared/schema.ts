import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  folderId: integer("folder_id").references(() => folders.id, { onDelete: 'cascade' }),
  favicon: text("favicon"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFolderSchema = createInsertSchema(folders).pick({
  name: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Folder = typeof folders.$inferSelect & {
  bookmarkCount?: number;
};

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;

export type BookmarkWithFolder = Bookmark & {
  folderName: string | null;
};
