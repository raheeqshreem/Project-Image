# Image Resizer API (TypeScript)

## Scripts
- Dev: npm run dev
- Build: npm run build
- Start: npm start
- Test: npm test
- Lint: npm run lint
- Format: npm run format

## Endpoints
- POST /api/resize (form-data: image, width/height) — returns resized image without saving.
- GET /api/image?name=sample.jpg&width=300&height=300&fit=contain — serves from folder with caching.