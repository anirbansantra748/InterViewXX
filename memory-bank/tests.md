# InterViewXX - Testing Strategy

> **Backend-First Testing**

---

## Test Types

| Type | Tool | Purpose |
|------|------|---------|
| Unit | Jest | Test individual functions |
| Integration | Supertest | Test API endpoints |
| E2E | Manual → Browser | Test full flows |

---

## Test Structure

```
tests/
├── unit/
│   ├── resumeParser.test.js
│   ├── resumeExtractor.test.js
│   ├── embeddingService.test.js
│   └── matchingService.test.js
├── integration/
│   ├── resumeApi.test.js
│   ├── searchApi.test.js
│   └── recommendationApi.test.js
└── fixtures/
    ├── sample-resume.pdf
    └── mockData.js
```

---

## Phase 1 Tests

### Unit: resumeParser.test.js
```javascript
describe('resumeParser', () => {
  test('extracts text from PDF')
  test('handles empty PDF')
  test('handles corrupted PDF')
});
```

### Unit: resumeExtractor.test.js
```javascript
describe('resumeExtractor', () => {
  test('extracts skills from text')
  test('extracts experience from text')
  test('extracts education from text')
  test('handles incomplete data')
});
```

### Integration: resumeApi.test.js
```javascript
describe('Resume API', () => {
  test('POST /api/resume/upload - success')
  test('POST /api/resume/upload - invalid file')
  test('POST /api/resume/parse/:userId - success')
  test('GET /api/resume/data/:userId - success')
});
```

---

## Phase 2 Tests

### Unit: embeddingService.test.js
```javascript
describe('embeddingService', () => {
  test('generates embedding from text')
  test('handles long text')
  test('handles empty text')
});
```

### Integration: searchApi.test.js
```javascript
describe('Search API', () => {
  test('POST /api/search/candidates - returns ranked results')
  test('POST /api/search/candidates - handles no results')
  test('POST /api/search/jobs - returns ranked results')
});
```

---

## Phase 3 Tests

### Unit: matchingService.test.js
```javascript
describe('matchingService', () => {
  test('calculates match score correctly')
  test('handles missing skills')
  test('returns score breakdown')
});
```

### Integration: recommendationApi.test.js
```javascript
describe('Recommendation API', () => {
  test('GET /api/recommendations/jobs/:userId - returns jobs')
  test('GET /api/recommendations/candidates/:jobId - returns candidates')
});
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/resumeParser.test.js

# Run with coverage
npm test -- --coverage
```

---

## Test Commands (to add to package.json)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

*Last Updated: 2026-01-18*
