# backend/Dockerfile

FROM python:3.12-slim

# 1. Thiết lập biến môi trường quan trọng
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_COMPILE_BYTECODE=1

WORKDIR /app

# 2. Cài đặt 'uv' trực tiếp từ image chính thức
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 3. Cache dependencies
COPY pyproject.toml uv.lock ./

# 4. Cài đặt package bằng uv
# --frozen: Đảm bảo cài đúng version trong uv.lock
RUN uv sync --no-dev --frozen

# 5. Copy toàn bộ code vào container
COPY ./app /app/app

# 6. Chạy ứng dụng bằng uvicorn (với --reload để hỗ trợ Hot Reload)
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
