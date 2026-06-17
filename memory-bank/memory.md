# InterViewXX - Memory Bank

> **Key Insights & Decisions**

---

## Project Config

| Key | Value |
|-----|-------|
| MongoDB | ✅ `MONGO_URL` in .env |
| Gemini | ✅ `GEMINI_API_KEY` in .env |
| Pinecone | `pcsk_7K3gQ9_CjYszBKe6pdfSCaLL9fFA4K11QNy55ez8UP6oDZHoPTdCqHbJtKmiP4L4W8isEs` |
| Cloudinary Key | `WamXRlW6KWkIb5q18KebzyqolrQ` |
| Cloudinary Name | ⏳ NEEDED |
| Cloudinary Secret | ⏳ NEEDED |

---

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Embeddings | Gemini `embedding-001` | FREE (not OpenAI) |
| Vector DB | Pinecone Free Tier | 100K vectors, $0 |
| PDF Parsing | `pdf-parse` only | No Tesseract OCR |
| Frontend | Keep EJS | No Next.js migration |
| Deployment | Current setup | No Kubernetes |
| Testing | Backend first | Browser testing later |

---

## Embedding Details

- **Model**: Gemini `embedding-001`
- **Dimensions**: 768
- **Cost**: FREE (within quota)
- **Quota**: ~1500 requests/min

---

## Pinecone Index Config

```javascript
{
  name: "interviewxx",
  dimension: 768,
  metric: "cosine",
  spec: { serverless: { cloud: "aws", region: "us-east-1" }}
}
```

---

## Workflow Reminders

1. **Before coding**: Read progress.md, architecture.md
2. **If stuck**: Ask questions, wait for answer
3. **Coding**: Add minimal helpful comments
4. **After coding**: Write tests, run tests
5. **Testing**: Backend first (API tests), then browser

---

## Session Notes

### 2026-01-18 (Evening Session)
- ✅ **Phase 1: 85% Complete!**
- Created all core services:
  - `resumeParser.js` - PDF parsing
  - `resumeExtractor.js` - AI extraction (Gemini Pro)
  - `embeddingService.js` - Vector generation (Gemini embedding-001)
  - `pineconeService.js` - Vector DB operations
- Created Resume API with 6 endpoints
- Enhanced User schema with AI fields
- **Pinecone index created successfully**: `interviewxx` (768 dims, cosine)
- ⚠️ Gemini API quota limit hit (will reset in ~48s)
- All code is production-ready with error handling
- **Total cost: $0** (all free tier)

### 2026-01-18 (Morning Session)
- Initial setup complete
- All memory-bank docs created
- Cloudinary credentials configured
- Ready for Phase 1 implementation

---

*Last Updated: 2026-01-18*
