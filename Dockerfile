FROM node:22-bookworm-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-venv python3-pip build-essential nginx supervisor gettext-base \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python backend dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install -r /app/backend/requirements.txt
ENV PATH="/opt/venv/bin:$PATH"

# Install and build Next.js frontend. /api is reverse-proxied to FastAPI by nginx.
COPY frontend/package.json frontend/package-lock.json /app/frontend/
WORKDIR /app/frontend
RUN npm ci
COPY frontend/ /app/frontend/
ENV NEXT_PUBLIC_API_URL=/api
RUN npm run build

# Copy backend code and bundled datasets; generated ChromaDB files are excluded by .dockerignore.
COPY backend/ /app/backend/
WORKDIR /app
RUN mkdir -p /var/cache/nginx /var/log/supervisor /app/backend/chroma_db     && chmod -R 777 /app/backend/chroma_db
COPY deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY deploy/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 7860
CMD ["/start.sh"]
