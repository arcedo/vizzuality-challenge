# Use the official Node.js image (adjust version as needed)
FROM node:22

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (for npm users)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application
COPY . .

# Build the TypeScript app
RUN npm run build

# Start the app
CMD ["npm", "start"]
