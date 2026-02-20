# syntax=docker/dockerfile:1

FROM node:20-alpine

# Use a non-root user that already exists in the official Node image
USER node
WORKDIR /home/node/app

# Install dependencies first (better layer caching)
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy the rest of the project
COPY --chown=node:node . .

# Default command: run the full test suite
CMD ["npm", "test"]
