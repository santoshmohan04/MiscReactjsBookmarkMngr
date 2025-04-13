import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFolderSchema, insertBookmarkSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - prefix with /api
  const apiRouter = express.Router();

  // Folder routes
  apiRouter.get("/folders", async (req, res) => {
    try {
      const folders = await storage.getAllFolders();
      
      // Get bookmark counts for each folder
      const allBookmarks = await storage.getAllBookmarks();
      
      const foldersWithCounts = folders.map(folder => {
        const bookmarkCount = allBookmarks.filter(bm => bm.folderId === folder.id).length;
        return {
          ...folder,
          bookmarkCount
        };
      });
      
      res.json(foldersWithCounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  apiRouter.get("/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }

      const folder = await storage.getFolderById(id);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }

      res.json(folder);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch folder" });
    }
  });

  apiRouter.post("/folders", async (req, res) => {
    try {
      const validatedData = insertFolderSchema.parse(req.body);
      const folder = await storage.createFolder(validatedData);
      res.status(201).json(folder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid folder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create folder" });
    }
  });

  apiRouter.put("/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }

      const validatedData = insertFolderSchema.parse(req.body);
      const updatedFolder = await storage.updateFolder(id, validatedData);
      
      if (!updatedFolder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      
      res.json(updatedFolder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid folder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update folder" });
    }
  });

  apiRouter.delete("/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }

      const success = await storage.deleteFolder(id);
      if (!success) {
        return res.status(404).json({ message: "Folder not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });

  // Bookmark routes
  apiRouter.get("/bookmarks", async (req, res) => {
    try {
      const { folderId, search } = req.query;
      
      if (search && typeof search === 'string') {
        const bookmarks = await storage.searchBookmarks(search);
        return res.json(bookmarks);
      }
      
      if (folderId && typeof folderId === 'string') {
        const id = parseInt(folderId);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid folder ID" });
        }
        
        const bookmarks = await storage.getBookmarksByFolderId(id);
        return res.json(bookmarks);
      }
      
      const bookmarks = await storage.getAllBookmarks();
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  apiRouter.get("/bookmarks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bookmark ID" });
      }

      const bookmark = await storage.getBookmarkById(id);
      if (!bookmark) {
        return res.status(404).json({ message: "Bookmark not found" });
      }

      res.json(bookmark);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookmark" });
    }
  });

  apiRouter.post("/bookmarks", async (req, res) => {
    try {
      const validatedData = insertBookmarkSchema.parse(req.body);
      
      // Default favicon if not provided
      if (!validatedData.favicon && validatedData.url) {
        try {
          const urlObj = new URL(validatedData.url);
          validatedData.favicon = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
        } catch (e) {
          // Invalid URL, skip favicon
        }
      }
      
      const bookmark = await storage.createBookmark(validatedData);
      res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bookmark data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create bookmark" });
    }
  });

  apiRouter.put("/bookmarks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bookmark ID" });
      }

      const validatedData = insertBookmarkSchema.parse(req.body);
      const updatedBookmark = await storage.updateBookmark(id, validatedData);
      
      if (!updatedBookmark) {
        return res.status(404).json({ message: "Bookmark not found" });
      }
      
      res.json(updatedBookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bookmark data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update bookmark" });
    }
  });

  apiRouter.delete("/bookmarks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bookmark ID" });
      }

      const success = await storage.deleteBookmark(id);
      if (!success) {
        return res.status(404).json({ message: "Bookmark not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bookmark" });
    }
  });

  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
