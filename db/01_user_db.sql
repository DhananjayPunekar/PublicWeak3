-- =====================================================================
-- Issue Tracking System - User Service database
-- Owner service : user-service
-- Database      : user_db
--
-- Re-runnable: drops and recreates the table, then loads sample data.
-- Run with:  mysql -u root -p < db/01_user_db.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS user_db;
USE user_db;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id   INT          NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the user',
    name      VARCHAR(255) NOT NULL                COMMENT 'Name of the user',
    email     VARCHAR(255) NOT NULL                COMMENT 'Email address, used to log in',
    password  VARCHAR(255) NOT NULL                COMMENT 'BCrypt-encrypted password',
    role      ENUM('productOwner', 'assignee') NOT NULL COMMENT 'Role of the user within the system',
    profile   VARCHAR(255) NULL                    COMMENT 'Profile image URL/path (optional)',
    PRIMARY KEY (user_id),
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Sample data (from "References - Endpoints and DB.xlsx").
-- Passwords are stored as BCrypt hashes, never as plain text.
-- The plain-text sample password is shown in the comment on each row
-- so the accounts can be used to test login.
-- ---------------------------------------------------------------------
INSERT INTO users (user_id, name, email, password, role, profile) VALUES
 (1, 'Alice Smith', 'alice.smith@example.com', '$2a$10$XBFXPCLW3DAXoNSqWb1ajOmIgBeLUP6tfdcYoVb7cRX2wo2jUuXC.', 'productOwner', NULL), -- abc123
 (2, 'Bob Johnson', 'bob.johnson@example.com', '$2a$10$WTCC26eyR5VswYf05u4HCeTZGVLENaQy.l13CWCFBW67DtwFzBa/C', 'assignee',     NULL), -- def456
 (3, 'Carol Lee',   'carol.lee@example.com',   '$2a$10$GhGRlylpmnZCojiwBZlm1uOl4OvXm6kQIqL/W5WZz2ALHkxTVSziW', 'assignee',     NULL), -- ghi789
 (4, 'Dave White',  'dave.white@example.com',  '$2a$10$9EkUz8CyLg4hDHkjJ/BB2u7K3DAYHOmk8YDCCauwAeU3N7TGLCeqy', 'productOwner', NULL), -- jkl012
 (5, 'Eva Black',   'eva.black@example.com',   '$2a$10$NWa5pTXCcEUcrtQVEVCma.ygYsIU/acNmO3PVnBj5oQ.7OK7j6I0K', 'assignee',     NULL), -- mno345
 (6, 'Grace Hall',  'grace.hall@example.com',  '$2a$10$BQ.5buXqvGx2Na.4tQzCG.m8u6gwkG3urBsjADuS1rZdgbeJit3Fe', 'productOwner', NULL), -- stu901
 (7, 'Henry Adams', 'henry.adams@example.com', '$2a$10$4EtlUI/Zx2NT/smY8JHoIuFeXv2hSEbWSHMtI55qjFMfcCq52Iapa', 'assignee',     NULL), -- vwx234
 (8, 'Isla Fisher', 'isla.fisher@example.com', '$2a$10$0djCvfEKZadqd4C4cImgSu0vmxgg2AggnRfUuCMM0.WA7FQxUS2Vq', 'productOwner', NULL), -- yza567
 (9, 'Jake Knox',   'jake.knox@example.com',   '$2a$10$4K0CXy1FkP7KeiIC.SW1QuP2/pSRMpukuA4IEMdRTqzDy4Fp394B.', 'assignee',     NULL); -- bcd890

-- Continue auto-numbering after the sample rows.
ALTER TABLE users AUTO_INCREMENT = 10;
