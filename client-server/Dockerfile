# Client server + Flower SuperNode runtime (fast installs via uv)
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/venv \
    PATH="/venv/bin:$PATH"

WORKDIR /app

# Create a dedicated virtual environment for the app (using uv)
RUN uv venv "$VIRTUAL_ENV"

# Install Python deps for FastAPI, Supabase, etc., and Flower runtime into the venv
COPY requirements.txt ./requirements.txt
RUN uv pip install --python "$VIRTUAL_ENV/bin/python" -r requirements.txt \
    && uv pip install --python "$VIRTUAL_ENV/bin/python" "flwr>=1.22.0"

# Copy client server code only (no flower-app needed for SuperNode)
COPY client-server ./client-server

# Prepare logs directory expected by the app
RUN mkdir -p /app/client-server/logs

# Expose FastAPI port and default ClientAppIO port
EXPOSE 8001 9094

# Run the client server
WORKDIR /app/client-server
CMD ["python", "main.py"]
