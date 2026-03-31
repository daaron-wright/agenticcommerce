# Theming Guide

## Overview

The application uses the Kyndryl Design System component library which supports client-specific theming. Themes are applied via the `ClientThemeProvider` component.

## Available Themes

Themes are defined in `public/palettes.json`. Currently available themes:

- **`default`** - Default color scheme
- **`tvg`** - The Very Group theme (currently active)
- **`otherclient`** - Example client theme

## How to Change Themes

### Option 1: Change Theme Globally (in layout.tsx)

Edit `app/layout.tsx` and change the `clientId` prop:

```tsx
<ClientThemeProvider clientId="tvg">  // or "default", "otherclient"
  {/* ... */}
</ClientThemeProvider>
```

### Option 2: Make Theme Dynamic

You can make the theme configurable by:

1. **Environment Variable:**
   ```tsx
   <ClientThemeProvider clientId={process.env.NEXT_PUBLIC_CLIENT_ID || 'tvg'}>
   ```

2. **User Selection:**
   Create a theme selector component that updates the `clientId` prop dynamically.

## What Gets Styled

When a theme is applied, the following components automatically use the theme colors:

1. **Component Library Components:**
   - Buttons (from `@kyndryl-design/component-library`)
   - TextFields
   - Cards
   - Dialogs
   - All other components from the library

2. **Custom Components:**
   - Components that use CSS variables from the theme
   - Components that import styles from `@kyndryl-design/component-library/styles`

## Theme Colors

Each theme defines colors in `public/palettes.json`:

```json
{
  "tvg": {
    "clientId": "tvg",
    "clientName": "The Very Group",
    "chartTokens": {
      "primary": "#66b6dd",
      "secondary": "#83e4b7",
      // ... more colors
    }
  }
}
```

## Styling Specific Parts

### Prompt Screen

The prompt screen (`app/prompt/page.tsx`) uses:
- `Button` components from the component library (automatically themed)
- Custom textarea (can be styled with theme CSS variables)

To style the textarea with theme colors, you can use CSS variables or apply component library styles.

### Dashboard

The dashboard components can use:
- Theme colors from `palettes.json`
- Component library components (automatically themed)
- CSS variables that reference theme tokens

## Adding a New Theme

1. Add a new entry to `public/palettes.json`:
   ```json
   {
     "yourclient": {
       "clientId": "yourclient",
       "clientName": "Your Client Name",
       "chartTokens": {
         "primary": "#YOUR_COLOR",
         // ... define all colors
       }
     }
   }
   ```

2. Update `app/layout.tsx` to use the new theme:
   ```tsx
   <ClientThemeProvider clientId="yourclient">
   ```

## Current Demo Theme

The current demo uses the **`tvg`** theme, which applies The Very Group branding colors throughout the application. You can customize the TVG theme colors by editing the `tvg` entry in `public/palettes.json`.
