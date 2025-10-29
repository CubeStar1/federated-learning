# Admin server + Flower SuperLink runtime (fast installs via uv)
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/venv \
    PATH="/venv/bin:$PATH"

WORKDIR /app

# Create a dedicated virtual environment for the app (using uv)
RUN uv venv "$VIRTUAL_ENV"

# Install Python deps for FastAPI, Supabase, etc. into the venv
COPY requirements.txt ./requirements.txt
RUN uv pip install --python "$VIRTUAL_ENV/bin/python" -r requirements.txt

# Install the Flower app (includes flwr, datasets, sklearn)
COPY flower-app ./flower-app
RUN uv pip install --python "$VIRTUAL_ENV/bin/python" ./flower-app

# Copy admin server code
COPY admin-server ./admin-server

# Prepare logs directory expected by the app
RUN mkdir -p /app/admin-server/logs

# Expose FastAPI port and SuperLink TCP port
EXPOSE 8000 9092

# Run the admin server
WORKDIR /app/admin-server
CMD ["python", "main.py"]
