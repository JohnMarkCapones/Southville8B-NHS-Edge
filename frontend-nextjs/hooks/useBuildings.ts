/**
 * useBuildings Hook
 * 
 * Custom hook for managing building data and operations.
 * Provides loading states, error handling, and CRUD operations.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  getFloorsByBuilding,
  createFloor,
  updateFloor,
  deleteFloor,
  getRoomsByFloor,
  createRoom,
  updateRoom,
  deleteRoom,
  createBulkRooms,
  type Building,
  type Floor,
  type Room,
  type CreateBuildingDto,
  type UpdateBuildingDto,
  type CreateFloorDto,
  type UpdateFloorDto,
  type CreateRoomDto,
  type UpdateRoomDto,
} from '@/lib/api/endpoints/buildings';

// ========================================
// TYPES
// ========================================

export interface UseBuildingsOptions {
  autoLoad?: boolean;
  initialPage?: number;
  pageSize?: number;
}

export interface UseBuildingsReturn {
  // Data
  buildings: Building[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  
  // Building Operations
  loadBuildings: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => Promise<void>;
  
  loadBuilding: (id: string) => Promise<Building | null>;
  addBuilding: (data: CreateBuildingDto) => Promise<Building | null>;
  editBuilding: (id: string, data: UpdateBuildingDto) => Promise<Building | null>;
  removeBuilding: (id: string) => Promise<boolean>;
  
  // Floor Operations
  loadFloors: (buildingId: string) => Promise<Floor[]>;
  addFloor: (data: CreateFloorDto) => Promise<Floor | null>;
  editFloor: (id: string, data: UpdateFloorDto) => Promise<Floor | null>;
  removeFloor: (id: string) => Promise<boolean>;
  
  // Room Operations
  loadRooms: (floorId: string) => Promise<Room[]>;
  addRoom: (data: CreateRoomDto) => Promise<Room | null>;
  addBulkRooms: (floorId: string, count: number, template?: {
    capacity?: number;
    status?: 'Available' | 'Occupied' | 'Maintenance';
  }) => Promise<Room[]>;
  editRoom: (id: string, data: UpdateRoomDto) => Promise<Room | null>;
  removeRoom: (id: string) => Promise<boolean>;
  
  // Utility
  refresh: () => Promise<void>;
  clearError: () => void;
}

// ========================================
// HOOK IMPLEMENTATION
// ========================================

export function useBuildings(options: UseBuildingsOptions = {}): UseBuildingsReturn {
  const {
    autoLoad = true,
    initialPage = 1,
    pageSize = 10,
  } = options;

  // State
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseBuildingsReturn['pagination']>(null);

  // ========================================
  // ERROR HANDLING
  // ========================================

  const handleError = useCallback((err: unknown, operation: string) => {
    console.error(`[useBuildings] ${operation} failed:`, err);
    
    let errorMessage = `Failed to ${operation}`;
    
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    
    setError(errorMessage);
    return null;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========================================
  // BUILDING OPERATIONS
  // ========================================

  const loadBuildings = useCallback(async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('useBuildings: Loading buildings with params:', params);
      const response = await getBuildings({
        page: params?.page || initialPage,
        limit: params?.limit || pageSize,
        search: params?.search,
        sortBy: params?.sortBy || 'created_at',
        sortOrder: params?.sortOrder || 'desc',
      });
      
      console.log('useBuildings: API response:', response);
      
      // Transform buildings to ensure all rooms have schedule property
      const transformedBuildings = response.data.map(building => ({
        ...building,
        floors: building.floors?.map(floor => ({
          ...floor,
          rooms: floor.rooms?.map(room => ({
            ...room,
            schedule: room.schedule || []
          })) || []
        })) || []
      }));
      
      console.log('useBuildings: Transformed buildings:', transformedBuildings);
      setBuildings(transformedBuildings);
      setPagination(response.pagination);
    } catch (err) {
      handleError(err, 'load buildings');
    } finally {
      setLoading(false);
    }
  }, [initialPage, pageSize, handleError]);

  const loadBuilding = useCallback(async (id: string): Promise<Building | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const building = await getBuildingById(id);
      
      // Transform building to ensure all rooms have schedule property
      const transformedBuilding = {
        ...building,
        floors: building.floors?.map(floor => ({
          ...floor,
          rooms: floor.rooms?.map(room => ({
            ...room,
            schedule: room.schedule || []
          })) || []
        })) || []
      };
      
      // Update the building in the list if it exists
      setBuildings(prev => 
        prev.map(b => b.id === id ? transformedBuilding : b)
      );
      
      return building;
    } catch (err) {
      return handleError(err, 'load building');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const addBuilding = useCallback(async (data: CreateBuildingDto): Promise<Building | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const newBuilding = await createBuilding(data);
      
      // Transform building to ensure all rooms have schedule property
      const transformedBuilding = {
        ...newBuilding,
        floors: newBuilding.floors?.map(floor => ({
          ...floor,
          rooms: floor.rooms?.map(room => ({
            ...room,
            schedule: room.schedule || []
          })) || []
        })) || []
      };
      
      // Add to the beginning of the list
      setBuildings(prev => [transformedBuilding, ...prev]);
      
      return newBuilding;
    } catch (err) {
      return handleError(err, 'create building');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const editBuilding = useCallback(async (id: string, data: UpdateBuildingDto): Promise<Building | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedBuilding = await updateBuilding(id, data);
      
      // Update the building in the list
      setBuildings(prev => 
        prev.map(b => b.id === id ? updatedBuilding : b)
      );
      
      return updatedBuilding;
    } catch (err) {
      return handleError(err, 'update building');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const removeBuilding = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteBuilding(id);
      
      // Remove from the list
      setBuildings(prev => prev.filter(b => b.id !== id));
      
      return true;
    } catch (err) {
      handleError(err, 'delete building');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // ========================================
  // FLOOR OPERATIONS
  // ========================================

  const loadFloors = useCallback(async (buildingId: string): Promise<Floor[]> => {
    try {
      setError(null);
      
      const floors = await getFloorsByBuilding(buildingId);
      
      // Update the building's floors in the list
      setBuildings(prev => 
        prev.map(b => 
          b.id === buildingId 
            ? { ...b, floors } 
            : b
        )
      );
      
      return floors;
    } catch (err) {
      handleError(err, 'load floors');
      return [];
    }
  }, [handleError]);

  const addFloor = useCallback(async (data: CreateFloorDto): Promise<Floor | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const newFloor = await createFloor(data);
      
      // Add floor to the building in the list
      setBuildings(prev => 
        prev.map(b => 
          b.id === data.buildingId 
            ? { 
                ...b, 
                floors: [...(b.floors || []), newFloor] 
              } 
            : b
        )
      );
      
      return newFloor;
    } catch (err) {
      return handleError(err, 'create floor');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const editFloor = useCallback(async (id: string, data: UpdateFloorDto): Promise<Floor | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedFloor = await updateFloor(id, data);
      
      // Update the floor in the building's floors
      setBuildings(prev => 
        prev.map(b => ({
          ...b,
          floors: b.floors?.map(f => f.id === id ? updatedFloor : f) || []
        }))
      );
      
      return updatedFloor;
    } catch (err) {
      return handleError(err, 'update floor');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const removeFloor = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteFloor(id);
      
      // Remove floor from all buildings
      setBuildings(prev => 
        prev.map(b => ({
          ...b,
          floors: b.floors?.filter(f => f.id !== id) || []
        }))
      );
      
      return true;
    } catch (err) {
      handleError(err, 'delete floor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // ========================================
  // ROOM OPERATIONS
  // ========================================

  const loadRooms = useCallback(async (floorId: string): Promise<Room[]> => {
    try {
      setError(null);
      
      const rooms = await getRoomsByFloor(floorId);
      
      // Update the floor's rooms in the buildings list
      setBuildings(prev => 
        prev.map(b => ({
          ...b,
          floors: b.floors?.map(f => 
            f.id === floorId 
              ? { ...f, rooms } 
              : f
          ) || []
        }))
      );
      
      return rooms;
    } catch (err) {
      handleError(err, 'load rooms');
      return [];
    }
  }, [handleError]);

  const addRoom = useCallback(async (data: CreateRoomDto): Promise<Room | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const newRoom = await createRoom(data);
      
      // Add room to the floor in the buildings list
      setBuildings(prev => 
        prev.map(b => ({
          ...b,
          floors: b.floors?.map(f => 
            f.id === data.floorId 
              ? { 
                  ...f, 
                  rooms: [...(f.rooms || []), newRoom] 
                } 
              : f
          ) || []
        }))
      );
      
      return newRoom;
    } catch (err) {
      return handleError(err, 'create room');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const addBulkRooms = useCallback(async (floorId: string, count: number, template?: {
    capacity?: number;
    status?: 'Available' | 'Occupied' | 'Maintenance';
  }): Promise<Room[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const newRooms = await createBulkRooms(floorId, count, template || {});
      
      // Add rooms to the floor in the buildings list
      setBuildings(prev => 
        prev.map(b => ({
          ...b,
          floors: b.floors?.map(f => 
            f.id === floorId 
              ? { 
                  ...f, 
                  rooms: [...(f.rooms || []), ...newRooms] 
                } 
              : f
          ) || []
        }))
      );
      
      return newRooms;
    } catch (err) {
      handleError(err, 'create bulk rooms');
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const editRoom = useCallback(async (id: string, data: UpdateRoomDto): Promise<Room | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedRoom = await updateRoom(id, data);
      
      // Update the room in the floor's rooms
      setBuildings(prev => 
        prev.map(b => ({
          ...b,
          floors: b.floors?.map(f => ({
            ...f,
            rooms: f.rooms?.map(r => r.id === id ? updatedRoom : r) || []
          })) || []
        }))
      );
      
      return updatedRoom;
    } catch (err) {
      return handleError(err, 'update room');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const removeRoom = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteRoom(id);
      
      // Remove room from all floors
      setBuildings(prev => 
        prev.map(b => ({
          ...b,
          floors: b.floors?.map(f => ({
            ...f,
            rooms: f.rooms?.filter(r => r.id !== id) || []
          })) || []
        }))
      );
      
      return true;
    } catch (err) {
      handleError(err, 'delete room');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const refresh = useCallback(async () => {
    await loadBuildings();
  }, [loadBuildings]);

  // ========================================
  // AUTO-LOAD EFFECT
  // ========================================

  useEffect(() => {
    if (autoLoad) {
      loadBuildings();
    }
  }, [autoLoad, loadBuildings]);

  // ========================================
  // RETURN
  // ========================================

  return {
    // Data
    buildings,
    loading,
    error,
    pagination,
    
    // Building Operations
    loadBuildings,
    loadBuilding,
    addBuilding,
    editBuilding,
    removeBuilding,
    
    // Floor Operations
    loadFloors,
    addFloor,
    editFloor,
    removeFloor,
    
    // Room Operations
    loadRooms,
    addRoom,
    addBulkRooms,
    editRoom,
    removeRoom,
    
    // Utility
    refresh,
    clearError,
  };
}
