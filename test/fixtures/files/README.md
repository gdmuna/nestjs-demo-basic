# Test Fixtures — File Storage

This folder contains static fixture files used when testing file storage functionality.

## Structure

```
test/fixtures/files/
├── README.md           # This file
├── sample.txt          # Plain text file (~1 KB)
├── sample.jpg          # Minimal JPEG image (1×1 px)
└── sample.pdf          # Minimal PDF document
```

## Usage Guidelines

- These files are used in **unit tests** (mocked S3 calls) and may be used in future **E2E tests** (real S3 connection required).
- Do **not** commit large binary files here. Keep each fixture ≤ 100 KB.
- If a test needs a file of a specific size, generate it programmatically inside the test (e.g., `Buffer.alloc(5 * 1024 * 1024)` for a 5 MB buffer).
