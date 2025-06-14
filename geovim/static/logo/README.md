# GeoVim Logo Assets

This directory contains the logo assets for GeoVim.

## Files

- `logo.svg` - Primary logo in SVG format
  - Used for web display
  - Infinitely scalable
  - Can be styled with CSS
  - Best for modern web applications

- `logo.png` - Raster version of the logo
  - Used as fallback where SVG isn't supported
  - High resolution for quality
  - Transparent background

- `favicon.ico` - Browser favicon
  - Used in browser tabs and bookmarks
  - Contains multiple sizes (16x16, 32x32)
  - Automatically picked up by browsers from static root

## Usage

The SVG logo can be imported directly in Svelte components:

```svelte
<script>
  import logo from '$lib/static/logo/logo.svg';
</script>

<img src={logo} alt="GeoVim Logo" />
```

The PNG version can be used as a fallback:

```svelte
<picture>
  <source srcset={logo} type="image/svg+xml">
  <img src="/logo/logo.png" alt="GeoVim Logo">
</picture>
```

The favicon will be automatically used by browsers when placed in the static directory.

## Design Guidelines

- The logo should maintain its clarity at small sizes
- Use the SVG version whenever possible for best quality
- The logo should be visible on both light and dark backgrounds
- PNG version should be high resolution with transparency 