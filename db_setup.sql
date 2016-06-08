CREATE DATABASE `alfred`;
USE alfred;
CREATE TABLE `inputs` (
  `input_id` int(11) NOT NULL AUTO_INCREMENT,
  `input_desc` varchar(150) NOT NULL,
  `input_name` varchar(50) NOT NULL,
  PRIMARY KEY (`input_id`),
  UNIQUE KEY `inputs_input_id_uindex` (`input_id`),
  UNIQUE KEY `inputs_input_name_uindex` (`input_name`),
  UNIQUE KEY `inputs_input_desc_uindex` (`input_desc`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
CREATE TABLE `message` (
  `msg_id` int(11) NOT NULL AUTO_INCREMENT,
  `msg_text` longtext NOT NULL,
  `msg_sender` varchar(15) DEFAULT NULL COMMENT 'THIS SHOULD BE THE USER HASH IF ITS NOT THE TICKET OWNER',
  `msg_ticket_id` int(11) NOT NULL,
  `msg_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`msg_id`),
  UNIQUE KEY `message_msg_id_uindex` (`msg_id`),
  KEY `message_ticket_TKT_ID_fk` (`msg_ticket_id`),
  CONSTRAINT `message_ticket_TKT_ID_fk` FOREIGN KEY (`msg_ticket_id`) REFERENCES `ticket` (`TKT_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=201 DEFAULT CHARSET=latin1;
CREATE TABLE `status` (
  `status_id` int(11) NOT NULL AUTO_INCREMENT,
  `status_desc` varchar(20) NOT NULL,
  PRIMARY KEY (`status_id`),
  UNIQUE KEY `status_status_id_uindex` (`status_id`),
  UNIQUE KEY `status_status_desc_uindex` (`status_desc`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
CREATE TABLE `ticket` (
  `TKT_ID` int(11) NOT NULL AUTO_INCREMENT,
  `TKT_EMAIL` varchar(255) NOT NULL,
  `TKT_NAME` varchar(70) NOT NULL,
  `TKT_CUSTOM_FIELDS` longtext NOT NULL,
  `TKT_DESCRIPTION` longtext NOT NULL,
  `TKT_TITLE` varchar(120) NOT NULL,
  `TKT_CHANNEL_ID` varchar(10) DEFAULT NULL,
  `TKT_STATUS_ID` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`TKT_ID`),
  UNIQUE KEY `TKT_ID_UNIQUE` (`TKT_ID`),
  UNIQUE KEY `ticket_TKT_CHANNEL_ID_uindex` (`TKT_CHANNEL_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8;
CREATE TABLE `tokens` (
  `token_id` int(11) NOT NULL AUTO_INCREMENT,
  `token_text` varchar(50) NOT NULL,
  `token_ticket_id` int(11) NOT NULL,
  PRIMARY KEY (`token_id`),
  UNIQUE KEY `tokens_token_id_uindex` (`token_id`),
  UNIQUE KEY `tokens_token_text_uindex` (`token_text`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=latin1;
