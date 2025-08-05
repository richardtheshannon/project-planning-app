# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# --- FIX START: Install OpenSSL for Prisma ---
# Install dependencies needed for Prisma to connect to the database
RUN apk add --no-cache openssl-dev
# --- FIX END ---

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
# Use a clean install to ensure dependencies match the lock file
RUN npm ci

# Bundle app source
COPY . .

# --- FIX START: Generate Prisma Client ---
# This ensures the client is generated with the correct engine for the container's OS
RUN npx prisma generate
# --- FIX END ---

# Creates a Next.js production build
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "start"]
