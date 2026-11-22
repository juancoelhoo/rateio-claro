FROM node:22 AS frontend
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci
COPY . .
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend backend
COPY manage.py .
COPY --from=frontend /app/dist dist
RUN mkdir /data
ENV RATEIO_DB=/data/db.sqlite3
EXPOSE 8000
CMD ["sh","-c","python manage.py migrate && exec gunicorn backend.wsgi --bind 0.0.0.0:${PORT:-8000}"]
