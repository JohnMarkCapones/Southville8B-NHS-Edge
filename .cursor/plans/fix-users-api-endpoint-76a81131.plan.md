<!-- 76a81131-2bb0-4666-8862-61169c67d465 bd6a3ec9-a4ad-43e9-9264-9ad01505b81c -->
# Fix Building Wizard Step Navigation

## Problem

The Building Wizard shows the same form (Step 1) after clicking "Next" because the XAML step panels have hardcoded `IsVisible` values instead of binding to the `CurrentStep` property. All steps remain visible or hidden regardless of navigation.

## Root Cause

In `BuildingWizardView.axaml`:

- Line 111: `BasicInfoStep` has no `IsVisible` binding (always visible)
- Line 140: `FloorsStep` has `IsVisible="False"` (hardcoded)
- Line 184: `RoomsStep` has `IsVisible="False"` (hardcoded)
- Line 257: `ReviewStep` has `IsVisible="False"` (hardcoded)

The ViewModel has `CurrentStep` property and navigation logic, but the View doesn't use it.

## Solution

Update the `IsVisible` bindings for each step panel to show/hide based on `CurrentStep`:

### File: `desktop-app/Southville8BEdgeUI/Views/Admin/BuildingWizardView.axaml`

**Step 1 - Basic Information (Line 111):**

```xml
<!-- Change from: -->
<StackPanel x:Name="BasicInfoStep" Spacing="16">

<!-- To: -->
<StackPanel x:Name="BasicInfoStep" Spacing="16" IsVisible="{Binding CurrentStep, Converter={x:Static IntConverters.AreEqual}, ConverterParameter=1}">
```

**Step 2 - Floors (Line 140):**

```xml
<!-- Change from: -->
<StackPanel x:Name="FloorsStep" Spacing="16" IsVisible="False">

<!-- To: -->
<StackPanel x:Name="FloorsStep" Spacing="16" IsVisible="{Binding CurrentStep, Converter={x:Static IntConverters.AreEqual}, ConverterParameter=2}">
```

**Step 3 - Rooms (Line 184):**

```xml
<!-- Change from: -->
<StackPanel x:Name="RoomsStep" Spacing="16" IsVisible="False">

<!-- To: -->
<StackPanel x:Name="RoomsStep" Spacing="16" IsVisible="{Binding CurrentStep, Converter={x:Static IntConverters.AreEqual}, ConverterParameter=3}">
```

**Step 4 - Review (Line 257):**

```xml
<!-- Change from: -->
<StackPanel x:Name="ReviewStep" Spacing="16" IsVisible="False">

<!-- To: -->
<StackPanel x:Name="ReviewStep" Spacing="16" IsVisible="{Binding CurrentStep, Converter={x:Static IntConverters.AreEqual}, ConverterParameter=4}">
```

**Create/Next Button Visibility (Lines 278-290):**

The Next button should be hidden on step 4, and Create button should only show on step 4:

```xml
<!-- Line 278-284: Next Button -->
<Button Grid.Column="2" 
        x:Name="NextButton"
        Content="Next" 
        Classes="primary"
        Command="{Binding NextCommand}"
        IsEnabled="{Binding CanGoNext}"
        IsVisible="{Binding CurrentStep, Converter={x:Static IntConverters.IsLessThan}, ConverterParameter=4}"
        Margin="8,0,0,0"/>

<!-- Line 285-290: Create Button -->
<Button Grid.Column="2" 
        x:Name="CreateButton"
        Content="Create Building" 
        Classes="primary"
        Command="{Binding FinishCommand}"
        IsVisible="{Binding CurrentStep, Converter={x:Static IntConverters.AreEqual}, ConverterParameter=4}"/>
```

## Expected Behavior After Fix

1. **Step 1 (Basic Information)**: Shows building name, code, capacity fields
2. Click "Next" → **Step 2 (Floors)**: Shows floor management with "Add Floor" button
3. Click "Next" → **Step 3 (Rooms)**: Shows room management per floor
4. Click "Next" → **Step 4 (Review)**: Shows summary with "Create Building" button instead of "Next"
5. "Back" button works to go to previous steps
6. "Next" button is disabled until current step is valid

## Testing

After implementing:

1. Open Building Wizard
2. Fill in building name and code
3. Click "Next" - should show Floors step
4. Add at least one floor
5. Click "Next" - should show Rooms step
6. Click "Next" - should show Review step with "Create Building" button
7. Click "Back" multiple times - should navigate backwards through steps