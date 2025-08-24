FROM node:18-alpine AS builder

# Install dependencies for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

# Copy everything from builder
COPY --from=builder /app .

EXPOSE 3000

CMD ["npm", "start"]