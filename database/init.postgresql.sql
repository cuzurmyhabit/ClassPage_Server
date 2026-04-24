-- PostgreSQL (Docker entrypoint는 이미 POSTGRES_DB 로 DB가 생성된 뒤 이 스크립트를 실행함)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_creator
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);

CREATE TABLE IF NOT EXISTS employment_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  company VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  url VARCHAR(500) NOT NULL DEFAULT '',
  created_by INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_employment_creator
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS portfolios (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  link VARCHAR(500) NOT NULL DEFAULT '',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_portfolios_student
    FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_portfolios_student ON portfolios(student_id);

CREATE TABLE IF NOT EXISTS rules (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_rules_position ON rules(position);

CREATE TABLE IF NOT EXISTS penalties (
  id SERIAL PRIMARY KEY,
  student_name VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  week_start DATE NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_by INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_penalties_creator
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_penalties_week_start ON penalties(week_start);
CREATE INDEX IF NOT EXISTS idx_penalties_start_date ON penalties(start_date);

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_announcements_creator
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  due_at TIMESTAMP NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_assignments_creator
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_assignments_due_at ON assignments(due_at);

CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meal_cache (
  meal_date DATE PRIMARY KEY,
  content TEXT NOT NULL,
  fetched_at TIMESTAMP NOT NULL
);

INSERT INTO settings (setting_key, value) VALUES
  ('school_name', '학급 운영 홈'),
  ('class_name', '3학년 1반'),
  ('office_code', 'B10'),
  ('office_name', '서울특별시교육청'),
  ('school_code', '7011569'),
  ('school_display_name', ''),
  ('schedule_source', 'pdf'),
  ('employment_manager_user_id', '')
ON CONFLICT (setting_key) DO UPDATE SET value = EXCLUDED.value;

-- 기본 학급 계정 (공통 비밀번호: 1234)
-- password_hash = bcrypt("1234", 10)
INSERT INTO users (username, password_hash, name, role) VALUES
  ('3200', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '임진하', 'teacher'),
  ('3201', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '곽자경', 'student'),
  ('3202', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '김효일', 'student'),
  ('3203', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '박진우', 'student'),
  ('3204', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '박태윤', 'student'),
  ('3205', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '송민채', 'student'),
  ('3206', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '우지영', 'student'),
  ('3207', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '육준성', 'student'),
  ('3208', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '윤성연', 'student'),
  ('3209', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '윤시웅', 'student'),
  ('3210', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '이상희', 'student'),
  ('3211', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '임소영', 'student'),
  ('3212', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '임지유', 'student'),
  ('3213', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '임하정', 'student'),
  ('3214', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '장세은', 'student'),
  ('3215', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '정다운', 'student'),
  ('3216', '$2b$10$g6P7h8lrkwfQ2CNfoph8V.RfsiwXontSNmlwvPFpXx1m6sM2jMw5O', '지수민', 'career')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

UPDATE settings
SET value = (
  SELECT CAST(id AS TEXT)
  FROM users
  WHERE username = '3216'
)
WHERE setting_key = 'employment_manager_user_id';
