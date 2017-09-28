CREATE DATABASE ocai CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
USE ocai;

DROP TABLE IF EXISTS `APP_INFO`;
CREATE TABLE `APP_INFO` (
  `APP_ID` int(32) unsigned NOT NULL,
  `APP_NAME` char(11) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `USER_NAME` char(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`APP_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `APP_MAKEFILE`;
CREATE TABLE `APP_MAKEFILE` (
  `ID` int(11) unsigned NOT NULL,
  `MAKEFILE_ID` int(11) DEFAULT NULL,
  `USER_ID` int(11) DEFAULT NULL,
  `APP_ID` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TARGET` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PREREQUISITES` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `FLAG` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `APP_SCHEDULE`;
CREATE TABLE `APP_SCHEDULE` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `schedule_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `command` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `second` int(11) DEFAULT NULL,
  `minute` int(11) DEFAULT NULL,
  `hour` int(11) DEFAULT NULL,
  `date` int(11) DEFAULT NULL,
  `month` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `dayOfWeek` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `MODEL_INFO`;
CREATE TABLE `MODEL_INFO` (
  `MODEL_ID` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `USER_ID` char(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TYPE_MENU_ID` char(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `VIEW_MENU_ID` char(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MODEL_NAME` char(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `NOTEBOOK_PATH` char(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `UPDATED_TIME` date DEFAULT NULL,
  `COMMENT` text COLLATE utf8mb4_unicode_ci,
  `FILE_PATH` text COLLATE utf8mb4_unicode_ci,
  `MODEL_INFO` text COLLATE utf8mb4_unicode_ci,
  `APP_ID` char(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`MODEL_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `USER_INFO`;
CREATE TABLE `USER_INFO` (
  `USER_ID` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `USER_NAME` char(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `PASSWORD` char(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `NOTEBOOK_SERVER_URL` char(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `JUPYTER_TOKEN` char(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`USER_ID`),
  UNIQUE KEY `USER_NAME` (`USER_NAME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO USER_INFO (USER_ID,USER_NAME,PASSWORD) VALUES(1,'aura', '123456');
