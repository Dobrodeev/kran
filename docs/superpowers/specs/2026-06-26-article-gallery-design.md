# Design Specification: Article Gallery and Lightbox

We want to add a responsive gallery of 3–4 high-quality construction photos (using curated Unsplash URLs) to the bottom of each blog article. Clicking on an image will open a high-resolution version in a premium, animated full-screen lightbox.

## Proposed Changes

### 1. Data Model (`src/types.ts`)
Add a `gallery` array field to the `Article` interface:
```typescript
export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  readTime: string;
  date: string;
  image?: string;
  gallery?: string[]; // <-- New field
}
```

### 2. Article Data (`src/data/cranes.ts`)
Add 3–4 relevant Unsplash image URLs to the `gallery` field of each of the three articles:
- **How to Order Article (`how-to-order`)**: Images representing load checking, site prep, outrigger plates, and structural steel lifting.
- **Rent Kyiv Article (`rent-kyiv`)**: Images representing city center construction, high-rise mobile cranes, and downtown narrow-street lifting.
- **Restricted Zones Article (`restricted-zones`)**: Images representing safety boundary markers, power line work, heavy loads, and proper outrigger placement.

### 3. Lightbox State & UI (`src/App.tsx`)
- Add a new state variable: `const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);`
- In the `.seo-article-page` detail view, render the gallery below the article text under the heading **"Приклади виконаних робіт"** (Examples of completed works).
- The gallery layout will be a CSS grid, adapting from 2 columns on mobile to 4 columns on larger screens:
  - Responsive padding, rounded corners (`12px`), hover scale effect (`transform: scale(1.03)`).
- When any image is clicked, set `activeLightboxImage` to its URL.
- Implement the Lightbox modal:
  - Full-screen fixed overlay (`z-index: 1000`, `backdrop-filter: blur(10px)`, dark tinted background).
  - Center-aligned image with maximum constraints (`max-width: 90%`, `max-height: 80vh`, rounded corners).
  - Floating close button (with `48x48px` touch target for mobile usability).
  - Close handlers: click on the close button, click on the backdrop background, or press `Escape`.

### 4. Styles (`src/index.css`)
Add utility styles for:
- `.article-gallery-grid`: Grid styles, gaps, and transition parameters.
- `.article-gallery-img`: Hover animations, aspect ratio, cursor indicators.
- `.lightbox-overlay`: Backdrop-filter blur, smooth fade-in animations, cursor styling, and mobile touch optimizations.

## Verification Plan
1. Open any blog article, scroll down, and check the gallery renders correctly in grid format.
2. Verify image clicks open the lightbox immediately.
3. Test lightbox closing options (clicking backdrop, clicking close button, or pressing escape key).
4. Run `npm run build` to verify compiling works.
