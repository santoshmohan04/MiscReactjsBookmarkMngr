import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import BookmarkListItem from "./BookmarkListItem";
import BookmarkCard from "./BookmarkCard";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useFolders } from "@/hooks/useFolders";

const BookmarksView = () => {
  const { 
    bookmarks, 
    isLoading, 
    view, 
    searchQuery,
    setShowAddBookmarkModal,
    filteredBookmarks,
    activeFolderId
  } = useBookmarks();
  
  const { folders, activeFolderId: folderIdFromContext } = useFolders();
  
  // Get the active folder name
  const activeFolder = folders?.find(f => f.id === folderIdFromContext);
  const folderName = folderIdFromContext ? (activeFolder?.name || 'Unknown folder') : 'All Bookmarks';
  
  return (
    <Card className="flex-grow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {searchQuery 
            ? `Search results for: ${searchQuery}` 
            : folderName}
        </h2>
        <div className="flex items-center gap-3">
          <div className="text-gray-500 text-sm">
            {filteredBookmarks?.length || 0} bookmarks
          </div>
          <Button 
            onClick={() => setShowAddBookmarkModal(true)}
            className="flex items-center"
            variant="default"
            size="sm"
          >
            <i className="bi bi-plus-lg mr-1"></i> Add Bookmark
          </Button>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && filteredBookmarks?.length === 0 && (
        <div className="text-center py-12">
          <i className="bi bi-bookmark-x text-5xl text-gray-300"></i>
          <p className="mt-4 text-gray-500">
            {searchQuery 
              ? `No bookmarks found for "${searchQuery}".` 
              : "No bookmarks found in this folder."}
          </p>
          <Button 
            className="mt-4"
            onClick={() => setShowAddBookmarkModal(true)}
          >
            <i className="bi bi-plus-lg mr-1"></i> Add Bookmark
          </Button>
        </div>
      )}
      
      {/* List View */}
      {!isLoading && filteredBookmarks?.length > 0 && view === "list" && (
        <div className="divide-y">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkListItem key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      )}
      
      {/* Grid View */}
      {!isLoading && filteredBookmarks?.length > 0 && view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      )}
    </Card>
  );
};

export default BookmarksView;
