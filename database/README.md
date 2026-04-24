# ClassPage DB 구축 가이드 (PostgreSQL)

## 0) Oracle / VPS — 웹 + API + DB 한 번에

`deploy/README.md` 와 루트의 `docker-compose.stack.yml` 참고.

## 1) 로컬 DB 실행

`ClassPage_Server` 경로에서:

```bash
docker compose up -d
```

- PostgreSQL 16 컨테이너가 뜹니다 (포트 **5432**).
- 최초 실행 시 `database/init.postgresql.sql`이 적용되어 테이블·기본 설정이 생성됩니다.

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
