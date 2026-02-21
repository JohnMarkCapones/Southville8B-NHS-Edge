# PROJECT RULES - ALWAYS FOLLOW

## 🎯 KEEP IT SIMPLE - NO OVERCOMPLICATING

### ✅ UI COMPONENTS RULE

- **Start with basic TextBlock**: `<TextBlock Text="{Binding Property}"/>`
- **Only add properties when absolutely necessary**
- **NEVER add**: `TextWrapping`, `LineHeight`, `Margin`, `Padding` unless specifically requested
- **Only add**: `FontSize`, `Foreground` whe

n needed for visibility/readability

### ✅ CORRECT APPROACH

```xml
<!-- SIMPLE - Just display the text -->
<TextBlock Text="{Binding Description}"/>

<!-- ONLY if needed for visibility -->
<TextBlock Text="{Binding Description}"
           FontSize="14"
           Foreground="{DynamicResource TextPrimaryBrush}"/>
```

### ❌ WRONG APPROACH - NEVER DO THIS

```xml
<!-- OVERCOMPLICATED - Don't do this -->
<TextBlock Text="{Binding Description}"
           TextWrapping="Wrap"
           LineHeight="1.5"
           Margin="0,0,0,8"
           Padding="12"
           FontWeight="Medium"/>
```

## 🚫 DON'T OVERCOMPLICATE

- Don't wrap in unnecessary Borders
- Don't add complex styling
- Don't add properties "just in case"
- Don't assume what the user wants
- Don't add multiple properties at once

## 🎯 ALWAYS TRUE

- **Start simple, add only what's needed**
- **If user says "make it simple" - REMOVE complexity**
- **If something works, don't change it**
- **Ask before adding extra properties**

## 📋 BEFORE ANY UI CHANGE

1. Is this property absolutely necessary?
2. Does the user specifically want this?
3. Am I overcomplicating this?
4. Can I make it simpler?

**RULE: Keep it simple, stupid!**
