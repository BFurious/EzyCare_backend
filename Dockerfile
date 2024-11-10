# Use the official Node.js 20 Alpine image as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock to leverage Docker caching
COPY package.json yarn.lock ./

# Install dependencies (including copyfiles if necessary)
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Generate Prisma client files
RUN npx prisma generate

# Expose port 5050 for the application
EXPOSE 5050

# Ensure entrypoint.sh is executable and available
RUN ["chmod", "+x", "./entrypoint.sh"]

# Set the default entrypoint
ENTRYPOINT ["sh", "./entrypoint.sh"]
