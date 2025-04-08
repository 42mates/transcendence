FROM node:18-alpine

WORKDIR /app

# Install npm dependencies from package.json
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the service in development mode
CMD ["npm", "run", "dev"]
