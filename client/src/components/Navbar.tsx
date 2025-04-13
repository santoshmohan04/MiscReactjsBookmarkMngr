import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useBookmarks } from "@/hooks/useBookmarks";

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { setSearchQuery, view, setView, setShowAddBookmarkModal } = useBookmarks();

  // Handle input changes for instant search
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Set the search query with a small debounce 
    if (value.trim()) {
      setSearchQuery(value.trim());
    } else {
      // When the search box is cleared, reset search query to show all bookmarks
      setSearchQuery("");
    }
  };
  
  // Form submission is now optional as search is instant
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Show toast only when form is submitted through Enter key or button click
    if (searchTerm.trim()) {
      toast({
        title: "Searching bookmarks",
        description: `Results for "${searchTerm.trim()}"`,
      });
    }
  };
  
  // Clear search function
  const clearSearch = () => {
    setSearchTerm("");
    setSearchQuery("");
  };

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="container mx-auto py-3 px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <i className="bi bi-bookmark-star-fill text-2xl"></i>
            <h1 className="text-xl font-bold">Bookmarks Manager</h1>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex-grow max-w-md relative">
          <Input
            type="search"
            placeholder="Search bookmarks..."
            className="w-full pr-16 text-black"
            value={searchTerm}
            onChange={handleSearchInputChange}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-9 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <i className="bi bi-x-circle"></i>
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Search"
          >
            <i className="bi bi-search"></i>
          </button>
        </form>

        <div className="flex items-center gap-2">
          <div className="bg-white bg-opacity-20 rounded-lg p-1 flex">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1 rounded-md ${
                view === "list" ? "bg-white text-primary" : "text-white"
              }`}
              title="List View"
            >
              <i className="bi bi-list-ul"></i>
            </button>
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1 rounded-md ${
                view === "grid" ? "bg-white text-primary" : "text-white"
              }`}
              title="Grid View"
            >
              <i className="bi bi-grid-3x3-gap-fill"></i>
            </button>
          </div>

          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowAddBookmarkModal(true)}
          >
            <i className="bi bi-plus-lg mr-1"></i> Add
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
