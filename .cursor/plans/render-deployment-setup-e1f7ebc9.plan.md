<!-- e1f7ebc9-9d71-4330-a3bf-b2ec84c1c3fb ad841dd8-4bfa-4ef8-8bc9-45bceea74232 -->
# MSI Installer Setup with WiX Toolset

## Overview

Create a professional MSI installer for the Southville 8B NHIS CampusConnect desktop application using WiX Toolset. The installer will package the published application with proper versioning, shortcuts, and deployment structure.

## Implementation Steps

### 1. Install WiX Toolset Prerequisites

- Verify WiX Toolset is installed (or provide installation instructions)
- Install WiX Toolset Build Tools (v3.11 or later)
- Add WiX extension to Visual Studio (if using Visual Studio)

### 2. Create WiX Installer Project

- Create new WiX project: `Southville8BEdgeUI.Installer`
- Add `.wixproj` file with proper configuration
- Reference the main application project
- Configure build dependencies (installer builds after main app)

### 3. Create WiX Source File (.wxs)

- Create `Product.wxs` with:
  - Product information (Name, Version, Publisher, UpgradeCode)
  - Package configuration (Compressed, InstallScope)
  - Major upgrade configuration (for version updates)
  - Directory structure (ProgramFilesFolder, StartMenu, Desktop)
  - Component groups for:
    - Main executable and dependencies
    - Assets folder (images, SVGs)
    - appsettings.json
    - Application manifest
  - Shortcuts (Desktop, Start Menu)
  - Registry entries (if needed for file associations)

### 4. Configure Version Management

- Add `Version.wxi` include file for centralized version management
- Define ProductVersion, ProductCode, UpgradeCode
- Set up automatic versioning or manual version control

### 5. Configure Build Process

- Update `.wixproj` to:
  - Reference published output from main project
  - Use `HeatDirectory` or manual file references
  - Set output path for MSI file
  - Configure build order (main app → publish → installer)

### 6. Update Solution File

- Add WiX installer project to `Southville8BEdgeUI.sln`
- Set project dependencies (installer depends on main app)
- Configure build configuration (Release builds MSI)

### 7. Configure Publish Profile Integration

- Update or create publish profile that works with installer
- Ensure publish output goes to predictable location
- Configure installer to reference published files

### 8. Add Installer Assets

- Application icon for installer
- License file (if applicable)
- Readme or installation instructions

### 9. Configure Installation Features

- Desktop shortcut (optional, user choice)
- Start Menu shortcut (required)
- Installation directory: `Program Files\Southville 8B NHIS\CampusConnect\`
- Uninstaller support (automatic with WiX)

### 10. Create Build Scripts

- PowerShell script for automated MSI building
- Documentation for manual build process
- Instructions for signing the MSI (optional, for production)

## Files to Create

1. **`desktop-app/Southville8BEdgeUI.Installer/Southville8BEdgeUI.Installer.wixproj`** - WiX project file
2. **`desktop-app/Southville8BEdgeUI.Installer/Product.wxs`** - Main WiX source file
3. **`desktop-app/Southville8BEdgeUI.Installer/Version.wxi`** - Version information include file
4. **`desktop-app/Southville8BEdgeUI.Installer/README.md`** - Installer build instructions

## Files to Modify

1. **`desktop-app/Southville8BEdgeUI.sln`** - Add installer project reference
2. **`desktop-app/Southville8BEdgeUI/Properties/PublishProfiles/FolderProfile.pubxml`** - Ensure publish output location is consistent

## Configuration Details

### Product Information

- **Product Name**: Southville 8B NHIS CampusConnect
- **Version**: 1.0.0 (configurable via Version.wxi)
- **Publisher**: Southville 8B National High School (or custom)
- **UpgradeCode**: Unique GUID (generated once, never changes)

### Installation Structure

```
Program Files\Southville 8B NHIS\CampusConnect\
  ├── Southville8BEdgeUI.exe
  ├── appsettings.json
  ├── Assets\
  │   ├── Images\
  │   └── Login\
  └── [.NET runtime and dependencies]
```

### Shortcuts

- **Start Menu**: `Southville 8B NHIS\CampusConnect.lnk`
- **Desktop**: Optional (user choice during installation)

## Build Process

1. Build main application in Release mode
2. Publish application to output directory (self-contained, single file)
3. WiX installer project references published files
4. Build installer project to generate MSI
5. MSI output: `desktop-app/Southville8BEdgeUI.Installer/bin/Release/Southville8BEdgeUI-1.0.0.msi`

## Notes

- WiX Toolset must be installed on the build machine
- MSI can be built from Visual Studio or command line (`msbuild`)
- For production, consider code signing the MSI
- Version updates require new ProductCode but same UpgradeCode
- Major upgrade configuration allows automatic uninstall of previous versions

### To-dos

- [ ] Verify WiX Toolset installation and provide setup instructions if needed
- [ ] Create Southville8BEdgeUI.Installer WiX project structure with .wixproj file
- [ ] Create Version.wxi include file for centralized version management
- [ ] Create Product.wxs with product info, directories, components, and shortcuts
- [ ] Configure .wixproj build dependencies and file references to published output
- [ ] Add installer project to solution file and set project dependencies
- [ ] Test MSI build process and verify installer functionality