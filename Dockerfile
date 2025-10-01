# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build Next.js app
RUN npm run build

# Expose port (Render will override this with PORT env var)
EXPOSE 3000

# Start the app - Use PORT env var if available, fallback to 3000
CMD ["sh", "-c", "npm start -- -p ${PORT:-3000}"]