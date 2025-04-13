import { type User, type InsertUser, type Folder, type InsertFolder, type Bookmark, type InsertBookmark, type BookmarkWithFolder, users, folders, bookmarks } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, sql, count } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Folder methods
  getAllFolders(): Promise<Folder[]>;
  getFolderById(id: number): Promise<Folder | undefined>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: number, folder: InsertFolder): Promise<Folder | undefined>;
  deleteFolder(id: number): Promise<boolean>;
  
  // Bookmark methods
  getAllBookmarks(): Promise<BookmarkWithFolder[]>;
  getBookmarksByFolderId(folderId: number): Promise<BookmarkWithFolder[]>;
  getBookmarkById(id: number): Promise<BookmarkWithFolder | undefined>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  updateBookmark(id: number, bookmark: InsertBookmark): Promise<Bookmark | undefined>;
  deleteBookmark(id: number): Promise<boolean>;
  searchBookmarks(searchTerm: string): Promise<BookmarkWithFolder[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Folder methods
  async getAllFolders(): Promise<Folder[]> {
    // Count bookmarks in each folder for UI display
    const result = await db
      .select({
        id: folders.id,
        name: folders.name,
        bookmarkCount: sql<number>`count(${bookmarks.id})`.mapWith(Number),
      })
      .from(folders)
      .leftJoin(bookmarks, eq(folders.id, bookmarks.folderId))
      .groupBy(folders.id, folders.name);
    
    return result;
  }

  async getFolderById(id: number): Promise<Folder | undefined> {
    const result = await db.select().from(folders).where(eq(folders.id, id));
    return result[0];
  }

  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const result = await db.insert(folders).values(insertFolder).returning();
    // Add bookmarkCount for consistency with the Folder type
    return { ...result[0], bookmarkCount: 0 };
  }

  async updateFolder(id: number, insertFolder: InsertFolder): Promise<Folder | undefined> {
    const result = await db
      .update(folders)
      .set(insertFolder)
      .where(eq(folders.id, id))
      .returning();
    
    return result[0];
  }

  async deleteFolder(id: number): Promise<boolean> {
    // Note: We don't need to delete bookmarks explicitly because
    // we have onDelete: 'cascade' in our schema
    const result = await db
      .delete(folders)
      .where(eq(folders.id, id))
      .returning();
    
    return result.length > 0;
  }

  // Bookmark methods
  async getAllBookmarks(): Promise<BookmarkWithFolder[]> {
    const result = await db
      .select({
        id: bookmarks.id,
        title: bookmarks.title,
        url: bookmarks.url,
        folderId: bookmarks.folderId,
        favicon: bookmarks.favicon,
        folderName: folders.name,
      })
      .from(bookmarks)
      .leftJoin(folders, eq(bookmarks.folderId, folders.id));
    
    return result;
  }

  async getBookmarksByFolderId(folderId: number): Promise<BookmarkWithFolder[]> {
    const result = await db
      .select({
        id: bookmarks.id,
        title: bookmarks.title,
        url: bookmarks.url,
        folderId: bookmarks.folderId,
        favicon: bookmarks.favicon,
        folderName: folders.name,
      })
      .from(bookmarks)
      .leftJoin(folders, eq(bookmarks.folderId, folders.id))
      .where(eq(bookmarks.folderId, folderId));
    
    return result;
  }

  async getBookmarkById(id: number): Promise<BookmarkWithFolder | undefined> {
    const result = await db
      .select({
        id: bookmarks.id,
        title: bookmarks.title,
        url: bookmarks.url,
        folderId: bookmarks.folderId,
        favicon: bookmarks.favicon,
        folderName: folders.name,
      })
      .from(bookmarks)
      .leftJoin(folders, eq(bookmarks.folderId, folders.id))
      .where(eq(bookmarks.id, id));
    
    return result[0];
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const result = await db
      .insert(bookmarks)
      .values(insertBookmark)
      .returning();
    
    return result[0];
  }

  async updateBookmark(id: number, insertBookmark: InsertBookmark): Promise<Bookmark | undefined> {
    const result = await db
      .update(bookmarks)
      .set(insertBookmark)
      .where(eq(bookmarks.id, id))
      .returning();
    
    return result[0];
  }

  async deleteBookmark(id: number): Promise<boolean> {
    const result = await db
      .delete(bookmarks)
      .where(eq(bookmarks.id, id))
      .returning();
    
    return result.length > 0;
  }

  async searchBookmarks(searchTerm: string): Promise<BookmarkWithFolder[]> {
    const result = await db
      .select({
        id: bookmarks.id,
        title: bookmarks.title,
        url: bookmarks.url,
        folderId: bookmarks.folderId,
        favicon: bookmarks.favicon,
        folderName: folders.name,
      })
      .from(bookmarks)
      .leftJoin(folders, eq(bookmarks.folderId, folders.id))
      .where(
        or(
          ilike(bookmarks.title, `%${searchTerm}%`),
          ilike(bookmarks.url, `%${searchTerm}%`)
        )
      );
    
    return result;
  }
}

// Initialize database with some folders if none exist
async function initializeDatabase() {
  const existingFolders = await db.select().from(folders);
  
  if (existingFolders.length === 0) {
    await db.insert(folders).values([
      { name: "Development" },
      { name: "Learning" },
      { name: "Work" }
    ]);
  }
}

// Initialize the database with default data
initializeDatabase().catch(console.error);

export const storage = new DatabaseStorage();
