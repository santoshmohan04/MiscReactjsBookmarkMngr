import { useState, createContext, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Folder, InsertFolder } from "@shared/schema";

interface FolderContextState {
  folders: Folder[] | undefined;
  isLoading: boolean;
  activeFolderId: number | null;
  setActiveFolderId: (id: number | null) => void;
  showAddFolderModal: boolean;
  setShowAddFolderModal: (show: boolean) => void;
  showEditFolderModal: boolean;
  setShowEditFolderModal: (show: boolean) => void;
  editingFolder: Folder | null;
  setEditingFolder: (folder: Folder | null) => void;
  showConfirmDialog: boolean;
  setShowConfirmDialog: (show: boolean) => void;
  deletingFolder: Folder | null;
  setDeletingFolder: (folder: Folder | null) => void;
  createFolder: (folder: InsertFolder) => Promise<void>;
  updateFolder: (id: number, folder: InsertFolder) => Promise<void>;
  deleteFolder: (id: number) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

const FolderContext = createContext<FolderContextState | undefined>(undefined);

interface FolderProviderProps {
  children: React.ReactNode;
}

export const FolderProvider = ({ children }: FolderProviderProps) => {
  const { toast } = useToast();
  
  // State
  const [activeFolderId, setActiveFolderId] = useState<number | null>(null);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [showEditFolderModal, setShowEditFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null);
  
  // Queries
  const { data: folders, isLoading } = useQuery({
    queryKey: ['/api/folders'],
    refetchOnWindowFocus: false
  });
  
  // Mutations
  const createMutation = useMutation({
    mutationFn: async (folder: InsertFolder) => {
      const res = await apiRequest('POST', '/api/folders', folder);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      toast({
        title: "Success",
        description: "Folder created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
      console.error("Error creating folder:", error);
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, folder }: { id: number; folder: InsertFolder }) => {
      const res = await apiRequest('PUT', `/api/folders/${id}`, folder);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      toast({
        title: "Success",
        description: "Folder updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive",
      });
      console.error("Error updating folder:", error);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/folders/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      
      // If the active folder was deleted, switch to all bookmarks
      if (activeFolderId === deletedId) {
        setActiveFolderId(null);
      }
      
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
      console.error("Error deleting folder:", error);
    }
  });
  
  // Handler functions
  const createFolder = async (folder: InsertFolder) => {
    await createMutation.mutateAsync(folder);
  };
  
  const updateFolder = async (id: number, folder: InsertFolder) => {
    await updateMutation.mutateAsync({ id, folder });
  };
  
  const deleteFolder = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };
  
  return (
    <FolderContext.Provider
      value={{
        folders,
        isLoading,
        activeFolderId,
        setActiveFolderId,
        showAddFolderModal,
        setShowAddFolderModal,
        showEditFolderModal,
        setShowEditFolderModal,
        editingFolder,
        setEditingFolder,
        showConfirmDialog,
        setShowConfirmDialog,
        deletingFolder,
        setDeletingFolder,
        createFolder,
        updateFolder,
        deleteFolder,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending
      }}
    >
      {children}
    </FolderContext.Provider>
  );
};

export const useFolders = () => {
  const context = useContext(FolderContext);
  if (context === undefined) {
    throw new Error("useFolders must be used within a FolderProvider");
  }
  return context;
};