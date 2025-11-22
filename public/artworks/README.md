# Artwork Images

Place your artwork images in this directory.

## Image Requirements

- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`
- Recommended size: 800x800px or larger (will be scaled down for display)
- File naming: Use descriptive names like `starry-night.jpg`, `mona-lisa.jpg`, etc.

## Adding Images

1. Add your image files to this directory
2. Update `lib/data/artworks.json` to reference the image using the path `/artworks/your-image-name.jpg`

## Naming Convention

Use the pattern: `{id}-{title-slug}.jpg`

Where:
- `{id}` is the unique ID from the JSON entry
- `{title-slug}` is a URL-friendly version of the title (lowercase, spaces as hyphens)

## Examples

- Artwork with ID `1` and title "The Starry Night" → `1-starry-night.jpg`
- Artwork with ID `2` and title "The Great Wave" → `2-great-wave.jpg`

When adding a new artwork to `artworks.json`, use this pattern:
```json
{
  "id": "7",
  "title": "Your Artwork Title",
  "imageUrl": "/artworks/7-your-artwork-title.jpg"
}
```

