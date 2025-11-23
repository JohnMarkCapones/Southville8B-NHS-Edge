<!-- c88b5577-e7c9-4a28-92b0-4dcdfa84ee09 c6080227-1730-4762-8c4d-a763e06714dd -->
# Desktop App High-Level Flowchart

## Flowchart Structure

The flowchart will be created as a visual diagram (using Mermaid syntax) that maps out the desktop application's high-level flow from startup to user interactions.

## Main Flow Sections

### 1. Application Startup Flow

- **Start** (Oval) → Application Launch
- **Process** (Rectangle): Initialize DI Container (Program.cs)
- Register services (HttpClient, TokenStorage, ApiClient, ChatService, AuthService, etc.)
- **Process** (Rectangle): Build Avalonia App
- **Process** (Rectangle): Create MainWindow with MainWindowViewModel
- **Process** (Rectangle): Initialize LoginViewModel
- **Decision** (Diamond): Check "Remember Me" preference
- **Yes** → Check if authenticated → Auto-login if valid token exists
- **No** → Show Login Screen

### 2. Authentication Flow

- **Input** (Parallelogram): User enters email and password
- **Process** (Rectangle): Validate input (not empty)
- **Process** (Rectangle): Call AuthService.LoginAsync()
- **Decision** (Diamond): Login successful?
- **No** → Show error message → Return to Login Screen
- **Yes** → **Decision** (Diamond): Is role allowed? (Admin/Teacher only)
- **No** → Logout, show access denied → Return to Login Screen
- **Yes** → **Process** (Rectangle): Store tokens → **Decision** (Diamond): User role?
- **Admin** → Navigate to AdminShellViewModel
- **Teacher** → Navigate to TeacherShellViewModel

### 3. Admin Shell Flow

- **Process** (Rectangle): Initialize AdminShellViewModel
- Load user profile
- Initialize SSE connection for real-time metrics
- Start clock timer
- **Process** (Rectangle): Display Dashboard (default view)
- **Decision** (Diamond): User selects module?
- **Dashboard** → Show AdminDashboardViewModel
- **User Management** → Show UserManagementViewModel (with search, pagination)
- **Building Management** → Show BuildingManagementViewModel
- **Class Schedules** → Show ClassSchedulesViewModel
- **Events** → Show EventDashboardViewModel
- **Chat** → Show ChatViewModel
- **Notifications** → Show NotificationsViewModel
- **Profile** → Show ProfileViewModel
- **Settings** → Show SettingsViewModel
- **Logout** → Clear tokens → Return to Login Screen

### 4. Teacher Shell Flow

- **Process** (Rectangle): Initialize TeacherShellViewModel
- Load user profile
- Initialize calendar and schedule data
- Start clock timer
- **Process** (Rectangle): Display Dashboard (default view)
- **Decision** (Diamond): User selects module?
- **Dashboard** → Show TeacherDashboardViewModel
- **Student Management** → Show StudentManagementViewModel
- **Grade Entry** → Show GradeEntryViewModel
- **Schedule Planner** → Show SchedulePlannerViewModel
- **Announcements** → Show MyAnnouncementsViewModel
- **Messaging** → Show MessagingViewModel
- **Notifications** → Show NotificationsViewModel
- **Profile** → Show ProfileViewModel
- **Settings** → Show SettingsViewModel
- **Logout** → Clear tokens → Return to Login Screen

### 5. Data Operations Flow (Common Pattern)

- **Input** (Parallelogram): User action (create, read, update, delete)
- **Process** (Rectangle): Validate input
- **Process** (Rectangle): Call API via ApiClient
- **Decision** (Diamond): API call successful?
- **No** → Show error toast → End
- **Yes** → **Data Storage** (Cylinder): Update local state/UI
- **Process** (Rectangle): Show success message
- **End** (Oval)

### 6. Real-time Features Flow

- **Process** (Rectangle): Initialize SSE Service
- **Process** (Rectangle): Connect to SSE endpoint
- **Decision** (Diamond): Connection established?
- **No** → Show "Disconnected" status
- **Yes** → **Process** (Rectangle): Stream real-time updates (metrics, notifications)
- **Data Storage** (Cylinder): Update UI with live data

### 7. Logout Flow

- **Process** (Rectangle): User clicks logout
- **Process** (Rectangle): Call AuthService.LogoutAsync()
- **Data Storage** (Cylinder): Clear tokens from storage
- **Process** (Rectangle): Dispose SSE connections
- **Process** (Rectangle): Navigate to LoginViewModel
- **End** (Oval)

## Implementation Details

### File Location

- Create flowchart file: `desktop-app/DESKTOP_APP_FLOWCHART.md`
- Use Mermaid syntax for visual representation
- Include legend explaining symbols
- Add narrative descriptions for each major flow section

### Flowchart Format

- Use standard flowchart symbols:
- **Oval**: Start/End points
- **Rectangle**: Process/Action steps
- **Diamond**: Decision points
- **Parallelogram**: Input/Output
- **Cylinder**: Data Storage/Database operations
- **Arrows**: Flow direction with labels (Yes/No, role names, etc.)

### Key Features to Highlight

1. **Service Initialization** (DI container setup)
2. **Authentication & Authorization** (role-based access)
3. **Auto-login** (Remember Me functionality)
4. **Role-based Navigation** (Admin vs Teacher shells)
5. **Module Navigation** (within each shell)
6. **API Integration** (data operations)
7. **Real-time Updates** (SSE connections)
8. **Error Handling** (validation, API errors, unauthorized access)

### Cross-Platform Considerations

- Note that this is a **desktop-only** application (Avalonia UI)
- Highlight desktop-specific features (window management, system integration)
- Document offline capabilities if any (token storage, cached data)

## Deliverables

1. **Mermaid Flowchart** - Visual representation of the high-level flow
2. **Narrative Description** - Text explanation of each flow section
3. **Symbol Legend** - Explanation of flowchart symbols used
4. **Module Reference** - List of available modules for Admin and Teacher roles

### To-dos

- [ ] Analyze desktop app structure and identify all major flows (startup, auth, navigation, modules)
- [ ] Create Mermaid flowchart diagram with all high-level flows mapped out
- [ ] Add narrative descriptions explaining each flow section
- [ ] Create symbol legend and module reference documentation