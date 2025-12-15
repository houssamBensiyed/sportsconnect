-- =====================================================
-- SPORTSCONNECT - BASE DE DONNÉES
-- Plateforme de mise en relation Sportifs & Coachs
-- =====================================================

-- Suppression de la base si elle existe
DROP DATABASE IF EXISTS sportsconnect;

-- Création de la base de données
CREATE DATABASE sportsconnect
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE sportsconnect;

-- =====================================================
-- TABLE: USERS
-- Gestion de l'authentification
-- =====================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('sportif', 'coach') NOT NULL,
    reset_token VARCHAR(255) NULL,
    reset_token_expiry DATETIME NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_reset_token (reset_token)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: SPORTIFS
-- Profils des sportifs/clients
-- =====================================================
CREATE TABLE sportifs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NULL,
    birth_date DATE NULL,
    address VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    profile_photo VARCHAR(255) DEFAULT 'default_avatar.png',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_sportif_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_city (city),
    INDEX idx_name (last_name, first_name)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: COACHES
-- Profils des coachs professionnels
-- =====================================================
CREATE TABLE coaches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NULL,
    bio TEXT NULL,
    profile_photo VARCHAR(255) DEFAULT 'default_coach.png',
    years_experience INT DEFAULT 0,
    address VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    hourly_rate DECIMAL(10, 2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_coach_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_city (city),
    INDEX idx_available (is_available),
    INDEX idx_hourly_rate (hourly_rate),
    INDEX idx_experience (years_experience)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: SPORTS
-- Catalogue des disciplines sportives
-- =====================================================
CREATE TABLE sports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    icon VARCHAR(100) DEFAULT 'sports.png',
    category ENUM(
        'sports_collectifs',
        'sports_individuels', 
        'sports_combat',
        'sports_aquatiques',
        'fitness',
        'autre'
    ) DEFAULT 'autre',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_name (name)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: COACH_SPORTS
-- Relation Many-to-Many: Coachs <-> Sports
-- =====================================================
CREATE TABLE coach_sports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coach_id INT NOT NULL,
    sport_id INT NOT NULL,
    level ENUM('debutant', 'intermediaire', 'avance', 'expert') DEFAULT 'intermediaire',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_cs_coach 
        FOREIGN KEY (coach_id) REFERENCES coaches(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cs_sport 
        FOREIGN KEY (sport_id) REFERENCES sports(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    UNIQUE KEY uk_coach_sport (coach_id, sport_id),
    INDEX idx_level (level)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: CERTIFICATIONS
-- Certifications et diplômes des coachs
-- =====================================================
CREATE TABLE certifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coach_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NULL,
    year_obtained YEAR NULL,
    document_url VARCHAR(255) NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_cert_coach 
        FOREIGN KEY (coach_id) REFERENCES coaches(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_coach (coach_id),
    INDEX idx_year (year_obtained)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: AVAILABILITIES
-- Créneaux de disponibilité des coachs
-- =====================================================
CREATE TABLE availabilities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coach_id INT NOT NULL,
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_day ENUM('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche') NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_avail_coach 
        FOREIGN KEY (coach_id) REFERENCES coaches(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    CONSTRAINT chk_time_order CHECK (end_time > start_time),
    
    INDEX idx_coach_date (coach_id, available_date),
    INDEX idx_date (available_date),
    INDEX idx_booked (is_booked)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: RESERVATIONS
-- Réservations de séances sportives
-- =====================================================
CREATE TABLE reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sportif_id INT NOT NULL,
    coach_id INT NOT NULL,
    availability_id INT NOT NULL,
    sport_id INT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM(
        'en_attente', 
        'acceptee', 
        'refusee', 
        'annulee', 
        'terminee'
    ) DEFAULT 'en_attente',
    notes_sportif TEXT NULL,
    notes_coach TEXT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    cancelled_by ENUM('sportif', 'coach') NULL,
    cancellation_reason TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_res_sportif 
        FOREIGN KEY (sportif_id) REFERENCES sportifs(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_res_coach 
        FOREIGN KEY (coach_id) REFERENCES coaches(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_res_availability 
        FOREIGN KEY (availability_id) REFERENCES availabilities(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_res_sport 
        FOREIGN KEY (sport_id) REFERENCES sports(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_sportif (sportif_id),
    INDEX idx_coach (coach_id),
    INDEX idx_status (status),
    INDEX idx_session_date (session_date),
    INDEX idx_coach_date (coach_id, session_date)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: REVIEWS
-- Avis et notes après les séances
-- =====================================================
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reservation_id INT NOT NULL UNIQUE,
    sportif_id INT NOT NULL,
    coach_id INT NOT NULL,
    rating TINYINT NOT NULL,
    comment TEXT NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    coach_response TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_review_reservation 
        FOREIGN KEY (reservation_id) REFERENCES reservations(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_review_sportif 
        FOREIGN KEY (sportif_id) REFERENCES sportifs(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_review_coach 
        FOREIGN KEY (coach_id) REFERENCES coaches(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5),
    
    INDEX idx_coach (coach_id),
    INDEX idx_rating (rating),
    INDEX idx_visible (is_visible)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: NOTIFICATIONS
-- Système de notifications utilisateurs
-- =====================================================
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM(
        'reservation', 
        'annulation', 
        'rappel', 
        'avis', 
        'systeme',
        'confirmation'
    ) DEFAULT 'systeme',
    reference_id INT NULL,
    reference_type VARCHAR(50) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_notif_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: CSRF_TOKENS (Bonus Sécurité)
-- Protection contre les attaques CSRF
-- =====================================================
CREATE TABLE csrf_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_csrf_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB;

-- =====================================================
-- INSERTIONS: DONNÉES DE DÉMONSTRATION
-- =====================================================

-- Sports
INSERT INTO sports (name, description, icon, category) VALUES
('Football', 'Sport collectif opposant deux équipes de onze joueurs', 'football.png', 'sports_collectifs'),
('Tennis', 'Sport de raquette opposant deux ou quatre joueurs', 'tennis.png', 'sports_individuels'),
('Natation', 'Sport aquatique consistant à nager le plus vite possible', 'natation.png', 'sports_aquatiques'),
('Athlétisme', 'Ensemble de disciplines sportives codifiées', 'athletisme.png', 'sports_individuels'),
('Boxe', 'Sport de combat pratiqué depuis le XVIIIe siècle', 'boxe.png', 'sports_combat'),
('Judo', 'Art martial japonais fondé par Jigoro Kano', 'judo.png', 'sports_combat'),
('Basketball', 'Sport collectif opposant deux équipes de cinq joueurs', 'basketball.png', 'sports_collectifs'),
('Musculation', 'Ensemble d''exercices physiques visant le développement musculaire', 'musculation.png', 'fitness'),
('Yoga', 'Discipline visant à réaliser l''unification de l''être humain', 'yoga.png', 'fitness'),
('CrossFit', 'Programme de conditionnement physique général', 'crossfit.png', 'fitness'),
('MMA', 'Arts martiaux mixtes combinant plusieurs disciplines', 'mma.png', 'sports_combat'),
('Karaté', 'Art martial japonais utilisant des techniques de percussion', 'karate.png', 'sports_combat');

-- Utilisateurs (Mots de passe: "Password123!" hashé avec bcrypt)
-- Note: En production, utilisez password_hash() de PHP
INSERT INTO users (email, password, role, email_verified) VALUES
-- Coachs
('coach.martin@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coach', TRUE),
('coach.dupont@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coach', TRUE),
('coach.bernard@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coach', TRUE),
('coach.petit@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coach', TRUE),
('coach.robert@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coach', TRUE),
-- Sportifs
('sportif.leroy@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sportif', TRUE),
('sportif.moreau@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sportif', TRUE),
('sportif.simon@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sportif', TRUE),
('sportif.laurent@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sportif', TRUE),
('sportif.michel@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sportif', TRUE);

-- Profils Coachs
INSERT INTO coaches (user_id, first_name, last_name, phone, bio, years_experience, city, hourly_rate) VALUES
(1, 'Thomas', 'Martin', '0612345678', 'Coach sportif passionné avec plus de 10 ans d''expérience. Spécialisé en football et préparation physique. J''accompagne des sportifs de tous niveaux vers leurs objectifs.', 10, 'Paris', 45.00),
(2, 'Sophie', 'Dupont', '0623456789', 'Ancienne athlète de haut niveau, je partage maintenant ma passion pour la natation et le fitness. Approche personnalisée et bienveillante.', 8, 'Lyon', 50.00),
(3, 'Pierre', 'Bernard', '0634567890', 'Expert en arts martiaux (Judo, Karaté). Ceinture noire 4ème dan. J''enseigne la discipline et le respect à travers le sport.', 15, 'Marseille', 55.00),
(4, 'Marie', 'Petit', '0645678901', 'Coach certifiée en Yoga et Pilates. Je vous aide à trouver l''équilibre entre corps et esprit. Séances adaptées à tous les niveaux.', 6, 'Bordeaux', 40.00),
(5, 'Lucas', 'Robert', '0656789012', 'Préparateur physique et coach CrossFit. Ancien sportif professionnel. Programmes intensifs et résultats garantis.', 12, 'Toulouse', 60.00);

-- Profils Sportifs
INSERT INTO sportifs (user_id, first_name, last_name, phone, birth_date, city) VALUES
(6, 'Julie', 'Leroy', '0667890123', '1995-03-15', 'Paris'),
(7, 'Antoine', 'Moreau', '0678901234', '1990-07-22', 'Lyon'),
(8, 'Emma', 'Simon', '0689012345', '1998-11-30', 'Marseille'),
(9, 'Nicolas', 'Laurent', '0690123456', '1988-05-10', 'Bordeaux'),
(10, 'Léa', 'Michel', '0601234567', '2000-01-25', 'Toulouse');

-- Association Coachs-Sports
INSERT INTO coach_sports (coach_id, sport_id, level) VALUES
(1, 1, 'expert'),      -- Thomas Martin - Football Expert
(1, 8, 'avance'),      -- Thomas Martin - Musculation Avancé
(2, 3, 'expert'),      -- Sophie Dupont - Natation Expert
(2, 8, 'avance'),      -- Sophie Dupont - Musculation Avancé
(2, 9, 'intermediaire'), -- Sophie Dupont - Yoga Intermédiaire
(3, 6, 'expert'),      -- Pierre Bernard - Judo Expert
(3, 12, 'expert'),     -- Pierre Bernard - Karaté Expert
(3, 11, 'avance'),     -- Pierre Bernard - MMA Avancé
(4, 9, 'expert'),      -- Marie Petit - Yoga Expert
(4, 8, 'intermediaire'), -- Marie Petit - Musculation Intermédiaire
(5, 10, 'expert'),     -- Lucas Robert - CrossFit Expert
(5, 8, 'expert'),      -- Lucas Robert - Musculation Expert
(5, 4, 'avance');      -- Lucas Robert - Athlétisme Avancé

-- Certifications des coachs
INSERT INTO certifications (coach_id, name, organization, year_obtained, is_verified) VALUES
(1, 'Diplôme d''État de la Jeunesse (DEJEPS) - Football', 'Ministère des Sports', 2014, TRUE),
(1, 'Certificat de Préparateur Physique', 'INSEP', 2016, TRUE),
(2, 'Brevet d''État d\'Éducateur Sportif (BEES) - Natation', 'Fédération Française de Natation', 2015, TRUE),
(2, 'Certification Fitness et Nutrition', 'AFPA', 2018, TRUE),
(3, 'Ceinture Noire 4ème Dan Judo', 'Fédération Française de Judo', 2010, TRUE),
(3, 'Diplôme d''Instructeur de Karaté', 'Fédération Française de Karaté', 2012, TRUE),
(4, 'Certification Yoga Alliance RYT-500', 'Yoga Alliance', 2017, TRUE),
(4, 'Diplôme de Pilates Matwork', 'STOTT Pilates', 2019, TRUE),
(5, 'CrossFit Level 3 Trainer', 'CrossFit Inc.', 2016, TRUE),
(5, 'Certificat de Préparation Physique Sportive', 'CREPS', 2014, TRUE);

-- Disponibilités des coachs (pour les 2 prochaines semaines)
INSERT INTO availabilities (coach_id, available_date, start_time, end_time, is_booked) VALUES
-- Coach Thomas Martin
(1, CURDATE(), '09:00:00', '10:00:00', FALSE),
(1, CURDATE(), '10:00:00', '11:00:00', FALSE),
(1, CURDATE(), '14:00:00', '15:00:00', FALSE),
(1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00', '10:00:00', FALSE),
(1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00:00', '12:00:00', FALSE),
(1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '15:00:00', '16:00:00', FALSE),
(1, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00', '11:00:00', FALSE),
-- Coach Sophie Dupont
(2, CURDATE(), '08:00:00', '09:00:00', FALSE),
(2, CURDATE(), '11:00:00', '12:00:00', TRUE),
(2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '09:00:00', FALSE),
(2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '16:00:00', '17:00:00', FALSE),
(2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00:00', '10:00:00', FALSE),
-- Coach Pierre Bernard
(3, CURDATE(), '17:00:00', '18:00:00', FALSE),
(3, CURDATE(), '18:00:00', '19:00:00', TRUE),
(3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:00:00', '18:00:00', FALSE),
(3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '18:00:00', '19:00:00', FALSE),
-- Coach Marie Petit
(4, CURDATE(), '07:00:00', '08:00:00', FALSE),
(4, CURDATE(), '12:00:00', '13:00:00', FALSE),
(4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:00:00', '08:00:00', FALSE),
(4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:00:00', '20:00:00', FALSE),
-- Coach Lucas Robert
(5, CURDATE(), '06:00:00', '07:00:00', FALSE),
(5, CURDATE(), '18:00:00', '19:00:00', TRUE),
(5, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '06:00:00', '07:00:00', FALSE),
(5, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:00:00', '20:00:00', FALSE),
(5, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '06:00:00', '07:00:00', FALSE);

-- Réservations exemples
INSERT INTO reservations (sportif_id, coach_id, availability_id, sport_id, session_date, start_time, end_time, status, notes_sportif, price) VALUES
(1, 2, 9, 3, CURDATE(), '11:00:00', '12:00:00', 'acceptee', 'Je souhaite améliorer ma technique de crawl', 50.00),
(2, 3, 14, 6, CURDATE(), '18:00:00', '19:00:00', 'acceptee', 'Débutant en judo, première séance', 55.00),
(3, 5, 22, 10, CURDATE(), '18:00:00', '19:00:00', 'en_attente', 'Je veux découvrir le CrossFit', 60.00),
(4, 1, 1, 1, CURDATE(), '09:00:00', '10:00:00', 'en_attente', 'Préparation pour un tournoi amateur', 45.00),
(5, 4, 17, 9, CURDATE(), '07:00:00', '08:00:00', 'terminee', 'Séance de yoga matinal', 40.00);

-- Avis des sportifs (uniquement pour les séances terminées)
INSERT INTO reviews (reservation_id, sportif_id, coach_id, rating, comment) VALUES
(5, 5, 4, 5, 'Excellente séance! Marie est très pédagogue et attentive. Je me sens déjà plus détendue. Je recommande vivement!');

-- Notifications exemples
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(1, 'Nouvelle réservation', CONCAT('Julie Leroy a réservé une séance de Football le ', DATE_FORMAT(CURDATE(), '%d/%m/%Y')), 'reservation', FALSE),
(6, 'Réservation confirmée', 'Votre séance de natation avec Sophie Dupont a été acceptée', 'confirmation', TRUE),
(7, 'Séance demain', 'Rappel: Vous avez une séance de Judo demain à 18h00', 'rappel', FALSE),
(3, 'Nouvel avis reçu', 'Léa Michel vous a laissé un avis 5 étoiles!', 'avis', FALSE);

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue: Profil complet des coachs avec leurs sports
CREATE VIEW v_coach_profiles AS
SELECT 
    c.id AS coach_id,
    c.first_name,
    c.last_name,
    c.bio,
    c.profile_photo,
    c.years_experience,
    c.city,
    c.hourly_rate,
    c.is_available,
    u.email,
    GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', ') AS sports,
    COUNT(DISTINCT cert.id) AS certifications_count,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    COUNT(DISTINCT r.id) AS reviews_count
FROM coaches c
JOIN users u ON c.user_id = u.id
LEFT JOIN coach_sports cs ON c.id = cs.coach_id
LEFT JOIN sports s ON cs.sport_id = s.id
LEFT JOIN certifications cert ON c.id = cert.coach_id
LEFT JOIN reviews r ON c.id = r.coach_id AND r.is_visible = TRUE
WHERE u.is_active = TRUE
GROUP BY c.id;

-- Vue: Statistiques du dashboard coach
CREATE VIEW v_coach_dashboard_stats AS
SELECT 
    c.id AS coach_id,
    c.first_name,
    c.last_name,
    COUNT(CASE WHEN res.status = 'en_attente' THEN 1 END) AS pending_requests,
    COUNT(CASE WHEN res.status = 'acceptee' AND res.session_date = CURDATE() THEN 1 END) AS today_sessions,
    COUNT(CASE WHEN res.status = 'acceptee' AND res.session_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY) THEN 1 END) AS tomorrow_sessions,
    COUNT(CASE WHEN res.status = 'terminee' THEN 1 END) AS completed_sessions,
    COALESCE(SUM(CASE WHEN res.status = 'terminee' THEN res.price ELSE 0 END), 0) AS total_earnings
FROM coaches c
LEFT JOIN reservations res ON c.id = res.coach_id
GROUP BY c.id;

-- Vue: Prochaine séance d'un coach
CREATE VIEW v_coach_next_session AS
SELECT 
    c.id AS coach_id,
    res.id AS reservation_id,
    res.session_date,
    res.start_time,
    res.end_time,
    sp.first_name AS sportif_first_name,
    sp.last_name AS sportif_last_name,
    sp.phone AS sportif_phone,
    s.name AS sport_name,
    res.notes_sportif
FROM coaches c
JOIN reservations res ON c.id = res.coach_id
JOIN sportifs sp ON res.sportif_id = sp.id
JOIN sports s ON res.sport_id = s.id
WHERE res.status = 'acceptee'
  AND (res.session_date > CURDATE() 
       OR (res.session_date = CURDATE() AND res.start_time > CURTIME()))
ORDER BY res.session_date, res.start_time
LIMIT 1;

-- =====================================================
-- PROCÉDURES STOCKÉES
-- =====================================================

DELIMITER //

-- Procédure: Créer une réservation
CREATE PROCEDURE sp_create_reservation(
    IN p_sportif_id INT,
    IN p_coach_id INT,
    IN p_availability_id INT,
    IN p_sport_id INT,
    IN p_notes TEXT
)
BEGIN
    DECLARE v_date DATE;
    DECLARE v_start TIME;
    DECLARE v_end TIME;
    DECLARE v_price DECIMAL(10,2);
    DECLARE v_is_booked BOOLEAN;
    
    -- Vérifier que le créneau n'est pas déjà réservé
    SELECT available_date, start_time, end_time, is_booked 
    INTO v_date, v_start, v_end, v_is_booked
    FROM availabilities 
    WHERE id = p_availability_id AND coach_id = p_coach_id;
    
    IF v_is_booked THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ce créneau est déjà réservé';
    END IF;
    
    -- Récupérer le tarif du coach
    SELECT hourly_rate INTO v_price FROM coaches WHERE id = p_coach_id;
    
    -- Créer la réservation
    INSERT INTO reservations (
        sportif_id, coach_id, availability_id, sport_id,
        session_date, start_time, end_time, notes_sportif, price
    ) VALUES (
        p_sportif_id, p_coach_id, p_availability_id, p_sport_id,
        v_date, v_start, v_end, p_notes, v_price
    );
    
    -- Marquer le créneau comme réservé
    UPDATE availabilities SET is_booked = TRUE WHERE id = p_availability_id;
    
    SELECT LAST_INSERT_ID() AS reservation_id;
END //

-- Procédure: Annuler une réservation
CREATE PROCEDURE sp_cancel_reservation(
    IN p_reservation_id INT,
    IN p_cancelled_by ENUM('sportif', 'coach'),
    IN p_reason TEXT
)
BEGIN
    DECLARE v_availability_id INT;
    DECLARE v_status VARCHAR(20);
    
    -- Vérifier le statut actuel
    SELECT availability_id, status INTO v_availability_id, v_status
    FROM reservations WHERE id = p_reservation_id;
    
    IF v_status IN ('annulee', 'terminee', 'refusee') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cette réservation ne peut pas être annulée';
    END IF;
    
    -- Mettre à jour la réservation
    UPDATE reservations 
    SET status = 'annulee',
        cancelled_by = p_cancelled_by,
        cancellation_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_reservation_id;
    
    -- Libérer le créneau
    UPDATE availabilities SET is_booked = FALSE WHERE id = v_availability_id;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

DELIMITER //

-- Trigger: Notification automatique lors d'une nouvelle réservation
CREATE TRIGGER tr_after_reservation_insert
AFTER INSERT ON reservations
FOR EACH ROW
BEGIN
    -- Notification pour le coach
    INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
    SELECT 
        c.user_id,
        'Nouvelle demande de réservation',
        CONCAT('Vous avez reçu une nouvelle demande de séance pour le ', DATE_FORMAT(NEW.session_date, '%d/%m/%Y')),
        'reservation',
        NEW.id,
        'reservation'
    FROM coaches c WHERE c.id = NEW.coach_id;
END //

-- Trigger: Notification lors du changement de statut
CREATE TRIGGER tr_after_reservation_update
AFTER UPDATE ON reservations
FOR EACH ROW
BEGIN
    DECLARE v_sportif_user_id INT;
    
    IF OLD.status != NEW.status THEN
        -- Récupérer l'user_id du sportif
        SELECT user_id INTO v_sportif_user_id FROM sportifs WHERE id = NEW.sportif_id;
        
        -- Notification pour le sportif
        IF NEW.status = 'acceptee' THEN
            INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
            VALUES (v_sportif_user_id, 'Réservation acceptée', 
                    CONCAT('Votre séance du ', DATE_FORMAT(NEW.session_date, '%d/%m/%Y'), ' a été acceptée!'),
                    'confirmation', NEW.id, 'reservation');
        ELSEIF NEW.status = 'refusee' THEN
            INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
            VALUES (v_sportif_user_id, 'Réservation refusée', 
                    CONCAT('Votre demande de séance du ', DATE_FORMAT(NEW.session_date, '%d/%m/%Y'), ' a été refusée.'),
                    'annulation', NEW.id, 'reservation');
        END IF;
    END IF;
END //

DELIMITER ;

-- =====================================================
-- INDEX ADDITIONNELS POUR PERFORMANCE
-- =====================================================

CREATE INDEX idx_reservations_composite ON reservations(coach_id, status, session_date);
CREATE INDEX idx_availabilities_composite ON availabilities(coach_id, available_date, is_booked);
CREATE INDEX idx_reviews_coach_visible ON reviews(coach_id, is_visible, rating);

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
