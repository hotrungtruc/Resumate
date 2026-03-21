FROM node:20-alpine

WORKDIR /app

# Cache dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Chạy bằng dev server của vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
