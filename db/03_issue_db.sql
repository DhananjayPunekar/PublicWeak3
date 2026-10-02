-- =====================================================================
-- Issue Tracking System - Issue Service database
-- Owner service : issue-service
-- Database      : issue_db
--
-- Re-runnable: drops and recreates the tables, then loads sample data.
-- Run with:  mysql -u root -p < db/03_issue_db.sql
--
-- Note: project, assignee and created_by hold IDs that live in other
-- services' databases (project_db.projects, user_db.users). They are NOT
-- database-level foreign keys; issue-service validates them by calling
-- project-service and user-service before saving.
-- comments.issue_id IS a real foreign key, because both tables live here.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS issue_db;
USE issue_db;

DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS issues;

CREATE TABLE issues (
    id            INT          NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for the issue',
    summary       VARCHAR(255) NOT NULL                COMMENT 'Brief summary of the issue',
    type          ENUM('BUG', 'FEATURE', 'TASK') NOT NULL DEFAULT 'TASK' COMMENT 'Kind of issue',
    project       INT          NOT NULL                COMMENT 'Project ID (project_db.projects.id)',
    description   TEXT         NOT NULL                COMMENT 'Detailed description of the issue',
    priority      ENUM('HIGH', 'MEDIUM', 'LOW') NOT NULL COMMENT 'Priority level of the issue',
    assignee      INT          NOT NULL                COMMENT 'User ID of the assignee (user_db.users.user_id)',
    created_by    INT          NULL                    COMMENT 'User ID of the creator (user_db.users.user_id)',
    tags          VARCHAR(255) NULL                    COMMENT 'Comma-separated tags',
    sprint        VARCHAR(255) NULL                    COMMENT 'Sprint the issue belongs to',
    story_point   INT          NULL                    COMMENT 'Estimated story points',
    status        ENUM('TO DO', 'DEVELOPMENT', 'TESTING', 'COMPLETED') NOT NULL DEFAULT 'TO DO' COMMENT 'Current status of the issue',
    created_on    DATE         NOT NULL                COMMENT 'Date when the issue was created',
    last_updated  DATE         NOT NULL                COMMENT 'Date when the issue was last updated',
    comments      TEXT         NULL                    COMMENT 'Additional comments on the issue',
    PRIMARY KEY (id),
    INDEX idx_issues_project  (project),
    INDEX idx_issues_assignee (assignee),
    INDEX idx_issues_status   (status)
) ENGINE = InnoDB;

CREATE TABLE comments (
    comment_id    INT      NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for comment',
    issue_id      INT      NOT NULL                COMMENT 'ID of the issue commented on',
    text          TEXT     NOT NULL                COMMENT 'Text of the comment',
    created_date  DATE     NOT NULL                COMMENT 'Date the comment was created',
    last_updated  DATE     NOT NULL                COMMENT 'Date the comment was last updated',
    PRIMARY KEY (comment_id),
    CONSTRAINT fk_comments_issue FOREIGN KEY (issue_id)
        REFERENCES issues (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Sample data (from "References - Endpoints and DB.xlsx").
-- created_by is not in the sample sheet, so it is left NULL.
-- NOTE: issue 207 is assigned to user 10, who does not exist in the
-- sample users (1-9). It is kept exactly as given; the API's validation
-- will reject an assignee like this when issues are created or updated.
-- ---------------------------------------------------------------------
INSERT INTO issues
 (id, summary, type, project, description, priority, assignee, tags, sprint, story_point, status, created_on, last_updated) VALUES
 (201, 'Login Feature',       'BUG',     101, 'Implement login',          'HIGH',   2,  'Authentication',  'Sprint 1', 5,  'TO DO',       '2023-01-10', '2023-01-15'),
 (202, 'Payment Module',      'BUG',     101, 'Setup payment gateway',    'MEDIUM', 3,  'Payment',         'Sprint 2', 8,  'TESTING',     '2023-01-12', '2023-02-01'),
 (203, 'Dashboard View',      'FEATURE', 102, 'Fix dashboard refresh',    'LOW',    2,  'UI/UX',           'Sprint 3', 3,  'DEVELOPMENT', '2023-02-20', '2023-02-25'),
 (204, 'User Management',     'FEATURE', 103, 'Expand user management',   'HIGH',   5,  'User Management', 'Sprint 4', 13, 'COMPLETED',   '2023-03-01', '2023-04-15'),
 (205, 'Notification System', 'FEATURE', 104, 'Implement notifications',  'MEDIUM', 6,  'Notifications',   'Sprint 5', 8,  'TESTING',     '2023-05-05', '2023-06-01'),
 (206, 'Export Data Feature', 'FEATURE', 105, 'Address export issues',    'HIGH',   8,  'Data Export',     'Sprint 6', 5,  'TO DO',       '2023-07-20', '2023-07-22'),
 (207, 'Analytics Module',    'TASK',    101, 'Build analytics module',   'LOW',    10, 'Analytics',       'Sprint 7', 13, 'DEVELOPMENT', '2023-01-25', '2023-03-10'),
 (208, 'Mobile Interface',    'TASK',    102, 'Improve mobile interface', 'MEDIUM', 5,  'Mobile',          'Sprint 8', 8,  'COMPLETED',   '2023-02-28', '2023-03-25'),
 (209, 'API Development',     'TASK',    103, 'Develop new APIs',         'HIGH',   6,  'API',             'Sprint 9', 13, 'DEVELOPMENT', '2023-03-15', '2023-04-10');

-- Continue auto-numbering after the sample rows.
ALTER TABLE issues AUTO_INCREMENT = 210;
