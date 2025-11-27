# Static Export Guide

This guide explains how to build and deploy the application as a static site.

## Overview

The application is configured to support both dynamic development and static export for production deployment.

## Configuration Changes

### Next.js Configuration

The `next.config.ts` file has been updated with:

- `output: "export"` - Enables static export
- `trailingSlash: true` - Ensures proper URL structure for static hosting
- `images: { unoptimized: true }` - Disables image optimization for static export

### Dynamic Routes

For dynamic routes with `[locale]`, the layout already includes `generateStaticParams()` to generate static pages for all supported locales (vi, en).

For client components with dynamic parameters (like `[flowId]` and `[stepId]`), we use `export const dynamic = 'force-dynamic'` to handle them properly in static export.

## Build Commands

### Development
```bash
npm run dev
```

### Production Build (Static)
```bash
npm run build:static
```

This command will:
1. Run TypeScript type checking
2. Build the application
3. Export static files to the `out` directory

### Regular Production Build (Server)
```bash
npm run build
```

## Deployment

### Static Hosting

After running `npm run build:static`, the `out` directory contains all static files that can be deployed to:

- Netlify
- Vercel (as static site)
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

### Important Notes

1. **API Routes**: API routes don't work with static export. Consider:
   - Moving API logic to a separate backend service
   - Using serverless functions
   - Using client-side data fetching

2. **Image Optimization**: Image optimization is disabled for static export. Consider:
   - Optimizing images before adding them to the project
   - Using a CDN for image delivery

3. **Dynamic Data**: For dynamic content, consider:
   - Using client-side data fetching
   - Implementing a build-time data generation step
   - Using a headless CMS with static generation

4. **Environment Variables**: Only `NEXT_PUBLIC_` variables are available in static builds.

## Files Modified

- `next.config.ts` - Added static export configuration
- `package.json` - Added `build:static` script
- `src/app/[locale]/admin/(protected)/flows/[flowId]/page.tsx` - Added dynamic export config
- `src/app/[locale]/admin/(protected)/flows/[flowId]/steps/[stepId]/page.tsx` - Added dynamic export config
- `public/robots.txt` - Created for SEO
- `public/sitemap.xml` - Created for SEO

## Testing

To test the static export locally:

1. Run the build command:
   ```bash
   npm run build:static
   ```

2. Serve the static files:
   ```bash
   npx serve out
   ```

3. Open http://localhost:3000 to test

## Troubleshooting

### Build Errors

If you encounter build errors related to dynamic routes:

1. Check that client components with dynamic params have `export const dynamic = 'force-dynamic'`
2. Ensure server components with dynamic params have proper `generateStaticParams()` implementation

### Missing Images

If images don't load:

1. Check that image paths are correct
2. Ensure images are in the `public` directory
3. Remember that image optimization is disabled

### Client-side Navigation Issues

If navigation doesn't work properly:

1. Check that all links use the `href` prop correctly
2. Ensure trailing slashes are handled properly
3. Verify that the `trailingSlash: true` config is working

## SEO Considerations

The static export includes:
- `robots.txt` for search engine crawling
- `sitemap.xml` for search engine indexing
- Proper meta tags in the layout

Remember to update the sitemap with your actual domain before deploying.