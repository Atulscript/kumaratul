# GitHub-Style Theme Migration Guide

## ✅ Completed Changes

### 1. Tailwind Configuration
- ✅ Replaced Discord color palette with GitHub colors
- ✅ Added GitHub-specific shadows and borders
- ✅ Updated font stack to GitHub's system fonts

### 2. Custom CSS Styles
- ✅ Created GitHub-style navigation (.gh-nav)
- ✅ Created GitHub-style cards (.gh-card)
- ✅ Added GitHub hero pattern (.gh-hero-pattern)
- ✅ Updated scrollbar to GitHub style
- ✅ Added fade-in animations

### 3. Body & Navigation
- ✅ Updated body background to white (gh-canvas)
- ✅ Updated text color to GitHub's dark gray (gh-fg)
- ✅ Changed navigation to clean white with border
- ✅ Updated logo styling to circular with border

## 🔄 Sections That Need Updating

### Navigation Links
**Current:** Discord-themed with # symbols and dark hover
**Needs:** GitHub-style clean links with subtle hover

**Find and Replace:**
- `text-discord-muted` → `text-gh-fg-muted`
- `hover:bg-discord-hover` → `hover:bg-gh-canvas-subtle`
- `hover:text-white` → `hover:text-gh-fg`
- Remove `#` symbols from links

### Hero Section
**Current:** Dark background with Discord colors
**Needs:** Light gradient background with GitHub aesthetic

**Update:**
- `bg-discord-bg` → `bg-gh-canvas gh-hero-pattern`
- `text-discord-text` → `text-gh-fg`
- `text-discord-muted` → `text-gh-fg-muted`

### Buttons
**Current:** Discord blurple buttons
**Needs:** GitHub green primary buttons

**Update:**
- `bg-discord-blurple` → `bg-gh-success-emphasis`
- `hover:bg-discord-blurple-dark` → `hover:bg-gh-success`
- `bg-discord-green` → `bg-gh-success-emphasis`

### Cards/Sections
**Current:** Dark Discord cards
**Needs:** Light GitHub cards with borders

**Update:**
- `discord-card` → `gh-card`
- `bg-discord-sidebar` → `bg-gh-canvas`
- `border-discord-divider` → `border-gh-border`

### Text Colors
**Find and Replace Throughout:**
- `text-discord-text` → `text-gh-fg`
- `text-discord-muted` → `text-gh-fg-muted`
- `text-white` → `text-gh-fg` (for body text)

### Backgrounds
**Find and Replace:**
- `bg-discord-bg` → `bg-gh-canvas`
- `bg-discord-sidebar` → `bg-gh-canvas-subtle`
- `bg-discord-element` → `bg-gh-canvas-inset`

## 🎨 GitHub Color Reference

### Backgrounds
- `gh-canvas` - #ffffff (main background)
- `gh-canvas-subtle` - #f6f8fa (subtle background)
- `gh-canvas-inset` - #f6f8fa (inset areas)

### Borders
- `gh-border` - #d0d7de (default border)
- `gh-border-muted` - #d8dee4 (muted border)

### Text
- `gh-fg` - #1f2328 (primary text)
- `gh-fg-muted` - #656d76 (secondary text)
- `gh-fg-subtle` - #6e7781 (subtle text)

### Actions
- `gh-accent` - #0969da (links, accents)
- `gh-success` - #1a7f37 (success states)
- `gh-success-emphasis` - #2da44e (primary buttons)
- `gh-danger` - #d1242f (errors, warnings)

## 📝 Quick Migration Script

Use Find & Replace in your editor:

1. **Navigation & Links:**
   ```
   text-discord-muted → text-gh-fg-muted
   hover:bg-discord-hover → hover:bg-gh-canvas-subtle
   ```

2. **Backgrounds:**
   ```
   bg-discord-bg → bg-gh-canvas
   bg-discord-sidebar → bg-gh-canvas-subtle
   ```

3. **Text:**
   ```
   text-discord-text → text-gh-fg
   text-white → text-gh-fg (be careful with this one)
   ```

4. **Buttons:**
   ```
   bg-discord-blurple → bg-gh-success-emphasis
   bg-discord-green → bg-gh-success-emphasis
   ```

5. **Cards:**
   ```
   discord-card → gh-card
   ```

6. **Borders:**
   ```
   border-discord-divider → border-gh-border
   ```

## 🚀 Next Steps

1. Apply find & replace for all sections
2. Update hero section background
3. Update all buttons to GitHub green
4. Update all cards to white with borders
5. Test responsiveness
6. Verify all links and hover states

## 💡 Tips

- GitHub style is clean and minimal
- Use subtle shadows instead of heavy ones
- Borders are important for definition
- Keep plenty of white space
- Use green for primary actions
- Use blue for links and accents
