#!/usr/bin/env bash

exec 3<>/dev/tcp/127.0.0.1/8080
echo -e 'GET /health/ready HTTP/1.1\r\nhost: http://localhost\r\nConnection: close\r\n\r\n' >&3
cat <&3 | grep -q '200 OK'
