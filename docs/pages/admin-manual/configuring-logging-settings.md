---
title: Configuring logging settings
parent: Admin manual
---

Reconmap API can be configured to log application messages to multiple destinations including local files or remote sys log servers.

### Logging to local files

Edit the `config.json` to show the following content at the top level:

```json
{
  ...
  "logging": {
    "file": {
      "enabled": true,
      "level": "debug",
      "path": "/var/www/webapp/logs/application.log"
    }
  },
  ...
}
```

### Logging to Graylog using GELF

First make sure to spin up a [Graylog](https://www.graylog.org/) somewhere in your system. You can use the following docker compose file to start one with all its dependencies.

```yaml
version: "3.8"

services:
  elasticsearch:
    image: "docker.elastic.co/elasticsearch/elasticsearch:7.12.1"
    environment:
      - node.name=elasticsearch
      - cluster.name=docker-cluster
      - bootstrap.memory_lock=true
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - esdata:/usr/share/elasticsearch/data
    ports:
      - 9200:9200
  mongodb:
    image: "mongo:4.2"
    restart: always

  graylog:
    image: "graylog/graylog:4.3.2"
    depends_on:
      - elasticsearch
      - mongodb
    entrypoint: "/usr/bin/tini -- wait-for-it elasticsearch:9200 --  /docker-entrypoint.sh"
    environment:
      GRAYLOG_PASSWORD_SECRET: somepasswordpepper
      # to generate a password hash, type: echo -n admin | shasum -a 256
      GRAYLOG_ROOT_PASSWORD_SHA2: 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
      GRAYLOG_HTTP_BIND_ADDRESS: "0.0.0.0:9001"
      GRAYLOG_HTTP_EXTERNAL_URI: "http://localhost:9001/"
      GRAYLOG_ELASTICSEARCH_HOSTS: "http://elasticsearch:9200"
      GRAYLOG_MONGODB_URI: "mongodb://mongodb:27017/graylog"
    ports:
      - "5044:5044/tcp" # Beats
      - "5140:5140/udp" # Syslog
      - "5140:5140/tcp" # Syslog
      - "5555:5555/tcp" # RAW TCP
      - "5555:5555/udp" # RAW TCP
      - "9001:9001/tcp" # Server API
      - "12201:12201/tcp" # GELF TCP
      - "12201:12201/udp" # GELF UDP
      - "13301:13301/tcp" # Forwarder data
      - "13302:13302/tcp" # Forwarder config
volumes:
  esdata:
```

Ensure to edit `config.json` file to enable the gelf log handler and point to the hostname and IP of your graylog server.

```json
{
  ...
  "logging": {
    "gelf": {
      "enabled": true,
      "level": "debug",
      "serverName": "api-graylog-1",
      "serverPort": 12201
    }
  },
  ...
}
```

Now you can view all your application logs from the convenience of your browser at [http://localhost:9001](http://localhost:9001)

![Graylog log management](/images/integrations/graylog.png)
