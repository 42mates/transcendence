FROM nginx:alpine

# Install OpenSSL for generating SSL certificates
RUN apk update
RUN apk add --no-cache apache2-utils

# Copy NGINX configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

# Create an .htpasswd file with a default user and password
ARG ELK_USER
ARG ELK_PASSWORD
RUN htpasswd -bc /etc/nginx/.htpasswd ${ELK_USER} ${ELK_PASSWORD}

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
