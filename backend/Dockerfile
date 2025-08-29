# Backend Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN apk add --no-cache openssl
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]