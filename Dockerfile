# ---- build stage (no TS build needed) ----
FROM node:20-alpine AS build
WORKDIR /app

# Install ALL deps (no lockfile required)
COPY package*.json ./
RUN npm install --omit=optional

# Copy the rest of the project
# If you don't have a "migrations" folder, delete that line below.
COPY . .
# nothing to build for plain JS

# ---- runtime stage ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Install prod deps only
COPY package*.json ./
RUN npm install --omit=dev --omit=optional

# Bring app code
COPY --from=build /app ./

# Start: try common entry files (adjust if yours differs)
CMD ["sh","-c","node server.js || node src/server.js || node app.js"]
