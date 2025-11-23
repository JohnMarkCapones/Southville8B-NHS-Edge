<!-- 3436351a-503d-4958-811d-47b2c0581aa9 2165550a-6512-41c5-b38c-16baf95350d8 -->
# Fix Building Update HTTP Method Mismatch

## Problem

The desktop app is sending a PUT request to `buildings/{id}`, but the backend API only has a PATCH endpoint. This causes a 404 "Cannot PUT /api/v1/buildings/{id}" error.

## Root Cause

- **Backend**: Uses `@Patch(':id')` decorator (line 133 in buildings.controller.ts)
- **Desktop App**: Uses `PutAsync` method which sends PUT requests

## Solution

Add a PATCH method to the ApiClient and use it for building updates.

## Implementation

### 1. Add PatchAsync Method to ApiClient

**File**: `desktop-app/Southville8BEdgeUI/Services/ApiClient.cs`

Add after the PutAsync methods (around line 92):

```csharp
public async Task<T?> PatchAsync<T>(string endpoint, object? data = null) where T : class
{
    return await ExecuteRequestAsync<T>(HttpMethod.Patch, endpoint, data);
}

public async Task<bool> PatchAsync(string endpoint, object? data = null)
{
    return await ExecuteRequestAsync(HttpMethod.Patch, endpoint, data);
}
```

### 2. Update IApiClient Interface

**File**: `desktop-app/Southville8BEdgeUI/Services/IApiClient.cs`

Add after line 14 (after PutAsync declarations):

```csharp
Task<T?> PatchAsync<T>(string endpoint, object? data = null) where T : class;
Task<bool> PatchAsync(string endpoint, object? data = null);
```

### 3. Update UpdateBuildingAsync Method

**File**: `desktop-app/Southville8BEdgeUI/Services/ApiClient.cs`

Change line 207 from:

```csharp
return await PutAsync<BuildingDto>($"buildings/{id}", dto);
```

To:

```csharp
return await PatchAsync<BuildingDto>($"buildings/{id}", dto);
```

## Expected Result

- Building updates will use PATCH method
- The endpoint will match the backend's `@Patch(':id')` route
- Building edits will save successfully without 404 errors