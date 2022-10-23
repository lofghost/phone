-- --------------------------------------------------------
-- Värd:                         127.0.0.1
-- Serverversion:                10.1.35-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win32
-- HeidiSQL Version:             9.5.0.5196
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for qalle
CREATE DATABASE IF NOT EXISTS `qalle` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `qalle`;

-- Dumping structure for tabell qalle.phone_images
CREATE TABLE IF NOT EXISTS `phone_images` (
  `cid` varchar(50) NOT NULL,
  `photos` longtext NOT NULL,
  PRIMARY KEY (`cid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumpar data för tabell qalle.phone_images: ~1 rows (ungefär)
/*!40000 ALTER TABLE `phone_images` DISABLE KEYS */;
INSERT INTO `phone_images` (`cid`, `photos`) VALUES
	('1993-06-16-8036', '[{"time":1553310015,"link":"https://i.imgur.com/INDN0c3.jpg"},{"time":1553310058,"link":"https://i.imgur.com/V4Okipx.jpg"},{"time":1553310067,"link":"https://i.imgur.com/qy5yu8U.jpg"},{"time":1553310072,"link":"https://i.imgur.com/tuQck8w.jpg"},{"time":1553310078,"link":"https://i.imgur.com/C0CzrUd.jpg"},{"time":1553310083,"link":"https://i.imgur.com/F82MKGk.jpg"},{"time":1553310088,"link":"https://i.imgur.com/sGNd3oO.jpg"}]');
/*!40000 ALTER TABLE `phone_images` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
