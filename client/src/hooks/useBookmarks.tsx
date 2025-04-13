import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BookmarkWithFolder, InsertBookmark } from "@shared/schema";

type ViewType = "list" | "grid";

interface BookmarkContextState {
  bookmarks: BookmarkWithFolder[] | undefined;
  filteredBookmarks: BookmarkWithFolder[] | undefined;
  isLoading: boolean;
  view: ViewType;
  setView: (view: ViewType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showAddBookmarkModal: boolean;
  setShowAddBookmarkModal: (show: boolean) => void;
  showEditBookmarkModal: boolean;
  setShowEditBookmarkModal: (show: boolean) => void;
  editingBookmark: BookmarkWithFolder | null;
  setEditingBookmark: (bookmark: BookmarkWithFolder | null) => void;
  showConfirmDeleteDialog: boolean;
  setShowConfirmDeleteDialog: (show: boolean) => void;
  deletingBookmark: BookmarkWithFolder | null;
  setDeletingBookmark: (bookmark: BookmarkWithFolder | null) => void;
  createBookmark: (bookmark: InsertBookmark) => Promise<void>;
  updateBookmark: (id: number, bookmark: InsertBookmark) => Promise<void>;
  deleteBookmark: (id: number) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  activeFolderId: number | null;
  fetchBookmarks: (folderId: number | null) => void;
}

const BookmarkContext = createContext<BookmarkContextState | undefined>(undefined);

interface BookmarkProviderProps {
  children: React.ReactNode;
}

export const BookmarkProvider = ({ children }: BookmarkProviderProps) => {
  const { toast } = useToast();
  
  // State
  const [view, setView] = useState<ViewType>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);
  const [showEditBookmarkModal, setShowEditBookmarkModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkWithFolder | null>(null);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [deletingBookmark, setDeletingBookmark] = useState<BookmarkWithFolder | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<number | null>(null);
  
  // Build the query key based on filters
  const getQueryKey = useCallback(() => {
    const baseKey = '/api/bookmarks';
    
    if (searchQuery) {
      return [baseKey, { search: searchQuery }];
    }
    
    if (activeFolderId !== null) {
      return [baseKey, { folderId: activeFolderId }];
    }
    
    return [baseKey];
  }, [searchQuery, activeFolderId]);
  
  // Construct the URL for fetching bookmarks
  const getBookmarksUrl = useCallback(() => {
    let url = '/api/bookmarks';
    
    if (searchQuery) {
      url += `?search=${encodeURIComponent(searchQuery)}`;
      return url;
    }
    
    if (activeFolderId !== null) {
      url += `?folderId=${activeFolderId}`;
      return url;
    }
    
    return url;
  }, [searchQuery, activeFolderId]);
  
  // Queries
  const { 
    data: bookmarks, 
    isLoading,
    refetch: refetchBookmarks
  } = useQuery<BookmarkWithFolder[]>({
    queryKey: getQueryKey(),
    enabled: true,
    queryFn: async () => {
      const response = await fetch(getBookmarksUrl());
      const data = await response.json();
      return data;
    },
    refetchOnWindowFocus: false
  });
  
  // Computed state
  const filteredBookmarks = bookmarks || [];
  
  // Mutations
  const createMutation = useMutation({
    mutationFn: async (bookmark: InsertBookmark) => {
      const res = await apiRequest('POST', '/api/bookmarks', bookmark);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      toast({
        title: "Success",
        description: "Bookmark created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create bookmark",
        variant: "destructive",
      });
      console.error("Error creating bookmark:", error);
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, bookmark }: { id: number; bookmark: InsertBookmark }) => {
      const res = await apiRequest('PUT', `/api/bookmarks/${id}`, bookmark);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      toast({
        title: "Success",
        description: "Bookmark updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
      console.error("Error updating bookmark:", error);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/bookmarks/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      toast({
        title: "Success",
        description: "Bookmark deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete bookmark",
        variant: "destructive",
      });
      console.error("Error deleting bookmark:", error);
    }
  });
  
  // Handler functions
  const createBookmark = async (bookmark: InsertBookmark) => {
    await createMutation.mutateAsync(bookmark);
  };
  
  const updateBookmark = async (id: number, bookmark: InsertBookmark) => {
    await updateMutation.mutateAsync({ id, bookmark });
  };
  
  const deleteBookmark = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };
  
  // Refetch bookmarks when folder or search changes
  const fetchBookmarks = useCallback((folderId: number | null) => {
    setActiveFolderId(folderId);
    // Force refresh if needed
    refetchBookmarks();
  }, [refetchBookmarks]);
  
  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        filteredBookmarks,
        isLoading,
        view,
        setView,
        searchQuery,
        setSearchQuery,
        showAddBookmarkModal,
        setShowAddBookmarkModal,
        showEditBookmarkModal,
        setShowEditBookmarkModal,
        editingBookmark,
        setEditingBookmark,
        showConfirmDeleteDialog,
        setShowConfirmDeleteDialog,
        deletingBookmark,
        setDeletingBookmark,
        createBookmark,
        updateBookmark,
        deleteBookmark,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        activeFolderId,
        fetchBookmarks
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
};