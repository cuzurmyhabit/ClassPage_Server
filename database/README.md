# ClassPage DB 구축 가이드 (PostgreSQL)

## 0) Oracle / VPS — 웹 + API + DB 한 번에

`deploy/README.md` 와 루트의 `docker-compose.stack.yml` 참고.

## 1) 로컬 DB 실행

### MySQL 컨테이너만 예전에 쓰던 경우 (로그인·CRUD 전부 실패할 때)

이 레포는 **PostgreSQL만** 지원합니다. 아직 `mysql:8.4` 컨테이너가 떠 있거나 `.env`에 `DB_PORT=3307` 이 남아 있으면 API가 DB에 붙지 않습니다.

1. 예전 DB 컨테이너 중지·삭제: `docker rm -f classpage-db classpage-postgres 2>/dev/null`  
2. 볼륨까지 비우고 다시 올리기(로컬 데이터 초기화):

```bash
cd ClassPage_Server
npm run db:reset
```

3. `.env` 확인: **`DB_PORT=5432`**, `DB_HOST=127.0.0.1`, **`DATABASE_URL` 비우기**(로컬 Docker만 쓸 때).

### 정상 기동

`ClassPage_Server` 경로에서:

```bash
docker compose up -d
```

- PostgreSQL 16 (`container_name`: **classpage-postgres**, 호스트 포트 **5432**).
- 최초(빈 데이터 볼륨)일 때만 `database/init.postgresql.sql`이 적용됩니다.

테이블 확인:

```bash
docker exec -i classpage-postgres psql -U classpage -d classpage -c '\dt'
```

### 예전 PostgreSQL DB에 `settings.key` 컬럼만 남아 있는 경우

```bash
docker exec -i classpage-postgres psql -U classpage -d classpage < database/migrate-settings-key-column.sql
```

## 2) 애플리케이션 .env

`.env.example` 을 참고해 `.env` 를 만듭니다.

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=classpage
DB_PASSWORD=classpage1234
DB_DATABASE=classpage
DB_SYNC=false

NEIS_API_KEY=발급받은_키
NEIS_OFFICE_CODE=B10
NEIS_SCHOOL_CODE=행정표준학교코드
```

**Neon / Render 등**에서 `DATABASE_URL` 한 줄만 주는 경우: `.env`에 `DATABASE_URL`을 넣고, SSL이 필요하면 `DB_SSL=true` (또는 URL에 `neon.tech` / `render.com` 등이 있으면 자동으로 SSL 완화).

## 3) 최초 관리자 계정

DB가 비어 있을 때 한 번만:

- `POST /auth/bootstrap-admin` (로컬) 또는 Docker 스택에서는 `POST /api/auth/bootstrap-admin`
- body 예시:

```json
{
  "username": "admin",
  "password": "admin1234",
  "name": "담임선생님"
}
```

이미 사용자가 있으면 이 API는 차단됩니다.

## 4) 외부 공유용 데모 계정

DB가 떠 있는 상태에서 서버 루트에서:

```bash
npm run seed:demo
```

- 아이디: `student_demo`, `teacher_demo`, `career_demo`
- 기본 비밀번호: `ClassPage2026!` (`.env`에 `DEMO_SEED_PASSWORD` 가능)
- 이미 있는 `username` 은 건너뜀

## 5) 취업정보 담당자

관리자 설정 `employment_manager_user_id`에 사용자 ID를 넣으면, 관리자·교사·지정 1인만 취업정보 등록/삭제가 가능합니다.

## 6) Render / Neon 배포

`deploy/RENDER.md` 와 저장소 루트 `render.yaml` 참고.
