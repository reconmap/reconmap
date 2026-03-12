---
title: Securing a Reconmap server
parent: Admin manual
---

This document assumes you are securing Reconmap on a Debian server. Instructions for other Linux distributions will be different but very similar.

### Firewall

```shell
sudo debconf-set-selections <<EOF
iptables-persistent iptables-persistent/autosave_v4 boolean true
iptables-persistent iptables-persistent/autosave_v6 boolean true
EOF

sudo apt-get install -y iptables-persistent

sudo iptables -I DOCKER-USER -i eth0 ! -s 127.0.0.1 -p tcp --dport 3306 -j DROP
sudo iptables -I DOCKER-USER -i eth0 ! -s 127.0.0.1 -p tcp --dport 5500 -j DROP
sudo iptables -I DOCKER-USER -i eth0 ! -s 127.0.0.1 -p tcp --dport 5510 -j DROP
sudo iptables-save
```
