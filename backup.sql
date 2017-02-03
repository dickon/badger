BEGIN TRANSACTION;
CREATE TABLE "configs" (
	`image_directory`	TEXT NOT NULL,
	`name`	TEXT NOT NULL,
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`configId`	TEXT,
	`background_image_file`	TEXT,
	`badgeWidth`	INTEGER NOT NULL,
	`badgeHeight`	INTEGER NOT NULL
);
INSERT INTO `configs` VALUES ('I:\xcellr8\2017\team photos','team2017',1,NULL,'I:\xcellr8\2017\badge template.png',88,44);
CREATE TABLE "badges" (
	`first`	TEXT NOT NULL,
	`last`	TEXT NOT NULL,
	`title`	TEXT,
	`id`	REAL NOT NULL,
	`filename`	TEXT NOT NULL,
	`configId`	INTEGER,
	`rotation`	NUMERIC,
	`left`	INTEGER,
	`top`	INTEGER,
	`right`	INTEGER,
	`bottom`	TEXT,
	`brightness`	NUMERIC,
	`contrast`	NUMERIC,
	PRIMARY KEY(`id`)
);
INSERT INTO `badges` VALUES ('beth','wilson','Team',1.0,'IMG_4770.JPG',1,-90,NULL,0.15,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('sarah','hamaia','Team',2.0,'IMG_4779.JPG',1,-90,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('ann','ding','Team',3.0,'IMG_4780.JPG',1,-90,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('alison','brock','Team',4.0,'IMG_4781.JPG',1,-90,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('alfie','whyatt','Team',5.0,'IMG_4789.JPG',1,0,0.4,0.08,0.2,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('sophie','wilkinson','Team',6.0,'IMG_4791.JPG',1,0,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('daniel','stone','Team',7.0,'IMG_4792.JPG',1,0,0.2,NULL,0.15,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('heather','dickerson','Team',8.0,'IMG_4799.JPG',1,0,0.3,0.08,0.3,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('trudy','reid','Team',9.0,'IMG_4794.JPG',1,0,0.3,NULL,0.2,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('greg','reid','Team',10.0,'IMG_4796.JPG',1,0,0.2,NULL,0.3,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('callum','dickerson','Team',11.0,'IMG_4816.JPG',1,0,0.3,NULL,0.3,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('erica','scott','Team',12.0,'IMG_4814.JPG',1,0,0.4,0.1,0.3,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('andy','staplehurst','Leader',13.0,'IMG_4804.JPG',1,0,0.35,NULL,0.35,NULL,2,NULL);
INSERT INTO `badges` VALUES ('steve','whyatt','Leader',14.0,'IMG_4803.JPG',1,0,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('jonny','staplehurst','Leader',15.0,'IMG_4802.JPG',1,0,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('tim','north','Leader',16.0,'IMG_4801.JPG',1,0,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('becky','dear','Team',17.0,'IMG_4773.JPG',1,-90,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('daniel','rowland','Team',18.0,'IMG_4817.JPG',1,-90,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('paul','johnson','Team',20.0,'IMG_4775.JPG',1,-90,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('emily','staplehurst','Team',21.0,'IMG_4823.JPG',1,0,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('lara','hagger','Team',22.0,'IMG_4825.JPG',1,-90,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('ben','rowland','Team',23.0,'IMG_4831.JPG',1,-90,NULL,NULL,NULL,NULL,2,NULL);
INSERT INTO `badges` VALUES ('susan','meah','Leader',24.0,'IMG_4771.JPG',1,-90,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('lynn','hawkins','Team',25.0,'IMG_4778.JPG',1,-90,NULL,0.12,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('mark','ashton','Team',26.0,'IMG_4835.JPG',1,0,NULL,NULL,NULL,NULL,2,NULL);
INSERT INTO `badges` VALUES ('eliane','hamaia','Leader',27.0,'IMG_4782.JPG',1,-90,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('ruth','barry','Team',28.0,'IMG_4839.JPG',1,-90,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('abbie','philips','Team',29.0,'IMG_4822.JPG',1,-90,NULL,NULL,NULL,NULL,2.5,NULL);
INSERT INTO `badges` VALUES ('adam','may','Team',30.0,'IMG_4842.JPG',1,-90,NULL,NULL,NULL,NULL,2.5,NULL);
INSERT INTO `badges` VALUES ('felix','osborne','Team',31.0,'IMG_4833.JPG',1,0,0.4,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('jenny','reed','Team',32.0,'IMG_4845.JPG',1,-90,NULL,NULL,NULL,NULL,1.8,NULL);
INSERT INTO `badges` VALUES ('olivia','durrant','Team',33.0,'IMG_4841.JPG',1,0,NULL,NULL,NULL,NULL,1.8,NULL);
INSERT INTO `badges` VALUES ('rowan','braam','Team',34.0,'IMG_4785.JPG',1,-90,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('rachel','owen','Team',35.0,'IMG_4830.JPG',1,-90,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('caroline','north','Leader',36.0,'IMG_4800.JPG',1,0,0.3,NULL,0.2,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('ellen','whyatt','Team',37.0,'IMG_4829.JPG',1,-90,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('grey','wu','Team',38.0,'IMG_4769.JPG',1,-90,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('julia','stone','Team',39.0,'IMG_4846.JPG',1,0,NULL,NULL,0.3,NULL,1.8,NULL);
INSERT INTO `badges` VALUES ('julia','au','Team',40.0,'IMG_4836.JPG',1,-90,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('alice','bates','Team',41.0,'IMG_4820.JPG',1,0,0.35,0.1,0.1,NULL,NULL,NULL);
INSERT INTO `badges` VALUES ('dickon','reed','Leader',42.0,'Dickon_Reed.JPG',1,0,NULL,NULL,NULL,NULL,NULL,NULL);
COMMIT;
