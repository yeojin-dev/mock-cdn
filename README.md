# Mock CDN Server

A mock CDN server for testing image deduplication logic with S3-compatible ETag headers.

## Features

- Serves 6 test images with ETag headers
- Two ETag modes: `consistent` (deterministic) and `random`
- Runtime mode switching via API (no restart required)
- Request statistics tracking (GET and HEAD separately)
- S3-compatible ETag format (double-quoted MD5 hex)

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Deploy to Render

1. Push this repository to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Render will auto-detect the `render.yaml` configuration

**Note:** Render free tier has 25-50 second cold starts after 15 minutes of inactivity.

## API Endpoints

### GET /

Returns service status and current ETag mode.

```bash
curl http://localhost:3001/
```

Response:
```json
{
  "service": "Mock CDN",
  "status": "running",
  "etagMode": "consistent"
}
```

### GET /health

Health check endpoint for deployment monitoring.

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok"
}
```

### GET /images/:filename

Serves a test image with ETag, Content-Type, and Cache-Control headers.

Available images: `test-image-1.jpg` through `test-image-6.jpg`

```bash
# Get image with headers
curl -I http://localhost:3001/images/test-image-1.jpg

# Download image
curl -o image.jpg http://localhost:3001/images/test-image-1.jpg
```

Response Headers:
```
HTTP/1.1 200 OK
ETag: "c444b90db01feae43da8353cbcc56380"
Content-Type: image/jpeg
Cache-Control: max-age=691200
Content-Length: 340
```

### HEAD /images/:filename

Returns the same headers as GET but without the image body.

```bash
curl -I -X HEAD http://localhost:3001/images/test-image-1.jpg
```

### GET /stats

Returns request statistics.

```bash
curl http://localhost:3001/stats
```

Response:
```json
{
  "totalGets": 5,
  "totalHeads": 2,
  "byFile": {
    "test-image-1.jpg": { "gets": 3, "heads": 1 },
    "test-image-2.jpg": { "gets": 2, "heads": 1 }
  }
}
```

### POST /reset-stats

Resets all request statistics.

```bash
curl -X POST http://localhost:3001/reset-stats
```

Response:
```json
{
  "message": "Stats reset",
  "totalGets": 0,
  "totalHeads": 0,
  "byFile": {}
}
```

### POST /set-etag-mode

Changes the ETag generation mode at runtime.

```bash
# Set to random mode
curl -X POST http://localhost:3001/set-etag-mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "random"}'

# Set to consistent mode
curl -X POST http://localhost:3001/set-etag-mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "consistent"}'
```

Response:
```json
{
  "etagMode": "random",
  "message": "ETag mode updated"
}
```

## ETag Modes

### Consistent Mode (default)
- Same filename always returns the same ETag
- ETag is MD5 hash of the filename
- Use for testing cache hit scenarios

### Random Mode
- Each request returns a different ETag
- Use for testing cache miss / content change scenarios

## Test Images

| Filename | Color |
|----------|-------|
| test-image-1.jpg | Red |
| test-image-2.jpg | Green |
| test-image-3.jpg | Blue |
| test-image-4.jpg | Yellow |
| test-image-5.jpg | Cyan |
| test-image-6.jpg | Magenta |

All images are generated programmatically as JPEGs using sharp.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Server port |
| CACHE_MAX_AGE | 691200 | Cache-Control max-age in seconds (~8 days) |
| IMAGE_WIDTH | 100 | Generated image width in pixels |
| IMAGE_HEIGHT | 100 | Generated image height in pixels |
| LOG_LEVEL | info | Pino log level (fatal, error, warn, info, debug, trace) |
| NODE_ENV | development | Environment mode |

## E2E Testing

```bash
# Start the server
npm run dev

# In another terminal, run the E2E test suite
./test.sh http://localhost:3001
```

## Architecture

```
src/
├── config/          # Environment config parsing with validation
├── domain/          # Core business logic (zero dependencies on infra)
│   ├── etag/        # ETag generation service (consistent + random modes)
│   ├── stats/       # Request statistics tracking
│   └── image/       # Image generation and in-memory repository
├── infrastructure/  # External concerns
│   ├── crypto/      # Hash service (MD5, random hex)
│   ├── logging/     # Pino logger
│   └── http/        # Express routes, middleware, server factory
├── application/     # DI container wiring
└── main.ts          # Entry point
```

## License

GPL-3.0
