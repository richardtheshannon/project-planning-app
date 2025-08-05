# Use a more complete base image to avoid missing system libraries
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker layer caching
COPY package*.json ./

# Copy the Prisma schema before installing dependencies
# This ensures the schema is available for the 'postinstall' script
COPY prisma ./prisma

# Install app dependencies. This will also trigger the 'postinstall' script.
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Creates a Next.js production build
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# --- FIX START: Modify the startup command ---
# First, push any pending schema changes to the database to ensure it's in sync.
# Then, start the Next.js application.
CMD ["sh", "-c", "npx prisma db push && npm start"]
# --- FIX END ---
