import { type User, type InsertUser, type Folder, type InsertFolder, type Bookmark, type InsertBookmark, type BookmarkWithFolder } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private folders: Map<number, Folder>;
  private bookmarks: Map<number, Bookmark>;
  private userId: number;
  private folderId: number;
  private bookmarkId: number;

  constructor() {
    this.users = new Map();
    this.folders = new Map();
    this.bookmarks = new Map();
    this.userId = 1;
    this.folderId = 1;
    this.bookmarkId = 1;
    
    // Add some initial folders
    this.createFolder({ name: "Development" });
    this.createFolder({ name: "Learning" });
    this.createFolder({ name: "Work" });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Folder methods
  async getAllFolders(): Promise<Folder[]> {
    return Array.from(this.folders.values());
  }

  async getFolderById(id: number): Promise<Folder | undefined> {
    return this.folders.get(id);
  }

  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const id = this.folderId++;
    const folder: Folder = { ...insertFolder, id };
    this.folders.set(id, folder);
    return folder;
  }

  async updateFolder(id: number, insertFolder: InsertFolder): Promise<Folder | undefined> {
    const folder = this.folders.get(id);
    if (!folder) return undefined;
    
    const updatedFolder = { ...folder, ...insertFolder };
    this.folders.set(id, updatedFolder);
    return updatedFolder;
  }

  async deleteFolder(id: number): Promise<boolean> {
    // Delete all bookmarks in this folder
    const bookmarksToDelete = Array.from(this.bookmarks.values())
      .filter(bookmark => bookmark.folderId === id);
    
    for (const bookmark of bookmarksToDelete) {
      this.bookmarks.delete(bookmark.id);
    }
    
    return this.folders.delete(id);
  }

  // Bookmark methods
  async getAllBookmarks(): Promise<BookmarkWithFolder[]> {
    return Array.from(this.bookmarks.values()).map(bookmark => {
      const folder = bookmark.folderId ? this.folders.get(bookmark.folderId) : null;
      return {
        ...bookmark,
        folderName: folder ? folder.name : null
      };
    });
  }

  async getBookmarksByFolderId(folderId: number): Promise<BookmarkWithFolder[]> {
    return Array.from(this.bookmarks.values())
      .filter(bookmark => bookmark.folderId === folderId)
      .map(bookmark => {
        const folder = this.folders.get(folderId);
        return {
          ...bookmark,
          folderName: folder ? folder.name : null
        };
      });
  }

  async getBookmarkById(id: number): Promise<BookmarkWithFolder | undefined> {
    const bookmark = this.bookmarks.get(id);
    if (!bookmark) return undefined;
    
    const folder = bookmark.folderId ? this.folders.get(bookmark.folderId) : null;
    return {
      ...bookmark,
      folderName: folder ? folder.name : null
    };
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.bookmarkId++;
    const bookmark: Bookmark = { ...insertBookmark, id };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async updateBookmark(id: number, insertBookmark: InsertBookmark): Promise<Bookmark | undefined> {
    const bookmark = this.bookmarks.get(id);
    if (!bookmark) return undefined;
    
    const updatedBookmark = { ...bookmark, ...insertBookmark };
    this.bookmarks.set(id, updatedBookmark);
    return updatedBookmark;
  }

  async deleteBookmark(id: number): Promise<boolean> {
    return this.bookmarks.delete(id);
  }

  async searchBookmarks(searchTerm: string): Promise<BookmarkWithFolder[]> {
    const term = searchTerm.toLowerCase();
    return Array.from(this.bookmarks.values())
      .filter(bookmark => 
        bookmark.title.toLowerCase().includes(term) || 
        bookmark.url.toLowerCase().includes(term)
      )
      .map(bookmark => {
        const folder = bookmark.folderId ? this.folders.get(bookmark.folderId) : null;
        return {
          ...bookmark,
          folderName: folder ? folder.name : null
        };
      });
  }
}

export const storage = new MemStorage();
