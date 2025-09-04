# Stage 1: Build the app
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Next.js for production
RUN npm run build

# Stage 2: Run the app
FROM node:20-alpine
WORKDIR /app

# Copy build output and dependencies
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
