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
| Redis    | Redis                         | 6379 |
| Oracle   | MySQL                         | 3306 |

You might need to configure your firewall rules to open these ports to the internet depending on your network setup.
