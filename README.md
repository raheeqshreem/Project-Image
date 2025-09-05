# Image Resize API (TypeScript)

Two modes:
1) *On-demand*: POST /api/on-demand with form-data: image (file), width, height → returns resized image (not saved).
2) *Cached*: GET /api/images?filename=<name>.jpg&width=200&height=200 → returns cached image if exists, otherwise resizes, stores to /thumbs, then returns it.

## Run
```bash
npm install
npm run build
npm start