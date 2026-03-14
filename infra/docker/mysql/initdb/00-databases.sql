CREATE DATABASE IF NOT EXISTS `reconmap` CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
CREATE USER IF NOT EXISTS 'reconmapper'@'%' IDENTIFIED BY 'reconmapped';
GRANT ALL ON `reconmap`.* TO 'reconmapper'@'%';

CREATE DATABASE IF NOT EXISTS `keycloak` CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
CREATE USER IF NOT EXISTS 'keycloaker'@'%' IDENTIFIED BY 'keycloaked';
GRANT ALL ON `keycloak`.* TO 'keycloaker'@'%';

