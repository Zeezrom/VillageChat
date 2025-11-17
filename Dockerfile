FROM node:18-alpine

# Install build dependencies for sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Expose the port
EXPOSE 3030

# Start the server
CMD ["node", "server.js"]