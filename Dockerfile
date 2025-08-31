# ---- runtime only (no separate build) ----
FROM node:20-alpine
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci --omit=optional

# App source
COPY src ./src

# Railway listens on PORT; we default to 8080
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Run your start script -> node src/server.js
CMD ["npm","start"]
