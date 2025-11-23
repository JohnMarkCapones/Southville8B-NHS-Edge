<!-- ad1e2ac4-25fb-4885-8a1f-f5287a8ccb47 a6296f77-c6df-4df9-90ed-a8dd96b2aa18 -->
# Building Management Redesign

## Overview

Rename and redesign Room Management to Building Management with hierarchical view (buildings cards → expand to floors → expand to rooms) and wizard-style creation flow.

## Backend API Integration

### 1. Create DTOs (desktop-app/Southville8BEdgeUI/Models/Api/)

- **BuildingDto.cs**: id, buildingName, code, capacity, createdAt, updatedAt, floors array, stats (totalFloors, totalRooms, totalCapacity)
- **FloorDto.cs**: id, buildingId, name, number, createdAt, updatedAt, building info, rooms array
- **RoomDto.cs**: id, floorId, name, roomNumber, capacity, status (Available/Occupied/Maintenance), displayOrder, createdAt, updatedAt, floor info, building info
- **BuildingListResponse.cs**, **FloorListResponse.cs**, **RoomListResponse.cs**: Paginated response wrappers

### 2. Add API Methods to IApiClient

- **Buildings**: `GetBuildingsAsync()`, `GetBuildingByIdAsync(string id)`, `CreateBuildingAsync(CreateBuildingDto)`, `UpdateBuildingAsync(string id, UpdateBuildingDto)`, `DeleteBuildingAsync(string id)`
- **Floors**: `GetFloorsAsync(string? buildingId)`, `GetFloorByIdAsync(string id)`, `CreateFloorAsync(CreateFloorDto)`, `UpdateFloorAsync(string id, UpdateFloorDto)`, `DeleteFloorAsync(string id)`
- **Rooms**: `GetRoomsAsync(string? floorId, string? buildingId, string? status)`, `GetRoomByIdAsync(string id)`, `CreateRoomAsync(CreateRoomDto)`, `UpdateRoomAsync(string id, UpdateRoomDto)`, `DeleteRoomAsync(string id)`

### 3. Implement API Methods in ApiClient

- Call respective endpoints: `GET /api/v1/buildings`, `POST /api/v1/buildings`, etc.
- Call respective endpoints: `GET /api/v1/floors`, `POST /api/v1/floors`, etc.
- Call respective endpoints: `GET /api/v1/rooms`, `POST /api/v1/rooms`, etc.

## ViewModels

### 4. Rename & Redesign BuildingManagementViewModel

- **Stats Properties**: TotalBuildings, TotalFloors, TotalRooms, TotalCapacity (calculated from API data)
- **Collections**: ObservableCollection<BuildingCardViewModel> Buildings
- **Loading**: LoadBuildingsAsync() - fetch from API
- **Commands**: CreateBuildingWizardCommand, RefreshCommand

### 5. Create BuildingCardViewModel

- Properties: Building data (id, name, code, capacity, stats)
- **IsExpanded**: bool to show/hide floors
- **Floors**: ObservableCollection<FloorCardViewModel>
- **Commands**: ToggleExpandCommand, EditBuildingCommand, DeleteBuildingCommand, AddFloorCommand

### 6. Create FloorCardViewModel

- Properties: Floor data (id, name, number, buildingId)
- **IsExpanded**: bool to show/hide rooms
- **Rooms**: ObservableCollection<RoomCardViewModel>
- **Commands**: ToggleExpandCommand, EditFloorCommand, DeleteFloorCommand, AddRoomCommand

### 7. Create RoomCardViewModel

- Properties: Room data (id, name, roomNumber, capacity, status)
- **StatusBrush**: Color based on status
- **Commands**: EditRoomCommand, DeleteRoomCommand

### 8. Create BuildingWizardViewModel

- **Step 1**: Building details (name, code, capacity)
- **Step 2**: Add floors (dynamic list with name, number)
- **Step 3**: Add rooms to each floor (dynamic list per floor with name, capacity, status)
- **Navigation**: CurrentStep, CanGoNext, CanGoPrevious, NextCommand, PreviousCommand, FinishCommand, CancelCommand
- **Validation**: Validate each step before proceeding
- **Submission**: Create building → create floors → create rooms via API

## Views

### 9. Rename BuildingManagementView.axaml (from RoomManagementView.axaml)

- **Header**: "Building Management" title
- **Stats Cards**: Total Buildings, Total Floors, Total Rooms, Total Capacity (remove Available/Occupied/Maintenance/Utilization)
- **Action Buttons**: "Create Building" (opens wizard), "Refresh"
- **Search/Filter**: Search bar for building/floor/room names
- **Buildings List**: ItemsControl with BuildingCardView items (hierarchical expandable cards)

### 10. Create BuildingCardView (DataTemplate or UserControl)

- **Building Info**: Name, code, capacity
- **Stats Row**: Total Floors, Total Rooms
- **Expand/Collapse Icon**: Arrow icon to toggle floors visibility
- **Action Buttons**: Edit, Delete, Add Floor
- **Floors Panel**: Collapsible panel showing FloorCardView items

### 11. Create FloorCardView (DataTemplate or UserControl)

- **Floor Info**: Name, number
- **Stats**: Room count
- **Expand/Collapse Icon**: Arrow icon to toggle rooms visibility
- **Action Buttons**: Edit, Delete, Add Room
- **Rooms Panel**: Collapsible panel showing RoomCardView items

### 12. Create RoomCardView (DataTemplate or UserControl)

- **Room Info**: Room number, name, capacity, status
- **Status Indicator**: Colored dot (green=Available, red=Occupied, yellow=Maintenance)
- **Action Buttons**: Edit, Delete

### 13. Create BuildingWizardView.axaml

- **Step Indicator**: Visual progress (Step 1/3, 2/3, 3/3)
- **Step 1 UI**: TextBox for building name, code, capacity
- **Step 2 UI**: Dynamic floor list with Add/Remove buttons (name, number inputs)
- **Step 3 UI**: Floors with dynamic room lists per floor, Add/Remove buttons (name, capacity, status dropdown)
- **Navigation Buttons**: Cancel, Previous, Next, Finish

## File Operations

### 14. Rename Files

- Rename `RoomManagementViewModel.cs` → `BuildingManagementViewModel.cs`
- Rename `RoomManagementView.axaml` → `BuildingManagementView.axaml`
- Rename `RoomManagementView.axaml.cs` → `BuildingManagementView.axaml.cs`

### 15. Update References

- Update `AdminShellViewModel.cs`: NavigateToRoomManagement → NavigateToBuildingManagement
- Update navigation command bindings

## Key Implementation Details

- **Hierarchy**: Building → Floors → Rooms (3-level expandable cards)
- **Wizard**: Step-by-step creation (Building details → Add floors → Add rooms per floor)
- **API Endpoints**: 
- Buildings: `GET/POST/PATCH/DELETE /api/v1/buildings`
- Floors: `GET/POST/PATCH/DELETE /api/v1/floors`
- Rooms: `GET/POST/PATCH/DELETE /api/v1/rooms`
- **Stats Calculation**: Aggregate from API data (count buildings, sum floors, sum rooms, sum capacity)
- **No Room Status Filtering**: Remove status-based stats, keep status display only for individual rooms

### To-dos

- [ ] Create BuildingDto, FloorDto, RoomDto, and list response DTOs
- [ ] Add building, floor, and room API methods to IApiClient interface
- [ ] Implement building, floor, and room API methods in ApiClient
- [ ] Create BuildingCardViewModel, FloorCardViewModel, RoomCardViewModel
- [ ] Create BuildingWizardViewModel with 3-step flow
- [ ] Redesign BuildingManagementViewModel with new stats and hierarchy
- [ ] Create BuildingCardView, FloorCardView, RoomCardView UI components
- [ ] Create BuildingWizardView.axaml with 3-step wizard UI
- [ ] Redesign BuildingManagementView.axaml with new layout and stats
- [ ] Rename RoomManagement files to BuildingManagement
- [ ] Update AdminShellViewModel navigation references