# Classroom Room Numbering & Drag-Drop Fix

## Summary

Fixed the classroom/room numbering system to use **floor-based numbering** (101, 102, 103 for Floor 1; 201, 202, 203 for Floor 2, etc.) and enhanced drag-and-drop functionality to automatically renumber rooms when moved between floors.

---

## What Was Fixed

### ✅ 1. Room Numbering - Floor-Based System

**Before:**
- Floor 1: Rooms numbered as `1`, `2`, `3`, `4`...
- Floor 2: Rooms numbered as `1`, `2`, `3`, `4`... (duplicate numbers!)
- Floor 3: Rooms numbered as `1`, `2`, `3`, `4`... (duplicate numbers!)

**After:**
- Floor 1: Rooms numbered as `101`, `102`, `103`, `104`...`199` (max 99 rooms)
- Floor 2: Rooms numbered as `201`, `202`, `203`, `204`...`299` (max 99 rooms)
- Floor 3: Rooms numbered as `301`, `302`, `303`, `304`...`399` (max 99 rooms)
- Floor N: Rooms numbered as `N01`, `N02`, `N03`, `N04`...`N99`

**Formula:** `Room Number = (Floor Number × 100) + Room Count`

**Example:**
```
Building: Main Building
├─ Floor 1
│   ├─ Room 101 ← First room on floor 1
│   ├─ Room 102 ← Second room on floor 1
│   └─ Room 103 ← Third room on floor 1
├─ Floor 2
│   ├─ Room 201 ← First room on floor 2
│   ├─ Room 202 ← Second room on floor 2
│   └─ Room 203 ← Third room on floor 2
└─ Floor 3
    ├─ Room 301 ← First room on floor 3
    └─ Room 302 ← Second room on floor 3
```

---

### ✅ 2. Automatic Room Renumbering on Drag-and-Drop

**Before:**
- Dragging Room 101 from Floor 1 to Floor 2 kept it as "Room 101"
- This created confusion with duplicate or out-of-range room numbers

**After:**
- Dragging Room 101 from Floor 1 to Floor 2 automatically renumbers it
- The room gets the next available number on the target floor
- Example: Room 101 → Floor 2 becomes Room 201, 202, 203, etc. (depending on existing rooms)

**Features:**
- ✅ Prevents dropping on the same floor (no unnecessary moves)
- ✅ Validates floor capacity (max 99 rooms per floor)
- ✅ Shows detailed notification: "Room 101 moved to Building A - Floor 2 and renumbered to 201"
- ✅ Maintains room status (Available, In-Use, Maintenance)
- ✅ Maintains room capacity and other properties

---

### ✅ 3. New Room Status - Default to "Available"

**Behavior:**
- All newly created rooms default to **"Available"** status
- Status can be changed later via the edit modal
- Status options:
  - 🟢 **Available** - Room is free for assignment
  - 🟡 **In-Use** - Room is currently occupied/assigned
  - 🔴 **Maintenance** - Room is under repair/maintenance

---

### ✅ 4. Floor Capacity Limit

**Validation:**
- Each floor can have a maximum of **99 rooms** (01-99)
- Attempting to add room #100 shows error: "Floor X has reached maximum capacity (99 rooms)"
- This prevents room numbers from exceeding the floor range (e.g., preventing 1100 on Floor 1)

---

## Technical Implementation

### Room Number Generation Logic

**Location:** `app/superadmin/classroom-management/assignments/page.tsx:263-316`

```typescript
const handleAddClassroom = async (buildingId: string, floorId: string) => {
  // Get floor information
  const floor = building?.floors?.find((f) => f.id === floorId)
  const floorNumber = floor.number // e.g., 1, 2, 3
  const floorBase = floorNumber * 100 // e.g., 100, 200, 300

  // Find existing room numbers on this floor
  const existingRoomNumbers = floor.rooms?.map(room => {
    const num = parseInt(room.roomNumber)
    const roomFloorBase = Math.floor(num / 100) * 100
    return (roomFloorBase === floorBase && !isNaN(num)) ? num : 0
  }).filter(num => num > 0) || []

  // Calculate next room number
  let nextRoomNumber: number
  if (existingRoomNumbers.length > 0) {
    const maxRoomNumber = Math.max(...existingRoomNumbers)
    nextRoomNumber = maxRoomNumber + 1
  } else {
    // First room: Floor 1 starts at 101, Floor 2 at 201, etc.
    nextRoomNumber = floorBase + 1
  }

  // Validate capacity (max 99 rooms per floor)
  const roomNumberWithinFloor = nextRoomNumber - floorBase
  if (roomNumberWithinFloor > 99) {
    showNotification("error", `Floor ${floorNumber} has reached maximum capacity (99 rooms)`)
    return
  }

  // Create room with proper number
  await addRoom({
    floorId: floorId,
    roomNumber: nextRoomNumber.toString(),
    name: `Room ${nextRoomNumber}`,
    capacity: 30,
    status: "Available" // Always Available when created
  })
}
```

---

### Drag-and-Drop with Renumbering Logic

**Location:** `app/superadmin/classroom-management/assignments/page.tsx:403-486`

```typescript
const handleDrop = async (e: React.DragEvent, targetBuildingId: string, targetFloorId: string) => {
  e.preventDefault()
  if (!draggedClassroom) return

  // Prevent dropping on same floor
  if (draggedClassroom.floorId === targetFloorId) {
    return // No action needed
  }

  const targetFloor = targetBuilding?.floors?.find((f) => f.id === targetFloorId)
  const floorNumber = targetFloor.number
  const floorBase = floorNumber * 100

  // Find existing room numbers on target floor
  const existingRoomNumbers = targetFloor.rooms?.map(room => {
    const num = parseInt(room.roomNumber)
    const roomFloorBase = Math.floor(num / 100) * 100
    return (roomFloorBase === floorBase && !isNaN(num)) ? num : 0
  }).filter(num => num > 0) || []

  // Calculate new room number for target floor
  let newRoomNumber: number
  if (existingRoomNumbers.length > 0) {
    newRoomNumber = Math.max(...existingRoomNumbers) + 1
  } else {
    newRoomNumber = floorBase + 1
  }

  // Validate capacity
  const roomNumberWithinFloor = newRoomNumber - floorBase
  if (roomNumberWithinFloor > 99) {
    showNotification("error", `Floor ${floorNumber} has reached maximum capacity (99 rooms)`)
    return
  }

  // Delete old room and create new one with updated number
  const oldRoomNumber = draggedClassroom.classroom.roomNumber
  await removeRoom(draggedClassroom.classroom.id)

  const newRoom = await addRoom({
    floorId: targetFloorId,
    roomNumber: newRoomNumber.toString(),
    name: `Room ${newRoomNumber}`,
    capacity: draggedClassroom.classroom.capacity,
    status: draggedClassroom.classroom.status // Preserve status
  })

  showNotification(
    "success",
    `Room ${oldRoomNumber} moved to Floor ${targetFloor.number} and renumbered to ${newRoomNumber}`
  )
}
```

---

## User Experience Improvements

### Visual Feedback

1. **Drag Indicator:**
   - Room becomes semi-transparent (50% opacity) while dragging
   - Target floor highlights with blue ring when hovering
   - Shows "Drop classroom here" message on empty floors

2. **Notifications:**
   - ✅ Success: "Room 101 created successfully"
   - ✅ Success: "Room 101 moved to Building A - Floor 2 and renumbered to 201"
   - ❌ Error: "Floor 2 has reached maximum capacity (99 rooms)"
   - ❌ Error: "Failed to move room"

3. **Animations:**
   - New rooms zoom in with scale animation
   - Moved rooms animate into place
   - Smooth transitions for all interactions

---

## Hierarchy Structure

The system now properly implements a 3-level hierarchy:

```
Building (e.g., "Main Building")
  └─ Floor (Floor 1, Floor 2, Floor 3...)
      └─ Room (101, 102, 103... on Floor 1)
              (201, 202, 203... on Floor 2)
              (301, 302, 303... on Floor 3)
```

**Database Structure:**
```sql
buildings
  ├─ id
  ├─ building_name
  └─ code

floors
  ├─ id
  ├─ building_id (FK to buildings)
  ├─ name ("Floor 1", "Floor 2")
  └─ number (1, 2, 3...)

rooms
  ├─ id
  ├─ floor_id (FK to floors)
  ├─ room_number ("101", "201", "301")
  ├─ name ("Room 101", "Room 201")
  ├─ capacity (30, 40, 50...)
  └─ status ("Available", "In-Use", "Maintenance")
```

---

## Testing Guide

### Test 1: Create Rooms on Floor 1

1. Navigate to `/superadmin/classroom-management/assignments`
2. Create a building (e.g., "Main Building")
3. Add Floor 1 to the building
4. Click "Add Room" on Floor 1
5. **Expected:** Room 101 is created
6. Click "Add Room" again
7. **Expected:** Room 102 is created
8. Repeat 3 more times
9. **Expected:** Rooms 103, 104, 105 are created

### Test 2: Create Rooms on Floor 2

1. Add Floor 2 to the building
2. Click "Add Room" on Floor 2
3. **Expected:** Room 201 is created (NOT Room 1)
4. Click "Add Room" again
5. **Expected:** Room 202 is created
6. **Verify:** Floor 1 still has rooms 101-105
7. **Verify:** Floor 2 has rooms 201-202

### Test 3: Drag Room Between Floors

1. Drag Room 101 from Floor 1
2. Drop it on Floor 2
3. **Expected:**
   - Room 101 disappears from Floor 1
   - Room 203 appears on Floor 2 (next available number)
   - Notification: "Room 101 moved to Main Building - Floor 2 and renumbered to 203"
4. **Verify:** Floor 1 now has rooms 102, 103, 104, 105
5. **Verify:** Floor 2 now has rooms 201, 202, 203

### Test 4: Floor Capacity Limit

1. Create Floor 1 with rooms 101-199 (99 rooms total)
2. Try to add room #100
3. **Expected:** Error notification "Floor 1 has reached maximum capacity (99 rooms)"
4. **Verify:** No room 1100 is created

### Test 5: Room Status Preservation

1. Create Room 101 on Floor 1 (status: Available)
2. Edit Room 101 and change status to "In-Use"
3. Drag Room 101 to Floor 2
4. **Expected:** Room becomes 201 with status still "In-Use"
5. **Verify:** Status is preserved during move

### Test 6: Same Floor Drop Prevention

1. Drag Room 101 from Floor 1
2. Try to drop it on Floor 1 (same floor)
3. **Expected:** Nothing happens (no move, no renumbering)

---

## Files Modified

**File:** `frontend-nextjs/app/superadmin/classroom-management/assignments/page.tsx`

**Lines Changed:**
- **263-316:** `handleAddClassroom()` - Room creation with floor-based numbering
- **403-486:** `handleDrop()` - Drag-and-drop with automatic renumbering

**Total Changes:** ~130 lines modified

---

## Benefits

✅ **Clarity:** Room numbers immediately indicate which floor they're on
✅ **Uniqueness:** No duplicate room numbers within a building
✅ **Scalability:** Each floor can have up to 99 rooms (standard for most schools)
✅ **User-Friendly:** Drag-and-drop automatically handles renumbering
✅ **Error Prevention:** Validates floor capacity limits
✅ **Status Preservation:** Maintains room properties during moves
✅ **Standard Convention:** Follows real-world building numbering systems

---

## Next Steps (Optional Enhancements)

1. **Room Reordering:** Allow dragging within the same floor to reorder rooms
2. **Bulk Operations:** Add multiple rooms at once (e.g., "Add 10 rooms")
3. **Room Templates:** Save room configurations for quick replication
4. **Floor Plans:** Visual floor map showing room layouts
5. **Room Search:** Search rooms by number, status, or capacity
6. **Room Assignments:** Link rooms to sections/classes
7. **Usage Analytics:** Track which rooms are most/least used
8. **Export/Import:** Bulk import room data via CSV/Excel

---

## Conclusion

The classroom management system now has:
- ✅ Floor-based room numbering (101, 102, 201, 202, etc.)
- ✅ Automatic renumbering when rooms are moved between floors
- ✅ Floor capacity validation (max 99 rooms per floor)
- ✅ Default "Available" status for new rooms
- ✅ Status preservation during drag-and-drop
- ✅ Clear visual feedback and notifications

The system now follows standard building numbering conventions used in real schools and commercial buildings worldwide! 🏫
