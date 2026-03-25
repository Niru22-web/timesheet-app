# Image Assets Guide

## Directory Structure

All images should be saved in the `public/images/` directory:

```
public/
├── images/
│   ├── branding/          # Company branding assets
│   │   ├── asa-logo.png   # Company logo
│   │   ├── asa-logo.svg   # SVG version (optional)
│   │   └── favicon.ico    # Favicon
│   ├── ui/                # UI component images
│   │   ├── timesheet-photo.jpg  # Timesheet photo
│   │   └── hero-bg.jpg    # Hero backgrounds (optional)
│   └── icons/             # Icon assets
│       ├── app-icon.png   # App icon
│       └── splash.png     # Splash screen
```

## Image Specifications

### Company Logo (`asa-logo.png`)
- **Path**: `public/images/branding/asa-logo.png`
- **Format**: PNG with transparent background
- **Recommended sizes**:
  - Small: 32x32px
  - Medium: 40x40px  
  - Large: 48x48px
  - XL: 64x64px
- **Usage**: Login page, sidebar, headers

### Timesheet Photo (`timesheet-photo.jpg`)
- **Path**: `public/images/ui/timesheet-photo.jpg`
- **Format**: JPG or PNG
- **Recommended sizes**:
  - Small: 128x96px
  - Medium: 192x128px
  - Large: 256x160px
  - XL: 320x192px
- **Usage**: Login page branding, dashboard hero section

## How to Use

### Logo Component
```tsx
// Use actual image
<Logo variant="image" size="md" />

// Use text version (current)
<Logo variant="text-only" size="md" />
```

### TimesheetPhoto Component
```tsx
// Use actual image
<TimesheetPhoto useActualImage={true} size="md" />

// Use placeholder (current)
<TimesheetPhoto useActualImage={false} size="md" />
```

## File Naming Conventions

- Use lowercase letters
- Use hyphens (-) to separate words
- Use descriptive names
- Include file extension (.png, .jpg, .svg)

## Image Optimization

- **Logos**: Use PNG for transparency
- **Photos**: Use JPG for better compression
- **Icons**: Use SVG for scalability
- Keep file sizes under 200KB for web performance
- Use appropriate dimensions to avoid unnecessary scaling

## Current Implementation

The components are currently using placeholder/text versions. To switch to actual images:

1. Save your logo as `public/images/branding/asa-logo.png`
2. Save your timesheet photo as `public/images/ui/timesheet-photo.jpg`
3. Update component usage:
   - Change `<Logo variant="text-only" />` to `<Logo variant="image" />`
   - Change `<TimesheetPhoto useActualImage={false} />` to `<TimesheetPhoto useActualImage={true} />`

## Alternative Image Locations

You can also save images directly in the root `public/` directory:
- `public/asa-logo.png`
- `public/timesheet-photo.jpg`

If using root directory, update the src paths in components to:
- `/asa-logo.png`
- `/timesheet-photo.jpg`
