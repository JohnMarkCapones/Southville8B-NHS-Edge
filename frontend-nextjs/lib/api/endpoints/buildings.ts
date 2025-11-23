/**
 * Buildings API Endpoints
 * 
 * API client functions for building management operations.
 * Handles buildings, floors, and rooms CRUD operations.
 */

import { apiClient } from '../client';

// ========================================
// TYPES
// ========================================

export interface Building {
  id: string;
  buildingName: string;
  code: string;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
  floors?: Floor[];
  stats?: {
    totalFloors: number;
    totalRooms: number;
    totalCapacity: number;
    utilizationRate: number;
  };
}

export interface Floor {
  id: string;
  buildingId: string;
  name: string;
  number: number;
  createdAt: string;
  updatedAt: string;
  building?: {
    id: string;
    buildingName: string;
    code: string;
  };
  rooms?: Room[];
}

export interface Room {
  id: string;
  floorId: string;
  name?: string;
  roomNumber: string;
  capacity?: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
  floor?: {
    id: string;
    name: string;
    number: number;
    building: {
      id: string;
      buildingName: string;
      code: string;
    };
  };
}

export interface CreateBuildingDto {
  buildingName: string;
  code: string;
  capacity?: number;
}

export interface UpdateBuildingDto {
  buildingName?: string;
  code?: string;
  capacity?: number;
}

export interface CreateFloorDto {
  buildingId: string;
  name: string;
  number: number;
}

export interface UpdateFloorDto {
  name?: string;
  number?: number;
}

export interface CreateRoomDto {
  floorId: string;
  name?: string;
  roomNumber: string;
  capacity?: number;
  status?: 'Available' | 'Occupied' | 'Maintenance';
}

export interface UpdateRoomDto {
  name?: string;
  roomNumber?: string;
  capacity?: number;
  status?: 'Available' | 'Occupied' | 'Maintenance';
  displayOrder?: number;
}

export interface BuildingListResponse {
  data: Building[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ========================================
// BUILDINGS API
// ========================================

/**
 * Get all buildings with pagination and filtering
 */
export async function getBuildings(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<BuildingListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = `/buildings${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<BuildingListResponse>(endpoint);
}

/**
 * Get a single building by ID with nested floors and rooms
 */
export async function getBuildingById(id: string): Promise<Building> {
  return apiClient.get<Building>(`/buildings/${id}`);
}

/**
 * Get building statistics
 */
export async function getBuildingStats(id: string): Promise<{
  building: {
    id: string;
    name: string;
    capacity: number;
  };
  stats: {
    totalFloors: number;
    totalRooms: number;
    totalCapacity: number;
    utilizationRate: number;
  };
}> {
  return apiClient.get(`/buildings/${id}/stats`);
}

/**
 * Create a new building
 */
export async function createBuilding(data: CreateBuildingDto): Promise<Building> {
  return apiClient.post<Building>('/buildings', data);
}

/**
 * Update a building
 */
export async function updateBuilding(id: string, data: UpdateBuildingDto): Promise<Building> {
  return apiClient.patch<Building>(`/buildings/${id}`, data);
}

/**
 * Delete a building
 */
export async function deleteBuilding(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/buildings/${id}`);
}

// ========================================
// FLOORS API
// ========================================

/**
 * Get all floors with pagination and filtering
 */
export async function getFloors(params?: {
  page?: number;
  limit?: number;
  search?: string;
  buildingId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{
  data: Floor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.buildingId) queryParams.append('buildingId', params.buildingId);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = `/floors${queryString ? `?${queryString}` : ''}`;

  return apiClient.get(endpoint);
}

/**
 * Get floors by building ID
 */
export async function getFloorsByBuilding(buildingId: string): Promise<Floor[]> {
  return apiClient.get<Floor[]>(`/floors/building/${buildingId}`);
}

/**
 * Get a single floor by ID
 */
export async function getFloorById(id: string): Promise<Floor> {
  return apiClient.get<Floor>(`/floors/${id}`);
}

/**
 * Create a new floor
 */
export async function createFloor(data: CreateFloorDto): Promise<Floor> {
  return apiClient.post<Floor>('/floors', data);
}

/**
 * Update a floor
 */
export async function updateFloor(id: string, data: UpdateFloorDto): Promise<Floor> {
  return apiClient.patch<Floor>(`/floors/${id}`, data);
}

/**
 * Delete a floor
 */
export async function deleteFloor(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/floors/${id}`);
}

// ========================================
// ROOMS API
// ========================================

/**
 * Get all rooms with pagination and filtering
 */
export async function getRooms(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  floorId?: string;
  buildingId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{
  data: Room[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.floorId) queryParams.append('floorId', params.floorId);
  if (params?.buildingId) queryParams.append('buildingId', params.buildingId);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = `/rooms${queryString ? `?${queryString}` : ''}`;

  return apiClient.get(endpoint);
}

/**
 * Get rooms by floor ID
 */
export async function getRoomsByFloor(floorId: string): Promise<Room[]> {
  return apiClient.get<Room[]>(`/rooms/floor/${floorId}`);
}

/**
 * Get rooms by building ID
 */
export async function getRoomsByBuilding(buildingId: string): Promise<Room[]> {
  return apiClient.get<Room[]>(`/rooms/building/${buildingId}`);
}

/**
 * Get a single room by ID
 */
export async function getRoomById(id: string): Promise<Room> {
  return apiClient.get<Room>(`/rooms/${id}`);
}

/**
 * Create a new room
 */
export async function createRoom(data: CreateRoomDto): Promise<Room> {
  return apiClient.post<Room>('/rooms', data);
}

/**
 * Update a room
 */
export async function updateRoom(id: string, data: UpdateRoomDto): Promise<Room> {
  return apiClient.patch<Room>(`/rooms/${id}`, data);
}

/**
 * Delete a room
 */
export async function deleteRoom(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/rooms/${id}`);
}

// ========================================
// BULK OPERATIONS
// ========================================

/**
 * Create multiple rooms at once
 */
export async function createBulkRooms(floorId: string, count: number, template: {
  capacity?: number;
  status?: 'Available' | 'Occupied' | 'Maintenance';
}): Promise<Room[]> {
  return apiClient.post<Room[]>('/rooms/bulk', {
    floorId,
    count,
    ...template
  });
}
