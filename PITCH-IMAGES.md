# Placeholder stock images and mock contacts (#37)

**Placeholders, replace before public launch.** These photos are stock images used for the client pitch. They are not studioJHWA's work. Replace them with the studio's high-res originals (≥ 2400px long edge), and replace the mock WhatsApp (`6280000000000`) and email (`hello@example.com`) in `content/site.json` with the real contacts. Keep `SITE_ENV` non-production (noindex) until then.

When swapping images, use new filenames (or clear `.next/**/cache/images`): the image optimizer keeps serving cached versions of overwritten files.

All photos are from Unsplash under the [Unsplash License](https://unsplash.com/license) (free for commercial use, no attribution required). Each was cropped to the original file's aspect ratio and resized to a 2400px long edge.

| File             | Unsplash photo ID                  | Photographer (as listed on Unsplash search)           |
| ---------------- | ---------------------------------- | ----------------------------------------------------- |
| `dining.jpg`     | `photo-1656403002413-2ac6137237d6` | Kam Idris                                             |
| `living.jpg`     | `photo-1745429523617-0d837856ca35` | POOJAN THANEKAR                                       |
| `kitchen_sq.jpg` | `photo-1632583824020-937ae9564495` | Kam Idris                                             |
| `kitchen.jpg`    | `photo-1622372738946-62e02505feb3` | Kam Idris                                             |
| `workroom2.jpg`  | `photo-1595846265893-f433f6cca81d` | Gian Paolo Aliatis                                    |
| `work.jpg`       | `photo-1718524767521-1aec8589115b` | Urban Vintage                                         |
| `bunk.jpg`       | `photo-1699799462235-53a0ca5a7a43` | Le Quan                                               |
| `motif.jpg`      | `photo-1641958353096-7bc6aae99491` | Veronica Lorine                                       |
| `iso.jpg`        | `photo-1705321963943-de94bb3f0dd3` | Pipcke                                                |
| `drawing.jpg`    | derived from `kitchen_sq.jpg`      | Automatic edge trace (OpenCV), not a real CAD drawing |

Source URL for each: `https://images.unsplash.com/<photo ID>`.
Files in `public/images/projects/*` are copies of the `public/images/home/` file with the same name.
