FROM node:20-alpine

# Install dependencies for Coral CLI
RUN apk add --no-cache curl bash

# Install Coral CLI (Linux/Alpine)
RUN curl -fsSL https://withcoral.com/install.sh | bash 2>/dev/null || true
ENV PATH="/root/.coral/bin:$PATH"

# Set working directory
WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
