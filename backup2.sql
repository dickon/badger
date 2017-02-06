--
-- File generated with SQLiteStudio v3.1.1 on Sun Feb 5 09:09:41 2017
--
-- Text encoding used: System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: badges
CREATE TABLE badges (first TEXT NOT NULL, last TEXT NOT NULL, title TEXT, id REAL NOT NULL, filename TEXT NOT NULL, configId INTEGER, rotation NUMERIC, "left" INTEGER, top INTEGER, "right" INTEGER, bottom TEXT, brightness NUMERIC, contrast NUMERIC, printed BOOLEAN DEFAULT (0), PRIMARY KEY (id));
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('beth', 'wilson', 'Team Member', 1, 'IMG_4770.JPG', 1, -90, NULL, 0.15, NULL, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('sarah', 'hamaia', 'Team Member', 2, 'IMG_4779.JPG', 1, -90, NULL, NULL, NULL, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('ann', 'ding', 'Team Member', 3, 'IMG_4780.JPG', 1, -90, NULL, NULL, NULL, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('alison', 'brock', 'Team Member', 4, 'IMG_4781.JPG', 1, -90, 0.1, 0.2, NULL, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('alfie', 'whyatt', 'Team Member', 5, 'IMG_4789.JPG', 1, 0, 0.3, 0.08, 0.2, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('sophie', 'wilkinson', 'Team Member', 6, 'IMG_4791.JPG', 1, 0, 0.15, NULL, 0.15, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('daniel', 'stone', 'Team Member', 7, 'IMG_4792.JPG', 1, 0, 0.2, NULL, 0.15, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('heather', 'dickerson', 'Team Member', 8, 'IMG_4799.JPG', 1, 0, 0.3, 0.08, 0.3, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('trudy', 'reid', 'Team Member', 9, 'IMG_4794.JPG', 1, 0, 0.25, NULL, 0.23, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('greg', 'reid', 'Team Member', 10, 'IMG_4796.JPG', 1, 0, 0.2, NULL, 0.3, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('callum', 'dickerson', 'Team Member', 11, 'IMG_4816.JPG', 1, 0, 0.2, NULL, 0.3, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('erica', 'scott', 'Team Member', 12, 'IMG_4814.JPG', 1, 0, 0.27, 0.1, 0.25, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('andy', 'staplehurst', 'Leader', 13, 'IMG_4804.JPG', 1, 0, 0.3, NULL, 0.3, NULL, 2, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('steve', 'whyatt', 'Leader', 14, 'IMG_4803.JPG', 1, 0, 0.2, NULL, 0.2, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('jonny', 'staplehurst', 'Leader', 15, 'IMG_4802.JPG', 1, 0, 0.3, NULL, 0.25, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('tim', 'north', 'Leader', 16, 'IMG_4801.JPG', 1, 0, 0.29, NULL, 0.27, '0.12', NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('becky', 'dear', 'Team Member', 17, 'IMG_4773.JPG', 1, -90, NULL, NULL, NULL, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('daniel', 'rowland', 'Team Member', 18, 'IMG_4817.JPG', 1, -90, NULL, NULL, 0.1, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('paul', 'johnson', 'Team Member', 20, 'IMG_4861.JPG', 1, 0, 0.25, 0.03, 0.3, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('emily', 'staplehurst', 'Team Member', 21, 'IMG_4823.JPG', 1, 0, 0.25, NULL, 0.3, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('lara', 'hagger', 'Team Member', 22, 'IMG_4824.JPG', 1, 0, 0.3, NULL, 0.3, NULL, 1.3, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('ben', 'rowland', 'Team Member', 23, 'IMG_4831.JPG', 1, -90, NULL, NULL, NULL, NULL, 2, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('susan', 'meah', 'Leader', 24, 'IMG_4771.JPG', 1, -90, NULL, NULL, NULL, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('lynn', 'hawkins', 'Team Member', 25, 'IMG_4778.JPG', 1, -90, NULL, 0.2, NULL, '', NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('mark', 'ashton', 'Team Member', 26, 'IMG_4835.JPG', 1, 0, 0.23, NULL, 0.23, NULL, 2, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('eliane', 'hamaia', 'Leader', 27, 'Eliane Hamaia.JPG', 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('ruth', 'barry', 'Team Member', 28, 'IMG_4839.JPG', 1, -90, NULL, NULL, NULL, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('abbie', 'philips', 'Team Member', 29, 'IMG_4822.JPG', 1, -90, NULL, NULL, NULL, NULL, 2.5, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('adam', 'may', 'Team Member', 30, 'IMG_4842.JPG', 1, -90, NULL, NULL, NULL, NULL, 2.5, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('felix', 'osborne', 'Team Member', 31, 'IMG_4833.JPG', 1, 0, 0.3, NULL, 0.17, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('jenny', 'reed', 'Team Member', 32, 'IMG_4845.JPG', 1, -90, NULL, NULL, NULL, NULL, 1.8, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('olivia', 'durrant', 'Team Member', 33, 'IMG_4841.JPG', 1, 0, 0.1, NULL, 0.1, NULL, 1.8, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('rowan', 'braam', 'Team Member', 34, 'IMG_4785.JPG', 1, -90, NULL, NULL, NULL, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('rachel', 'owen', 'Team Member', 35, 'IMG_4830.JPG', 1, -90, NULL, NULL, NULL, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('caroline', 'north', 'Leader', 36, 'IMG_4800.JPG', 1, 0, 0.3, NULL, 0.2, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('ellen', 'whyatt', 'Team Member', 37, 'IMG_4829.JPG', 1, -90, NULL, NULL, NULL, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('grey', 'wu', 'Team Member', 38, 'IMG_4769.JPG', 1, -90, NULL, NULL, NULL, NULL, 1.5, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('julia', 'stone', 'Team Member', 39, 'IMG_4846.JPG', 1, 0, 0.1, NULL, 0.3, NULL, 1.8, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('julia', 'au', 'Team Member', 40, 'IMG_4836.JPG', 1, -90, NULL, 0.2, NULL, NULL, 1.4, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('alice', 'bates', 'Team Member', 41, 'IMG_4820.JPG', 1, 0, 0.28, 0.1, 0.18, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('dickon', 'reed', 'Leader', 42, 'Dickon_Reed.JPG', 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('barbara', 'ashton', 'Team Member', 43, 'Barbara Ashton.JPG', 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('natalie', 'palmer', 'Team Member', 44, 'Natalie Palmer.JPG', 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0);
INSERT INTO badges (first, last, title, id, filename, configId, rotation, "left", top, "right", bottom, brightness, contrast, printed) VALUES ('darren', 'white', 'Team Member', 45, 'Darren White.JPG', 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0);

-- Table: configs
CREATE TABLE "configs" (
	`image_directory`	TEXT NOT NULL,
	`name`	TEXT NOT NULL,
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`configId`	TEXT,
	`background_image_file`	TEXT,
	`badgeWidth`	INTEGER NOT NULL,
	`badgeHeight`	INTEGER NOT NULL
);
INSERT INTO configs (image_directory, name, id, configId, background_image_file, badgeWidth, badgeHeight) VALUES ('I:\xcellr8\2017\team photos', 'team2017', 1, NULL, 'I:\xcellr8\2017\badge template4.png', 88, 48);

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
