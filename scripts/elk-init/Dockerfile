FROM curlimages/curl:7.88.1

# Copy the script into the container
RUN mkdir -p /usr/bin
COPY elk-init.sh /usr/bin/elk-init.sh

# Make the script executable
USER 0
RUN chmod +x /usr/bin/elk-init.sh
USER curl_user

# Set the entrypoint to the script
ENTRYPOINT ["/usr/bin/elk-init.sh"]
