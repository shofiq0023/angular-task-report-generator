# Stage 1: Build Angular app
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx files
RUN rm -rf ./*

# Copy built Angular files from the previous stage
COPY --from=build /app/dist/task-report-generator .

# Expose port 8023
EXPOSE 8023

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
