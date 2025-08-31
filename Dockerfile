# Simple JS runtime image (no build step needed)
FROM node:20-alpine

# Create app dir
WORKDIR /app

# Install deps (no lockfile required)
COPY package*.json ./
RUN npm install --omit=optional --no-audit --no-fund

# App source
COPY src ./src
# If you actually have a migrations folder, uncomment the next line:
# COPY migrations ./migrations

# Railway will inject PORT, we default to 8080
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start the bot/API
CMD ["node", "src/server.js"]
