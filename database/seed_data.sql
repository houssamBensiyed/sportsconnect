-- =====================================================
-- SPORTSCONNECT - DONNÉES DE TEST COMPLÈTES
-- Exécuter APRÈS sportsconnect.sql
-- =====================================================

USE sportsconnect;

-- =====================================================
-- NOUVEAUX UTILISATEURS (Mot de passe: "password")
-- =====================================================

-- Hash bcrypt pour "password": $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- Plus de coachs
INSERT INTO users (email, password, role, email_verified) VALUES
('coach.lefevre@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coach', TRUE),
('coach.garcia@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coach', TRUE),
('coach.roux@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coach', TRUE),
('coach.morel@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coach', TRUE),
('coach.fournier@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coach', TRUE),
('coach.girard@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coach', TRUE),
('coach.andre@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coach', TRUE),
('coach.mercier@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coach', TRUE);

-- Plus de sportifs
INSERT INTO users (email, password, role, email_verified) VALUES
('sportif.dubois@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sportif', TRUE),
('sportif.thomas@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sportif', TRUE),
('sportif.richard@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sportif', TRUE),
('sportif.durand@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sportif', TRUE),
('sportif.lambert@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sportif', TRUE),
('sportif.bonnet@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sportif', TRUE),
('sportif.francois@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sportif', TRUE),
('sportif.martinez@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sportif', TRUE);

-- =====================================================
-- PROFILS COACHS
-- =====================================================
INSERT INTO coaches (user_id, first_name, last_name, phone, bio, years_experience, city, hourly_rate) VALUES
(11, 'Alexandre', 'Lefevre', '0611111111', 'Ancien joueur professionnel de basketball. J''accompagne les jeunes talents vers l''excellence. Méthode intensive et résultats garantis.', 14, 'Nice', 65.00),
(12, 'Camille', 'Garcia', '0622222222', 'Spécialiste en tennis et squash. J''ai formé plusieurs champions régionaux. Ma devise: la technique avant tout!', 9, 'Strasbourg', 55.00),
(13, 'Julien', 'Roux', '0633333333', 'Coach MMA certifié. Combattant professionnel pendant 8 ans. J''enseigne la discipline, le respect et la maîtrise de soi.', 11, 'Lille', 70.00),
(14, 'Claire', 'Morel', '0644444444', 'Professeure de yoga et méditation. Formée en Inde pendant 2 ans. Séances relaxantes et énergisantes adaptées à tous.', 7, 'Nantes', 45.00),
(15, 'Maxime', 'Fournier', '0655555555', 'Préparateur physique et nutritionniste. J''accompagne les sportifs de haut niveau dans leur préparation complète.', 13, 'Montpellier', 75.00),
(16, 'Laura', 'Girard', '0666666666', 'Nageuse olympique. Je transmets ma passion et mes techniques aux nageurs de tous niveaux.', 10, 'Rennes', 60.00),
(17, 'Romain', 'Andre', '0677777777', 'Coach en boxe anglaise et thaïlandaise. Champion de France amateur. Cours dynamiques et efficaces.', 8, 'Toulon', 50.00),
(18, 'Amandine', 'Mercier', '0688888888', 'Spécialiste fitness et body sculpt. Transformez votre corps en 12 semaines avec ma méthode exclusive.', 6, 'Grenoble', 48.00);

-- =====================================================
-- PROFILS SPORTIFS
-- =====================================================
INSERT INTO sportifs (user_id, first_name, last_name, phone, birth_date, city) VALUES
(19, 'Pierre', 'Dubois', '0699999991', '1992-04-18', 'Nice'),
(20, 'Sophie', 'Thomas', '0699999992', '1994-08-25', 'Strasbourg'),
(21, 'Marc', 'Richard', '0699999993', '1989-12-03', 'Lille'),
(22, 'Elise', 'Durand', '0699999994', '1997-06-14', 'Nantes'),
(23, 'François', 'Lambert', '0699999995', '1985-02-28', 'Montpellier'),
(24, 'Marine', 'Bonnet', '0699999996', '1999-09-10', 'Rennes'),
(25, 'Thomas', 'Francois', '0699999997', '1991-11-22', 'Toulon'),
(26, 'Lucie', 'Martinez', '0699999998', '1996-07-07', 'Grenoble');

-- =====================================================
-- ASSOCIATION COACHS-SPORTS
-- =====================================================
INSERT INTO coach_sports (coach_id, sport_id, level) VALUES
-- Alexandre Lefevre
(6, 7, 'expert'),      -- Basketball Expert
(6, 8, 'avance'),      -- Musculation Avancé
(6, 4, 'intermediaire'), -- Athlétisme Intermédiaire
-- Camille Garcia
(7, 2, 'expert'),      -- Tennis Expert
(7, 4, 'avance'),      -- Athlétisme Avancé
-- Julien Roux
(8, 11, 'expert'),     -- MMA Expert
(8, 5, 'expert'),      -- Boxe Expert
(8, 8, 'avance'),      -- Musculation Avancé
-- Claire Morel
(9, 9, 'expert'),      -- Yoga Expert
(9, 8, 'intermediaire'), -- Musculation Intermédiaire
-- Maxime Fournier
(10, 10, 'expert'),    -- CrossFit Expert
(10, 8, 'expert'),     -- Musculation Expert
(10, 4, 'avance'),     -- Athlétisme Avancé
-- Laura Girard
(11, 3, 'expert'),     -- Natation Expert
(11, 9, 'intermediaire'), -- Yoga Intermédiaire
-- Romain Andre
(12, 5, 'expert'),     -- Boxe Expert
(12, 11, 'avance'),    -- MMA Avancé
(12, 8, 'avance'),     -- Musculation Avancé
-- Amandine Mercier
(13, 8, 'expert'),     -- Musculation Expert
(13, 10, 'avance'),    -- CrossFit Avancé
(13, 9, 'intermediaire'); -- Yoga Intermédiaire

-- =====================================================
-- CERTIFICATIONS
-- =====================================================
INSERT INTO certifications (coach_id, name, organization, year_obtained, is_verified) VALUES
(6, 'Diplôme d''entraîneur de Basketball', 'FFBB', 2012, TRUE),
(6, 'Certificat de Préparation Physique', 'INSEP', 2015, TRUE),
(7, 'Brevet d''État Tennis', 'FFT', 2014, TRUE),
(8, 'Certification MMA Pro', 'MMA France', 2016, TRUE),
(8, 'Ceinture noire Muay Thai', 'Fédération Française de Muay Thai', 2013, TRUE),
(9, 'Yoga Sivananda 500h', 'Ashram Inde', 2017, TRUE),
(10, 'CrossFit Level 4', 'CrossFit Inc.', 2018, TRUE),
(10, 'Nutritionniste du sport', 'INSEP', 2016, TRUE),
(11, 'Maître nageur sauveteur', 'FFN', 2013, TRUE),
(12, 'Brevet d''État Boxe', 'FFB', 2015, TRUE),
(13, 'Diplôme Fitness et Musculation', 'AFPA', 2019, TRUE);

-- =====================================================
-- DISPONIBILITÉS (4 prochaines semaines)
-- =====================================================
INSERT INTO availabilities (coach_id, available_date, start_time, end_time, is_booked) VALUES
-- Alexandre Lefevre
(6, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00', '10:00:00', FALSE),
(6, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '11:00:00', FALSE),
(6, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '15:00:00', FALSE),
(6, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00:00', '10:00:00', FALSE),
(6, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '16:00:00', '17:00:00', FALSE),
(6, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00', '11:00:00', FALSE),
(6, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '14:00:00', '15:00:00', FALSE),
-- Camille Garcia
(7, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '09:00:00', FALSE),
(7, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00:00', '12:00:00', FALSE),
(7, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '08:00:00', '09:00:00', FALSE),
(7, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '17:00:00', '18:00:00', FALSE),
(7, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '09:00:00', '10:00:00', FALSE),
(7, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '10:00:00', '11:00:00', FALSE),
-- Julien Roux
(8, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:00:00', '18:00:00', FALSE),
(8, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', '19:00:00', FALSE),
(8, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '17:00:00', '18:00:00', FALSE),
(8, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '18:00:00', '19:00:00', FALSE),
(8, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '19:00:00', '20:00:00', FALSE),
-- Claire Morel
(9, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:00:00', '08:00:00', FALSE),
(9, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '12:00:00', '13:00:00', FALSE),
(9, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '07:00:00', '08:00:00', FALSE),
(9, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:00:00', '20:00:00', FALSE),
(9, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '08:00:00', '09:00:00', FALSE),
(9, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '18:00:00', '19:00:00', FALSE),
-- Maxime Fournier
(10, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '06:00:00', '07:00:00', FALSE),
(10, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:00:00', '08:00:00', FALSE),
(10, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', '19:00:00', FALSE),
(10, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '06:00:00', '07:00:00', FALSE),
(10, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:00:00', '20:00:00', FALSE),
(10, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '06:00:00', '07:00:00', FALSE),
-- Laura Girard
(11, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '09:00:00', FALSE),
(11, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '11:00:00', FALSE),
(11, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00:00', '10:00:00', FALSE),
(11, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '08:00:00', '09:00:00', FALSE),
(11, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '10:00:00', '11:00:00', FALSE),
-- Romain Andre
(12, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:00:00', '18:00:00', FALSE),
(12, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:00:00', '20:00:00', FALSE),
(12, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '18:00:00', '19:00:00', FALSE),
(12, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '17:00:00', '18:00:00', FALSE),
(12, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '18:00:00', '19:00:00', FALSE),
-- Amandine Mercier
(13, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '09:00:00', FALSE),
(13, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '12:00:00', '13:00:00', FALSE),
(13, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', '19:00:00', FALSE),
(13, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00:00', '10:00:00', FALSE),
(13, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '12:00:00', '13:00:00', FALSE),
(13, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '18:00:00', '19:00:00', FALSE);

-- =====================================================
-- RÉSERVATIONS SUPPLÉMENTAIRES
-- =====================================================

-- Note: Utilisez des ID de disponibilités existants après insertion
-- Ces réservations sont des exemples

-- =====================================================
-- AVIS SUPPLÉMENTAIRES
-- =====================================================
-- Ajoutez des reviews après avoir créé des réservations terminées

-- =====================================================
-- FIN DU SCRIPT DE SEED
-- =====================================================

SELECT 'Seed data inserted successfully!' AS message;
SELECT 'Logins: email: coach.XXX@email.com or sportif.XXX@email.com' AS login_hint;
SELECT 'Password: password (for all users)' AS password_hint;
