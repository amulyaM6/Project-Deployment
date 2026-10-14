# Deploy the whole app as one Render Web Service

This configuration packages the Next.js frontend and FastAPI backend into one Docker web service and one public URL. It is an initial deployment setup, not a guarantee that the full ML workload fits Render's free memory limit.

## Before you deploy
1. Push the contents of this project folder to a GitHub repository. Keep `Dockerfile`, `.dockerignore`, `deploy/`, `backend/`, and `frontend/` at the repository root.
2. Do not commit `.env` files or API keys. Generated `backend/chroma_db/` files are excluded from the Docker build.
3. In Render, create **New + → Web Service**, connect the repository, and choose **Docker** as the runtime if prompted. Root directory should be blank (repository root).
4. Select the Free instance to try without a hosting charge. Note: the ML dependencies may exceed free memory; check the build and runtime logs.
5. Add `GROQ_API_KEY` under Environment. If using Clerk authentication, also add the Clerk publishable and secret keys required by your Clerk setup. Never use `NEXT_PUBLIC_` for secret keys.
6. Deploy. Render will provide one URL for the website and API.

## Test in this order
1. Open the website URL.
2. Open `https://YOUR-RENDER-URL/api/docs` to check FastAPI is reachable through the same URL.
3. Upload a small text policy, then a small text-based PDF, and check the dashboard result.
4. Test DOCX upload and policy comparison.
5. Check logs if the service restarts or returns 502/503. A memory kill during sentence-transformer/PyTorch loading means the free instance cannot support the current ML stack as configured; do not assume successful build means successful analysis.

## Important limitations
- Render free services sleep when idle and use ephemeral local storage. ChromaDB collections created during analysis will not survive restarts/redeploys; this setup treats them as temporary per-analysis data.
- Large/scanned PDFs may need OCR, which is not currently added by this configuration.
- Free service resources cannot guarantee long-running inference or always-on availability.
- GitHub is used to store/update code, but the app itself runs as one Render service.
