---
title: Installing on Debian, Nginx and Letsencrypt
parent: Admin manual
---

This document provides instructions on how to install Reconmap in a Debian box. Instructions for other Linux distributions will be different but similar.

Assumptions:

- The box has nothing installed.
- You have sudo or root access to install all required elements.
- Your team is small and escalability is not a concern.

Objectives:

- Install Reconmap and all its dependencies
- Configure Nginx to serve Reconmap through HTTPS using Letsencrypt certificates

### Provision a box

Find a server where to install Reconmap. The hardware requirements vary depending on your use but the minimum and recommended can be found [here](hardware-requirements).

If your budget is limited but you want to run Reconmap and support the project, consider using the badge bellow which gives this team an small comission when you deploy a droplet. Thanks!

[![DigitalOcean Referral Badge](https://web-platforms.sfo2.cdn.digitaloceanspaces.com/WWW/Badge%201.svg)](https://www.digitalocean.com/?refcode=44bd6d34b6ac&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge)

### Install basic tools

```shell
sudo apt-get update

sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
```

### Install Docker tools

```shell
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -

sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/debian \
   $(lsb_release -cs) \
   stable"

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

sudo curl -L "https://github.com/docker/compose/releases/download/v2.11.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Install nginx

```shell
sudo apt install -y nginx
sudo cat <<'EOF' >/etc/nginx/sites-enabled/default
server {
    server_tokens off;
    server_name YOUR-SECURITY-COMPANY-DOMAIN.com;

    index index.html;

    location / {
        proxy_pass http://127.0.0.1:5500;
    }
}

server {
    server_tokens off;
    server_name auth.YOUR-SECURITY-COMPANY-DOMAIN.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header    X-Forwarded-Host   $host;
        proxy_set_header    X-Forwarded-Server $host;
        proxy_set_header    X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto  $scheme;
        proxy_set_header    X-Real-IP          $remote_addr;
        proxy_set_header    Host               $host;
    }
}

server {
    server_tokens off;
    server_name api.YOUR-SECURITY-COMPANY-DOMAIN.com;

    location / {
        proxy_pass http://127.0.0.1:5510;
        proxy_set_header    X-Forwarded-Host   $host;
        proxy_set_header    X-Forwarded-Server $host;
        proxy_set_header    X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto  $scheme;
        proxy_set_header    X-Real-IP          $remote_addr;
        proxy_set_header    Host               $host;
    }
}
EOF
```

{: .bg-red-000 .text-grey-dk-250 .p-3 }

### Install and configure Letsencrypt

```shell
sudo apt-get update
sudo apt-get install -y certbot
sudo apt-get install -y python3-certbot-nginx

sudo certbot -d "YOUR-SECURITY-COMPANY-DOMAIN.com,auth.YOUR-SECURITY-COMPANY-DOMAIN.com,api.YOUR-SECURITY-COMPANY-DOMAIN.com" --nginx --agree-tos --email support@YOUR-SECURITY-COMPANY-DOMAIN.com -n --redirect
```

### Prepare folder/files

```shell
mkdir reconmap && cd reconmap

mkdir -p data/attachments && chmod ug+w data/attachments/

mkdir -p logs && chmod ug+w logs

wget https://raw.githubusercontent.com/reconmap/reconmap/master/compose.yaml

wget https://raw.githubusercontent.com/reconmap/reconmap/master/config-api.json

wget https://raw.githubusercontent.com/reconmap/reconmap/master/config-ui.json

```

Changes to `compose.yaml`:

- Change default MySQL and Redis passwords.

Changes to `config-api.json`:

- Change all values under the `jwt` key.
- Change the `allowedOrigins` array under the `cors` key.
- Change the SMTP settings to match your SMTP settings.
- Change the database settings to match what you have put on the MySQL section on the `compose.yaml` file.

Changes to `config-ui.json`:

- Change all URLs, hosts and ports to match the ones for your server and whatever you define in the `compose.yaml` file.

### Starting services

```shell
sudo docker-compose up -d
sudo service nginx restart
```

## Installation verification

**Congratulations!** Your Reconmap instance should be up and running. To verify everything is working open your browser and head to http://localhost:5500 (unless host, IP are different) and enter the [default credentials](/admin-manual/default-credentials.html). You should see a Reconmap's dashboard. If something does not work, visit the [troubleshooting](/development/troubleshooting) page.
