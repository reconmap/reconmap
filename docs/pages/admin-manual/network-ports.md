---
title: Network ports
parent: Admin manual
---

The docker images provided by Reconmap use the ports described below by default. These are all above 1024 (non-privileged) to ensure they can be run as non-root.

| Vendor   | Application                   | Port |
| -------- | ----------------------------- | ---- |
| Reconmap | Web client                    | 5500 |
| Reconmap | Rest API                      | 5510 |
| Reconmap | Agent / Notifications service | 5520 |
| Keycloak | Identity Provider             | 8080 |
| RabbitMQ | Message Queue                 | 5672 |
| Rustfs   | Object Storage                | 9000 & 9001 |
| Redis    | Redis Cache                   | 6379 |
| MySQL    | Database                      | 3306 |

You might need to configure your firewall rules to open these ports depending on your network setup.
