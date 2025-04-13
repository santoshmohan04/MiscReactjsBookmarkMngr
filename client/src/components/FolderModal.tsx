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
import { useFolders } from "@/hooks/useFolders";
import { insertFolderSchema } from "@shared/schema";

// Extended schema for validation
const folderFormSchema = insertFolderSchema
  .extend({
    name: z.string()
      .min(1, "Folder name is required")
      .max(50, "Folder name must be less than 50 characters")
  });

type FormValues = z.infer<typeof folderFormSchema>;

const FolderModal = () => {
  const { 
    showAddFolderModal, 
    showEditFolderModal, 
    setShowAddFolderModal, 
    setShowEditFolderModal, 
    editingFolder,
    createFolder,
    updateFolder,
    isCreating,
    isUpdating
  } = useFolders();
  
  const isOpen = showAddFolderModal || showEditFolderModal;
  const isEditing = !!editingFolder?.id;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: {
      name: "",
    },
  });
  
  // Update form when editing folder changes
  useEffect(() => {
    if (editingFolder) {
      form.reset({
        name: editingFolder.name,
      });
    } else {
      form.reset({
        name: "",
      });
    }
  }, [editingFolder, form]);
  
  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing && editingFolder) {
        await updateFolder(editingFolder.id, data);
      } else {
        await createFolder(data);
      }
      
      handleClose();
    } catch (error) {
      console.error("Error saving folder:", error);
    }
  };
  
  const handleClose = () => {
    if (showAddFolderModal) {
      setShowAddFolderModal(false);
    }
    if (showEditFolderModal) {
      setShowEditFolderModal(false);
    }
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Folder" : "Add Folder"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Folder Name Input */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Work, Personal, Shopping"
                      {...field}
                    />
                  </FormControl>
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

export default FolderModal;
