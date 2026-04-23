CREATE DATABASE IF NOT EXISTS classpage
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE classpage;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  created_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_creator
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX idx_events_date ON events(event_date);

CREATE TABLE IF NOT EXISTS employment_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  company VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  url VARCHAR(500) NOT NULL DEFAULT '',
  created_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_employment_creator
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS portfolios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  link VARCHAR(500) NOT NULL DEFAULT '',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_portfolios_student
    FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_portfolios_student ON portfolios(student_id);

CREATE TABLE IF NOT EXISTS rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_rules_position ON rules(position);

CREATE TABLE IF NOT EXISTS penalties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_name VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  week_start DATE NOT NULL,
  created_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_penalties_creator
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX idx_penalties_week_start ON penalties(week_start);

CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_announcements_creator
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  due_at DATETIME NULL,
  created_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_assignments_creator
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX idx_assignments_due_at ON assignments(due_at);

CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meal_cache (
  meal_date DATE PRIMARY KEY,
  content TEXT NOT NULL,
  fetched_at DATETIME NOT NULL
);

INSERT INTO settings (`key`, value) VALUES
  ('school_name', '학급 운영 홈'),
  ('class_name', '3학년 1반'),
  ('office_code', 'B10'),
  ('office_name', '서울특별시교육청'),
  ('school_code', '7011569'),
  ('school_display_name', ''),
  ('schedule_source', 'pdf'),
  ('employment_manager_user_id', '')
ON DUPLICATE KEY UPDATE value = VALUES(value);
