FROM python:3.11-slim

WORKDIR /app

COPY mock_server.py .

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["python", "mock_server.py", "8000"] 