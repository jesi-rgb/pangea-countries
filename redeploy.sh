#!/bin/bash

set -e

echo "Running tests..."
bun test

if [ $? -ne 0 ]; then
    echo "Tests failed! Deployment cancelled."
    exit 1
fi

echo "Tests passed! Proceeding with deployment..."
echo ""
echo "Fetching instance list..."
# Extract just the JSON part (last line) and find instances starting with "bun"
INSTANCE_NAME=$(kraft cloud instance ls --output json 2>/dev/null | tail -n 1 | jq -r '.[] | select(.name | startswith("bun")) | .name' | head -n 1)

if [ -z "$INSTANCE_NAME" ]; then
    echo "No instance starting with 'bun' found"
else
    echo "Found instance: $INSTANCE_NAME"
    echo "Deleting instance..."
    kraft cloud instance delete "$INSTANCE_NAME"
    echo "Instance deleted successfully"
fi

echo "Deploying new instance..."
kraft cloud deploy -p 443:8000 -M 800 -s pangea-countries .

echo "Deployment complete!"
