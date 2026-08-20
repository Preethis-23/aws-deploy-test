# Use the official Nginx image as the base
FROM nginx:alpine

# Copy the static web files to Nginx's default public folder
COPY ./web /usr/share/nginx/html

# Expose port 80 to allow traffic to the container
EXPOSE 80
