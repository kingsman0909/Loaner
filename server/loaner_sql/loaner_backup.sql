-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: mysql-7577163-kencyrusorilleneda-eee4.a.aivencloud.com    Database: loaner
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '45ab4c90-b418-11f1-9558-66991c8ed432:1-11354,
5ed257ae-a05f-11f1-bedb-f25e40b77c2f:1-60253,
e20c3ce2-9f82-11f1-b431-8a74feac2f10:1-371';

--
-- Table structure for table `blacklist`
--

DROP TABLE IF EXISTS `blacklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blacklist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_id` int DEFAULT NULL,
  `reason` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `blacklist_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blacklist`
--

LOCK TABLES `blacklist` WRITE;
/*!40000 ALTER TABLE `blacklist` DISABLE KEYS */;
/*!40000 ALTER TABLE `blacklist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `capital`
--

DROP TABLE IF EXISTS `capital`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `capital` (
  `id` int NOT NULL AUTO_INCREMENT,
  `loaner_id` int DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `source` enum('capitalAdd','loanRelease','PaymentCollection') NOT NULL,
  `added_at` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `loaner_id` (`loaner_id`),
  CONSTRAINT `capital_ibfk_1` FOREIGN KEY (`loaner_id`) REFERENCES `loaner` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `capital`
--

LOCK TABLES `capital` WRITE;
/*!40000 ALTER TABLE `capital` DISABLE KEYS */;
INSERT INTO `capital` VALUES (1,1,100000,'capitalAdd','2026-10-03'),(2,2,100000,'capitalAdd','2026-10-03'),(3,3,100000,'capitalAdd','2026-10-03'),(4,4,100000,'capitalAdd','2026-10-03'),(5,5,100000,'capitalAdd','2026-10-03'),(6,6,100000,'capitalAdd','2026-10-03'),(7,7,100000,'capitalAdd','2026-10-03'),(8,8,100000,'capitalAdd','2026-10-03'),(9,9,100000,'capitalAdd','2026-10-03'),(10,10,100000,'capitalAdd','2026-10-03'),(11,11,100000,'capitalAdd','2026-10-03'),(12,12,100000,'capitalAdd','2026-10-03'),(13,13,100000,'capitalAdd','2026-10-03'),(14,14,100000,'capitalAdd','2026-10-03'),(15,15,100000,'capitalAdd','2026-10-03'),(16,16,100000,'capitalAdd','2026-10-03'),(17,17,100000,'capitalAdd','2026-10-03'),(18,18,100000,'capitalAdd','2026-10-03'),(19,19,100000,'capitalAdd','2026-10-03'),(20,20,100000,'capitalAdd','2026-10-03');
/*!40000 ALTER TABLE `capital` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loan_type`
--

DROP TABLE IF EXISTS `loan_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loan_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  `interest` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loan_type`
--

LOCK TABLES `loan_type` WRITE;
/*!40000 ALTER TABLE `loan_type` DISABLE KEYS */;
INSERT INTO `loan_type` VALUES (1,'Daily',5),(2,'Weekly',10),(3,'Monthly',15),(4,'Emergency',20),(5,'Business',12);
/*!40000 ALTER TABLE `loan_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loaner`
--

DROP TABLE IF EXISTS `loaner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loaner` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(30) NOT NULL,
  `password` varchar(20) NOT NULL,
  `firstname` varchar(20) NOT NULL,
  `lastname` varchar(20) NOT NULL,
  `age` int NOT NULL,
  `source_of_income` varchar(50) NOT NULL,
  `province` varchar(20) NOT NULL,
  `city` varchar(20) NOT NULL,
  `brgy` varchar(20) NOT NULL,
  `subd` varchar(20) NOT NULL,
  `contact` varchar(20) NOT NULL,
  `role` enum('admin') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`,`firstname`,`lastname`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loaner`
--

LOCK TABLES `loaner` WRITE;
/*!40000 ALTER TABLE `loaner` DISABLE KEYS */;
INSERT INTO `loaner` VALUES (1,'admin01','humberger123','Juan','Dela Cruz',30,'Loan Officer','Laguna','Cabuyao','Mamatid','Purok 1','09170000001','admin'),(2,'admin02','password123','Pedro','Santos',32,'Loan Officer','Laguna','Santa Rosa','Balibago','Purok 2','09170000002','admin'),(3,'admin03','password123','Maria','Reyes',29,'Loan Officer','Laguna','Bi??an','San Antonio','Purok 3','09170000003','admin'),(4,'admin04','password123','Ana','Garcia',31,'Loan Officer','Laguna','Calamba','Real','Purok 4','09170000004','admin'),(5,'admin05','password123','Jose','Mendoza',35,'Loan Officer','Laguna','San Pedro','San Vicente','Purok 5','09170000005','admin'),(6,'admin06','password123','Carlo','Bautista',28,'Loan Officer','Cavite','Dasmarinas','Salitran','Purok 6','09170000006','admin'),(7,'admin07','password123','Ramon','Navarro',37,'Loan Officer','Cavite','Imus','Bucandala','Purok 7','09170000007','admin'),(8,'admin08','password123','Liza','Aquino',27,'Loan Officer','Cavite','General Trias','San Francisco','Purok 8','09170000008','admin'),(9,'admin09','password123','Mark','Torres',33,'Loan Officer','Laguna','Los Ba??os','Batong Malake','Purok 9','09170000009','admin'),(10,'admin10','password123','Grace','Flores',30,'Loan Officer','Laguna','Pagsanjan','Poblacion','Purok 10','09170000010','admin'),(11,'admin11','password123','Kevin','Ramos',29,'Loan Officer','Rizal','Antipolo','Mayamot','Purok 11','09170000011','admin'),(12,'admin12','password123','Sarah','Castillo',34,'Loan Officer','Rizal','Cainta','San Isidro','Purok 12','09170000012','admin'),(13,'admin13','password123','Michael','Fernandez',36,'Loan Officer','Batangas','Lipa','Mataas na Lupa','Purok 13','09170000013','admin'),(14,'admin14','password123','Nicole','Villanueva',28,'Loan Officer','Batangas','Tanauan','Darasa','Purok 14','09170000014','admin'),(15,'admin15','password123','Daniel','Cruz',31,'Loan Officer','Quezon','Lucena','Gulang-Gulang','Purok 15','09170000015','admin'),(16,'admin16','password123','Sofia','Domingo',27,'Loan Officer','Quezon','Tayabas','Wakas','Purok 16','09170000016','admin'),(17,'admin17','password123','Anthony','Garcia',38,'Loan Officer','Laguna','Cabuyao','Banay-Banay','Purok 17','09170000017','admin'),(18,'admin18','password123','Angela','Rivera',30,'Loan Officer','Laguna','Calamba','Canlubang','Purok 18','09170000018','admin'),(19,'admin19','password123','Francis','Morales',33,'Loan Officer','Cavite','Imus','Anabu','Purok 19','09170000019','admin'),(20,'admin20','password123','Karen','Salazar',29,'Loan Officer','Cavite','Bacoor','Molino','Purok 20','09170000020','admin'),(21,'edmar','password123','john edmar','redoble',27,'work','laguna','cabuyao','banay','lakeside','09096068957','admin'),(22,'jaxpjax','Ken_09096068957','Ken','Orilleneda',22,'Allwoance','Laguna','City','Banay banay','Lakeside','09096068957','admin'),(23,'aramallari','aramallari','Ara','Mallari',21,'Business','Laguna','City of Cabuyao','San Isidro','Canaan Homes','09543156479','admin'),(24,'Cessy','princess123','Princess ','Argamoza ',21,'Business','Laguna','Cabuyao ','Butong','Purok 2','09300707511','admin'),(25,'wilma','wilma123','Wilma','Orilleneda',67,'Allowance','Laguna','Cabuyao','Banay banay','Lakeside','09532480752','admin'),(26,'Lumi','geraldgerald','GERALD','DELFINADO',20,'Allowance','Laguna','Cabuyao','San Isidro','98B','09917472613','admin'),(27,'marjohn','12345678','marjohn','bantilan',23,'Freelance','laguna','cabuyao','pulo','DVV','090901232423','admin'),(28,'Contridas332','09463993983','Lien Mar','Contridas',21,'Salary','Laguna','Cabuyao','Mamatid','Mabuhay','09463993983','admin'),(29,'alora','alora123','Alora','Redoble',22,'Remittance','Laguna','Cabuyai','Banay banay','Lakeside','09096068957','admin'),(30,'Cyron','ken_09096068957','Cyron','Arendain',22,'Pension','Laguna','Cabuyao','Banay banay','Lakeside','09093068957','admin');
/*!40000 ALTER TABLE `loaner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loans`
--

DROP TABLE IF EXISTS `loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_id` int DEFAULT NULL,
  `loaner_id` int DEFAULT NULL,
  `loan_type_id` int DEFAULT NULL,
  `principalAmount` int NOT NULL,
  `interest` int NOT NULL,
  `totalDue` int NOT NULL,
  `releaseDate` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('pending','active','overdue','paid','closed') DEFAULT 'active',
  PRIMARY KEY (`id`),
  KEY `loaner_id` (`loaner_id`),
  KEY `member_id` (`member_id`),
  KEY `loan_type_id` (`loan_type_id`),
  CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`loaner_id`) REFERENCES `loaner` (`id`) ON DELETE CASCADE,
  CONSTRAINT `loans_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`) ON DELETE CASCADE,
  CONSTRAINT `loans_ibfk_3` FOREIGN KEY (`loan_type_id`) REFERENCES `loan_type` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7322 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loans`
--

LOCK TABLES `loans` WRITE;
/*!40000 ALTER TABLE `loans` DISABLE KEYS */;
INSERT INTO `loans` VALUES (7316,1008,24,2,10000,10,11000,'2026-10-08','2026-11-08','paid'),(7317,1011,28,1,3000,5,3150,'2026-09-30','2026-10-30','active'),(7318,1009,24,2,10000,10,11000,'2026-10-08','2026-11-08','paid'),(7319,1012,24,2,10000,10,13000,'2026-10-08','2027-01-08','paid'),(7320,1012,24,3,10000,15,11500,'2026-10-09','2026-11-09','paid'),(7321,1012,24,2,10000,10,11000,'2026-11-11','2026-12-11','paid');
/*!40000 ALTER TABLE `loans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member`
--

DROP TABLE IF EXISTS `member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `member` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `loaner_id` int DEFAULT NULL,
  `firstname` varchar(20) NOT NULL,
  `lastname` varchar(20) NOT NULL,
  `age` int NOT NULL,
  `source_of_income` varchar(50) NOT NULL,
  `province` varchar(20) NOT NULL,
  `city` varchar(20) NOT NULL,
  `brgy` varchar(20) NOT NULL,
  `subd` varchar(20) NOT NULL,
  `contact` varchar(20) NOT NULL,
  `status` enum('pending','approved','rejected','blacklisted') DEFAULT NULL,
  `maxLoan` int DEFAULT '5',
  `activeLoan` int DEFAULT '0',
  `role` enum('member') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `firstname` (`firstname`,`lastname`),
  UNIQUE KEY `username` (`username`),
  KEY `loaner_id` (`loaner_id`),
  CONSTRAINT `member_ibfk_1` FOREIGN KEY (`loaner_id`) REFERENCES `loaner` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1013 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member`
--

LOCK TABLES `member` WRITE;
/*!40000 ALTER TABLE `member` DISABLE KEYS */;
INSERT INTO `member` VALUES (1008,'cyrusken.orilleneda','Cyrus ken@12345',24,'Cyrus ken','Orilleneda',22,'Freelance','Laguna','Cabuyao','Banay banay','Lakeside','09096068957','approved',5,1,'member'),(1009,'cyromn.arenmdain','Cyromn@12345',24,'Cyromn','arenmdain',22,'Salary','laguna','cabuyao','banay','lakesde','09096068957','pending',5,1,NULL),(1010,'john.saja','john@12345',27,'john','saja',18,'Salary','laguna','cabuyao','pulo','DVV','09235345343','pending',5,0,NULL),(1011,'lienmar.contridas','Lien Mar@12345',28,'Lien Mar','Contridas',21,'','Laguna','Cabuyao','Mamatid','Mabuhay','09463993983','approved',5,1,NULL),(1012,'princess.argamoza','Princess@12345',24,'Princess','Argamoza',36,'Commission','Laguna','Cabuyao','Banay','Lakeside','09096068857','approved',5,3,NULL);
/*!40000 ALTER TABLE `member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `loan_id` int DEFAULT NULL,
  `amount_paid` int NOT NULL,
  `payment_date` date NOT NULL,
  `collected_by_id` int NOT NULL,
  `method` varchar(20) DEFAULT NULL,
  `type` enum('full','partial') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `collected_by_id` (`collected_by_id`),
  KEY `loan_id` (`loan_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`collected_by_id`) REFERENCES `loaner` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2018 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (2010,7316,5000,'2026-10-08',24,'cash','partial'),(2011,7316,6000,'2026-10-09',24,'cash','full'),(2012,7318,5000,'2026-10-09',24,'cash','partial'),(2013,7319,3000,'2026-10-15',24,'cash','partial'),(2014,7320,11500,'2026-10-08',24,'gcash','full'),(2015,7319,10000,'2026-10-09',24,'cash','full'),(2016,7321,11000,'2026-10-11',24,'cash','full'),(2017,7318,6000,'2026-10-11',24,'cash','full');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'loaner'
--

--
-- Dumping routines for database 'loaner'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-11 13:34:57
