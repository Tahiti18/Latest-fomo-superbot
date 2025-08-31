FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=optional
COPY src ./src
COPY migrations ./migrations
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["npm","start"]
