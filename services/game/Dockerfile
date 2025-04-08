FROM node:18-alpine

# Set working directory
WORKDIR /app

COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the service in development mode
CMD ["npm", "run", "dev"]
