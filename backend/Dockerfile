FROM python:3.11-slim

# Установка системных зависимостей для Playwright
RUN apt-get update && apt-get install -y 
    libnss3 
    libatk-bridge2.0-0 
    libxcomposite1 
    libxrandr2 
    libgbm1 
    libasound2 
    libpangocairo-1.0-0 
    libadwaita-1-0 
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Установка только браузера Chromium (без системных deps, они уже выше)
RUN playwright install chromium

# Копируем весь код бэкенда
COPY . .

# Создаем папку для загрузок
RUN mkdir -p uploads

# Запуск приложения
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
