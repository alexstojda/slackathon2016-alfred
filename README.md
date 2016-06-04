# slackathon2016
Repo for El Slackos in the 2016 Slackathon.

Made for slackathon 2016

BOT TOKEN: xoxb-48203657264-VQPgm03W8yAM3MpXhsjw44em

==Please don't use, for alex only==
USER TOKEN: xoxp-34476473665-34461330964-48217673985-b1620c8833

LIBRARIES USED:
https://howdy.ai/botkit/

IP: 170.20.64.151

MYSQL ROOT PASS (FOR INFORMATIONAL PURPOSES ONLY, DO NOT USE): 3lSlack0s

MySQL User: slacko
MySQL Pass: slackathon
```sql
CREATE TABLE `ticket` (
  `TKT_ID` int(11) NOT NULL AUTO_INCREMENT,
  `TKT_EMAIL` varchar(255) NOT NULL,
  `TKT_NAME` varchar(70) NOT NULL,
  `TKT_TITLE` varchar(120) NOT NULL,
  `TKT_CUSTOM_FIELDS` longtext NOT NULL,
  `TKT_DESCRIPTION` longtext NOT NULL,
  `TKT_TITLE` varchar(50) NOT NULL,
  PRIMARY KEY (`TKT_ID`),
  UNIQUE KEY `TKT_ID_UNIQUE` (`TKT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

```
