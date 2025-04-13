import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFolders } from "@/hooks/useFolders";
import { useBookmarks } from "@/hooks/useBookmarks";
import { insertBookmarkSchema } from "@shared/schema";

// Extend the schema to make validator more strict
const bookmarkFormSchema = insertBookmarkSchema
  .extend({
    url: z.string()
      .url("Please enter a valid URL")
      .startsWith("http", "URL must start with http:// or https://")
  });

type FormValues = z.infer<typeof bookmarkFormSchema>;

const BookmarkModal = () => {
  const { folders } = useFolders();
  const { 
    showAddBookmarkModal, 
    showEditBookmarkModal, 
    setShowAddBookmarkModal, 
    setShowEditBookmarkModal, 
    editingBookmark,
    createBookmark,
    updateBookmark,
    isCreating,
    isUpdating
  } = useBookmarks();
  
  const isOpen = showAddBookmarkModal || showEditBookmarkModal;
  const isEditing = !!editingBookmark?.id;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(bookmarkFormSchema),
    defaultValues: {
      title: "",
      url: "",
      folderId: undefined,
      favicon: ""
    },
  });
  
  // Update form when editing bookmark changes
  useEffect(() => {
    if (editingBookmark) {
      form.reset({
        title: editingBookmark.title,
        url: editingBookmark.url,
        folderId: editingBookmark.folderId,
        favicon: editingBookmark.favicon || ""
      });
    } else {
      form.reset({
        title: "",
        url: "",
        folderId: undefined,
        favicon: ""
      });
    }
  }, [editingBookmark, form]);
  
  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing && editingBookmark) {
        await updateBookmark(editingBookmark.id, data);
      } else {
        await createBookmark(data);
      }
      
      handleClose();
    } catch (error) {
      console.error("Error saving bookmark:", error);
    }
  };
  
  const handleClose = () => {
    if (showAddBookmarkModal) {
      setShowAddBookmarkModal(false);
    }
    if (showEditBookmarkModal) {
      setShowEditBookmarkModal(false);
    }
    form.reset();
  };
  
  // Extract favicon from URL
  const extractFavicon = (url: string) => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch (e) {
      return "";
    }
  };
  
  // Update favicon when URL changes
  useEffect(() => {
    const url = form.watch("url");
    if (url && url.startsWith("http")) {
      const favicon = extractFavicon(url);
      form.setValue("favicon", favicon);
    }
  }, [form.watch("url")]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Bookmark" : "Add Bookmark"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* URL Input */}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Title Input */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Bookmark Title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Folder Select */}
            <FormField
              control={form.control}
              name="folderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder</FormLabel>
                  <Select
                    onValueChange={(value) => value === "none" ? field.onChange(null) : field.onChange(Number(value))}
                    defaultValue={field.value ? field.value.toString() : "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a folder" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {folders?.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id.toString()}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isCreating || isUpdating}
              >
                {(isCreating || isUpdating) && (
                  <i className="bi bi-arrow-repeat mr-2 animate-spin"></i>
                )}
                {isEditing ? "Save" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BookmarkModal;
