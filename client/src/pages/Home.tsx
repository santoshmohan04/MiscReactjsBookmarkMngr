import { useEffect } from "react";
import BookmarksView from "@/components/BookmarksView";
import FoldersSidebar from "@/components/FoldersSidebar";
import BookmarkModal from "@/components/BookmarkModal";
import FolderModal from "@/components/FolderModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useFolders } from "@/hooks/useFolders";
import { useBookmarks } from "@/hooks/useBookmarks";

const Home = () => {
  const { 
    showConfirmDialog, 
    setShowConfirmDialog, 
    deleteFolder, 
    deletingFolder,
    isDeleting: isDeletingFolder,
    activeFolderId
  } = useFolders();
  
  const { 
    showConfirmDeleteDialog, 
    setShowConfirmDeleteDialog, 
    deleteBookmark, 
    deletingBookmark,
    isDeleting: isDeletingBookmark,
    fetchBookmarks
  } = useBookmarks();
  
  // Fetch bookmarks when active folder changes
  useEffect(() => {
    fetchBookmarks(activeFolderId);
  }, [activeFolderId, fetchBookmarks]);
  
  const handleDeleteFolder = async () => {
    if (deletingFolder) {
      await deleteFolder(deletingFolder.id);
      setShowConfirmDialog(false);
    }
  };
  
  const handleDeleteBookmark = async () => {
    if (deletingBookmark) {
      await deleteBookmark(deletingBookmark.id);
      setShowConfirmDeleteDialog(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <FoldersSidebar />
        <BookmarksView />
      </div>
      
      {/* Modals */}
      <BookmarkModal />
      <FolderModal />
      
      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleDeleteFolder}
        title="Delete Folder"
        description={`Are you sure you want to delete the folder "${deletingFolder?.name}"? All bookmarks inside will be deleted.`}
        isDeleting={isDeletingFolder}
      />
      
      <ConfirmDialog
        open={showConfirmDeleteDialog}
        onOpenChange={setShowConfirmDeleteDialog}
        onConfirm={handleDeleteBookmark}
        title="Delete Bookmark"
        description={`Are you sure you want to delete the bookmark "${deletingBookmark?.title}"?`}
        isDeleting={isDeletingBookmark}
      />
    </div>
  );
};

export default Home;
