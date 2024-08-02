# Use the Node.js 20 Alpine image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /compiler

# Install G++, jdk21 and 
RUN apk update && apk add --no-cache g++ openjdk21-jdk python3

# Copy only the package.json and package-lock.json files and install dependencies.
# This allows Docker to cache this layer when package files don't change, Hence Optimizing the image building from Dockerfile.
COPY package*.json ./
RUN npm install

# Copy the rest of the application code.
# This layer will only be rebuilt if application code changes.
COPY . .

EXPOSE 8000

# Specify the command to run when the container starts
CMD [ "node", "compserver.js" ]