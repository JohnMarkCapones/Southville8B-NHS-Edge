/**
 * Custom hook for gallery management
 * 
 * Provides state management and API operations for gallery items.
 * Handles loading states, error handling, and data synchronization.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  GalleryItem,
  GalleryItemsQueryParams,
  GalleryItemsResponse,
  CreateGalleryItemRequest,
  UpdateGalleryItemRequest,
  getGalleryItems,
  getGalleryItemById,
  uploadGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  restoreGalleryItem,
  getGalleryItemDownloadUrl,
} from '@/lib/api/endpoints/gallery';
import { useToast } from '@/hooks/use-toast';

interface UseGalleryState {
  items: GalleryItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

interface UseGalleryReturn extends UseGalleryState {
  // Data operations
  loadItems: (params?: GalleryItemsQueryParams) => Promise<void>;
  loadItem: (id: string) => Promise<GalleryItem | null>;
  refreshItems: () => Promise<void>;
  
  // CRUD operations
  createItem: (data: CreateGalleryItemRequest) => Promise<GalleryItem | null>;
  updateItem: (id: string, data: UpdateGalleryItemRequest) => Promise<GalleryItem | null>;
  deleteItem: (id: string) => Promise<boolean>;
  
  // Utility operations
  downloadItem: (id: string) => Promise<string | null>;
  
  // State management
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

export const useGallery = (initialParams?: GalleryItemsQueryParams): UseGalleryReturn => {
  const [state, setState] = useState<UseGalleryState>({
    items: [],
    loading: false,
    error: null,
    pagination: null,
  });

  const { toast } = useToast();

  // Load gallery items with pagination and filtering
  const loadItems = useCallback(async (params?: GalleryItemsQueryParams) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await getGalleryItems(params);
      
      setState(prev => ({
        ...prev,
        items: response.items,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to load gallery items',
      }));
      
      toast({
        title: "Error",
        description: "Failed to load gallery items. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Load a single gallery item
  const loadItem = useCallback(async (id: string): Promise<GalleryItem | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const item = await getGalleryItemById(id);
      
      setState(prev => ({
        ...prev,
        loading: false,
      }));
      
      return item;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to load gallery item',
      }));
      
      toast({
        title: "Error",
        description: "Failed to load gallery item. Please try again.",
        variant: "destructive",
      });
      
      return null;
    }
  }, [toast]);

  // Refresh current items
  const refreshItems = useCallback(async () => {
    await loadItems();
  }, [loadItems]);

  // Create a new gallery item
  const createItem = useCallback(async (data: CreateGalleryItemRequest): Promise<GalleryItem | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const newItem = await uploadGalleryItem(data);
      
      // Add the new item to the current list
      setState(prev => ({
        ...prev,
        items: [newItem, ...prev.items],
        loading: false,
      }));
      
      toast({
        title: "Success",
        description: "Gallery item uploaded successfully.",
      });
      
      return newItem;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to upload gallery item',
      }));
      
      toast({
        title: "Error",
        description: "Failed to upload gallery item. Please try again.",
        variant: "destructive",
      });
      
      return null;
    }
  }, [toast]);

  // Update an existing gallery item
  const updateItem = useCallback(async (id: string, data: UpdateGalleryItemRequest): Promise<GalleryItem | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const updatedItem = await updateGalleryItem(id, data);
      
      // Update the item in the current list
      setState(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === id ? updatedItem : item),
        loading: false,
      }));
      
      toast({
        title: "Success",
        description: "Gallery item updated successfully.",
      });
      
      return updatedItem;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to update gallery item',
      }));
      
      toast({
        title: "Error",
        description: "Failed to update gallery item. Please try again.",
        variant: "destructive",
      });
      
      return null;
    }
  }, [toast]);

  // Delete a gallery item
  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      await deleteGalleryItem(id);

      // Remove the item from the current list
      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id),
        loading: false,
      }));

      toast({
        title: "Success",
        description: "Gallery item deleted successfully.",
      });

      return true;
    } catch (error: any) {
      // Check if item was already deleted (404 error)
      const isAlreadyDeleted = error?.status === 404 ||
                               error?.message?.toLowerCase().includes('not found') ||
                               error?.message?.toLowerCase().includes('gallery item not found') ||
                               error?.data?.message?.toLowerCase().includes('not found');

      if (isAlreadyDeleted) {
        // Item already deleted - treat as success and remove from list
        setState(prev => ({
          ...prev,
          items: prev.items.filter(item => item.id !== id),
          loading: false,
        }));

        toast({
          title: "Item Already Deleted",
          description: "This gallery item was already deleted.",
        });

        return true;
      }

      // For other errors, show error message
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to delete gallery item',
      }));

      toast({
        title: "Error",
        description: "Failed to delete gallery item. Please try again.",
        variant: "destructive",
      });

      return false;
    }
  }, [toast]);

  // Download a gallery item
  const downloadItem = useCallback(async (id: string): Promise<string | null> => {
    try {
      const response = await getGalleryItemDownloadUrl(id);
      return response.downloadUrl;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate download link. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  // Load deleted (archived) items
  const loadDeletedItems = useCallback(async (): Promise<GalleryItem[]> => {
    try {
      const response = await getGalleryItems({ includeDeleted: true });
      // Filter to only get deleted items
      const deletedItems = response.items.filter(item => item.is_deleted || item.deleted_at);
      return deletedItems;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load archived items.",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  // Restore (undelete) a gallery item
  const restoreItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      await restoreGalleryItem(id);

      toast({
        title: "Success",
        description: "Gallery item restored successfully.",
      });

      // Refresh the main items list
      await loadItems();

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to restore gallery item. Please try again.",
        variant: "destructive",
      });

      return false;
    }
  }, [toast, loadItems]);

  // State management helpers
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load items on mount if initial params are provided
  useEffect(() => {
    if (initialParams) {
      loadItems(initialParams);
    }
  }, [loadItems, initialParams]);

  return {
    ...state,
    loadItems,
    loadItem,
    refreshItems,
    createItem,
    updateItem,
    deleteItem,
    downloadItem,
    loadDeletedItems,
    restoreItem,
    setLoading,
    clearError,
  };
};
