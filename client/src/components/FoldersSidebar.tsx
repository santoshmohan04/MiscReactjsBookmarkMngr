import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFolders } from "@/hooks/useFolders";
import { useBookmarks } from "@/hooks/useBookmarks";

const FoldersSidebar = () => {
  const { 
    folders, 
    isLoading: foldersLoading, 
    setShowAddFolderModal, 
    setEditingFolder,
    setShowEditFolderModal,
    setDeletingFolder,
    setShowConfirmDialog,
    activeFolderId,
    setActiveFolderId
  } = useFolders();
  
  const { bookmarks } = useBookmarks();
  
  const handleEditClick = (e: React.MouseEvent, folderId: number) => {
    e.stopPropagation();
    const folder = folders?.find(f => f.id === folderId);
    if (folder) {
      setEditingFolder(folder);
      setShowEditFolderModal(true);
    }
  };
  
  const handleDeleteClick = (e: React.MouseEvent, folderId: number) => {
    e.stopPropagation();
    const folder = folders?.find(f => f.id === folderId);
    if (folder) {
      setDeletingFolder(folder);
      setShowConfirmDialog(true);
    }
  };

  return (
    <Card className="md:w-64 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Folders</h2>
        <Button 
          variant="default" 
          size="sm" 
          className="flex items-center"
          title="Add Folder"
          onClick={() => setShowAddFolderModal(true)}
        >
          <i className="bi bi-folder-plus mr-1"></i>
          <span>Add Folder</span>
        </Button>
      </div>
      
      {foldersLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {/* All Bookmarks item */}
          {/* <li>
            <div
              className={`flex items-center p-2 rounded-md cursor-pointer ${
                activeFolderId === null 
                  ? "bg-primary bg-opacity-10 text-primary" 
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveFolderId(null)}
            >
              <i className="bi bi-collection mr-2"></i>
              <span className="flex-grow truncate">All Bookmarks</span>
              <span className="ml-1 px-2 py-1 text-xs bg-primary bg-opacity-20 text-primary rounded-full min-w-[24px] text-center">
                {bookmarks?.length || 0}
              </span>
            </div>
          </li> */}
          
          {/* Folder items */}
          {folders?.map((folder) => {
            const bookmarkCount = bookmarks?.filter(b => b.folderId === folder.id).length || 0;
            return (
              <li key={folder.id}>
                <div
                  className={`flex items-center p-2 rounded-md cursor-pointer group ${
                    activeFolderId === folder.id 
                      ? "bg-primary bg-opacity-10 text-primary" 
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveFolderId(folder.id)}
                >
                  <i className="bi bi-folder mr-2"></i>
                  <span className="flex-grow truncate">{folder.name}</span>
                  <span className="ml-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full min-w-[24px] text-center">
                    {bookmarkCount}
                  </span>
                  
                  {/* Actions */}
                  <div className="hidden group-hover:flex items-center space-x-1 ml-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-500 hover:text-primary p-0"
                      onClick={(e) => handleEditClick(e, folder.id)}
                      title="Edit Folder"
                    >
                      <i className="bi bi-pencil-square text-xs"></i>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-500 hover:text-red-500 p-0"
                      onClick={(e) => handleDeleteClick(e, folder.id)}
                      title="Delete Folder"
                    >
                      <i className="bi bi-trash text-xs"></i>
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default FoldersSidebar;
