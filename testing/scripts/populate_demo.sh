#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Ensure faker is installed (try without --user first for venvs)
pip3 install -r "$SCRIPT_DIR/requirements.txt" -q || pip3 install -r "$SCRIPT_DIR/requirements.txt" --user -q

# Set default API URL
API_URL=${RECONMAP_API_URL:-"http://localhost:5510/api/system/data"}

# Set filename in a temporary location
DEMO_FILE="/tmp/reconmap_demo_data.json"

echo "Generating demo data..."
# Run python script from its absolute path
python3 "$SCRIPT_DIR/generate_demo_data.py" $1 > "$DEMO_FILE"

# Check if generation was successful
if [ ! -s "$DEMO_FILE" ]; then
    echo "Error: Demo data generation failed or file is empty."
    exit 1
fi

if [ -z "$RECONMAP_API_TOKEN" ]; then
    echo "Demo data generated in $DEMO_FILE"
    echo "To upload to the API, set RECONMAP_API_TOKEN and run this script again, or use curl:"
    echo "curl -X POST $API_URL -H \"Authorization: Bearer \$TOKEN\" -F \"importFile=@$DEMO_FILE;type=application/json\""
    exit 0
fi

echo "Uploading demo data to $API_URL..."
# Explicitly set the type in the form field for curl
# Use -w to get status code and capture full output
RESPONSE_FILE=$(mktemp)
HTTP_STATUS=$(curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $RECONMAP_API_TOKEN" \
    -F "importFile=@$DEMO_FILE;type=application/json" \
    -o "$RESPONSE_FILE" \
    -w "%{http_code}")

echo "API Response (Status: $HTTP_STATUS):"
if [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 300 ]; then
    if command -v json_pp >/dev/null; then
        cat "$RESPONSE_FILE" | json_pp || cat "$RESPONSE_FILE"
    else
        cat "$RESPONSE_FILE"
    fi
else
    echo "Error occurred during upload."
    cat "$RESPONSE_FILE"
    echo ""
fi

rm "$DEMO_FILE" "$RESPONSE_FILE"
