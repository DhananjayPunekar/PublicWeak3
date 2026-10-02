-- =====================================================================
-- Issue Tracking System - Project Service database
-- Owner service : project-service
-- Database      : project_db
--
-- Re-runnable: drops and recreates the table, then loads sample data.
-- Run with:  mysql -u root -p < db/02_project_db.sql
--
-- Note: product_owner holds a user ID from user_db.users. Because every
-- microservice owns a separate database, this is NOT a database-level
-- foreign key; project-service validates the owner by calling
-- user-service (GET /api/users/{userId}) before saving.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS project_db;
USE project_db;

DROP TABLE IF EXISTS projects;

CREATE TABLE projects (
    id             INT          NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the project',
    project_name   VARCHAR(255) NOT NULL                COMMENT 'Name of the project',
    product_owner  INT          NOT NULL                COMMENT 'User ID of the product owner (user_db.users.user_id)',
    start_date     DATE         NOT NULL                COMMENT 'Start date of the project',
    end_date       DATE         NOT NULL                COMMENT 'Expected end date of the project',
    PRIMARY KEY (id),
    CONSTRAINT uk_projects_name UNIQUE (project_name),
    CONSTRAINT chk_projects_dates CHECK (end_date >= start_date),
    INDEX idx_projects_owner (product_owner)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Sample data (from "References - Endpoints and DB.xlsx").
-- ---------------------------------------------------------------------
INSERT INTO projects (id, project_name, product_owner, start_date, end_date) VALUES
 (101, 'Project Alpha',   1, '2023-01-01', '2023-12-31'),
 (102, 'Project Beta',    3, '2023-02-15', '2023-08-30'),
 (103, 'Project Gamma',   4, '2023-03-20', '2023-09-15'),
 (104, 'Project Delta',   2, '2023-05-01', '2024-01-01'),
 (105, 'Project Epsilon', 5, '2023-07-15', '2023-12-20');

-- Continue auto-numbering after the sample rows.
ALTER TABLE projects AUTO_INCREMENT = 106;
