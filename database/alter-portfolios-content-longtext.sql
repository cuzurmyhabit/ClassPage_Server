-- 기존 DB에 적용: portfolios.content 을 LONGTEXT 로 확장 (PDF data URL 저장용)
ALTER TABLE portfolios
  MODIFY COLUMN content LONGTEXT NOT NULL;
