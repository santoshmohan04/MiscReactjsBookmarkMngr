import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/useBookmarks";
import { BookmarkWithFolder } from "@shared/schema";

interface BookmarkCardProps {
  bookmark: BookmarkWithFolder;
}

const BookmarkCard = ({ bookmark }: BookmarkCardProps) => {
  const { 
    setEditingBookmark, 
    setShowEditBookmarkModal, 
    setDeletingBookmark, 
    setShowConfirmDeleteDialog 
  } = useBookmarks();
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingBookmark(bookmark);
    setShowEditBookmarkModal(true);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDeletingBookmark(bookmark);
    setShowConfirmDeleteDialog(true);
  };
  
  // Handle favicon errors
  const handleFaviconError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://via.placeholder.com/32";
  };

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      {/* Card Header with Favicon and Folder Badge */}
      <div className="flex justify-between items-center p-3 bg-slate-50">
        <div className="flex items-center">
          <div className="w-8 h-8 flex items-center justify-center rounded-md bg-white border">
            <img 
              src={bookmark.favicon || `https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=64`}
              alt="Favicon" 
              className="w-5 h-5"
              onError={handleFaviconError}
            />
          </div>
          {bookmark.folderName && (
            <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
              {bookmark.folderName}
            </span>
          )}
        </div>
        
        {/* Actions */}
        <div className="invisible group-hover:visible flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-500 hover:text-primary"
            onClick={handleEdit}
            title="Edit Bookmark"
          >
            <i className="bi bi-pencil-square text-sm"></i>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-500 hover:text-red-500"
            onClick={handleDelete}
            title="Delete Bookmark"
          >
            <i className="bi bi-trash text-sm"></i>
          </Button>
        </div>
      </div>
      
      {/* Card Body with Title and URL */}
      <div className="p-4">
        <h3 className="font-medium mb-2">
          <a 
            href={bookmark.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline line-clamp-2"
          >
            {bookmark.title}
          </a>
        </h3>
        <p className="text-gray-500 text-sm truncate">{bookmark.url}</p>
      </div>
    </div>
  );
};

export default BookmarkCard;
