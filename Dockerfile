FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY dashboard/backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files, database, and built frontend
COPY dashboard/backend /app/dashboard/backend
COPY database /app/database
COPY dashboard/mentor_directory.csv /app/dashboard/mentor_directory.csv

WORKDIR /app/dashboard/backend

ENV PORT=8000
EXPOSE 8000

CMD [sh, -c, uvicorn main:app --host 0.0.0.0 --port ]
