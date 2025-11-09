#!/bin/bash
# Health check script for Docker container

# Check if the application is responding
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7003/health)

if [ "$response" = "200" ]; then
    echo "Health check passed"
    exit 0
else
    echo "Health check failed with status: $response"
    exit 1
fi
