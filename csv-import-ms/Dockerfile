# Use the official Node.js image
FROM node:22

# Install PostgreSQL client for pg_isready
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy tsconfig.json
COPY tsconfig.json ./

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy source code and other necessary files
COPY src/ ./src/
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Build the TypeScript app
RUN npm run build

# Remove devDependencies for smaller image (keep this for now during debugging)
# RUN npm prune --production

# Start the app
CMD ["npm", "start"]
