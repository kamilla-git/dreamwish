FROM mcr.microsoft.com/playwright/python:v1.42.0-jammy

WORKDIR /app

# Копируем только требования для кэширования слоев
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код бэкенда
COPY . .

# Создаем папку для загрузок
RUN mkdir -p uploads && chmod 777 uploads

# Указываем порт по умолчанию (Render сам подставит нужный)
ENV PORT=10000

# Запуск через uvicorn
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
