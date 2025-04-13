import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/useBookmarks";
import { BookmarkWithFolder } from "@shared/schema";

interface BookmarkListItemProps {
  bookmark: BookmarkWithFolder;
}

const BookmarkListItem = ({ bookmark }: BookmarkListItemProps) => {
  const { 
    setEditingBookmark, 
    setShowEditBookmarkModal, 
    setDeletingBookmark,

    setShowConfirmDeleteDialog 
  } = useBookmarks();
  
  const handleEdit = () => {
    setEditingBookmark(bookmark);
    setShowEditBookmarkModal(true);
  };
  
  const handleDelete = () => {
    setDeletingBookmark(bookmark);
    setShowConfirmDeleteDialog(true);
  };
  
  // Handle favicon errors
  const handleFaviconError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://via.placeholder.com/32";
  };

  return (
    <div className="py-3 flex items-center group">
      {/* Favicon and Link */}
      <div className="flex-grow flex items-center">
        <div className="w-10 h-10 flex items-center justify-center mr-3 rounded-md bg-slate-50">
          <img 
            src={bookmark.favicon || `https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=64`}
            alt="Favicon" 
            className="w-6 h-6"
            onError={handleFaviconError}
          />
        </div>
        <div>
          <a 
            href={bookmark.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            {bookmark.title}
          </a>
          <div className="text-gray-500 text-sm truncate max-w-md">
            {bookmark.url}
          </div>
        </div>
      </div>
      
      {/* Folder Badge & Actions */}
      <div className="flex items-center space-x-2">
        {bookmark.folderName && (
          <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
            {bookmark.folderName}
          </span>
        )}
        
        {/* Actions */}
        <div className="invisible group-hover:visible flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-primary"
            onClick={handleEdit}
            title="Edit Bookmark"
          >
            <i className="bi bi-pencil-square"></i>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-500"
            onClick={handleDelete}
            title="Delete Bookmark"
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookmarkListItem;
