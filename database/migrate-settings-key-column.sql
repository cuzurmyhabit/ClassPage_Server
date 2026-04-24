-- 이미 예전 스키마("key" 컬럼)로 만들어진 PostgreSQL DB만 한 번 실행
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'settings' AND column_name = 'key'
  ) THEN
    ALTER TABLE settings RENAME COLUMN "key" TO setting_key;
  END IF;
END $$;
