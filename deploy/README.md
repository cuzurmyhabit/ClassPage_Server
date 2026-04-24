# Docker 한 방 배포 (Oracle Cloud / 자체 VPS)

Nest + **PostgreSQL** + React 정적 파일을 **한 대의 Linux**에서 `docker compose`로 묶습니다. 브라우저는 **한 주소**(예: `http://공인IP`)만 쓰고 API는 같은 호스트의 **`/api`**로 갑니다.

## 전제

같은 부모 폴더에 저장소 두 개가 있어야 합니다. **폴더 이름**:

```text
Parent/
  ClassPage_Server/
  ClassPage_Client/
```

## Oracle Cloud Infrastructure (Always Free ARM 등)

1. 인스턴스 생성 후 **보안 목록**에서 인바운드 TCP **80**(또는 `HTTP_PORT`) 허용.
2. Docker 설치.
3. 저장소 클론:

   ```bash
   cd ~
   git clone <ClassPage_Server URL> ClassPage_Server
   git clone <ClassPage_Client URL> ClassPage_Client
   ```

4. 환경 파일:

   ```bash
   cd ~/ClassPage_Server
   cp deploy/stack.env.example deploy/stack.env
   nano deploy/stack.env
   ```

   `JWT_SECRET`, `NEIS_API_KEY`, **`POSTGRES_PASSWORD`**(DB·API 공통) 등을 채웁니다.

5. 기동 (`deploy/stack.env` 에 `JWT_SECRET`·`POSTGRES_PASSWORD` 필수):

   ```bash
   cd ~/ClassPage_Server
   docker compose -f docker-compose.stack.yml --env-file deploy/stack.env up -d --build
   ```

6. 브라우저: `http://<공인 IP>/`

7. 최초 관리자 (사용자 0명일 때만):

   ```bash
   curl -s -X POST "http://<공인 IP>/api/auth/bootstrap-admin" \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"바꿀비밀번호","name":"관리자"}'
   ```

8. 데모 계정: `database/README.md` 의 `npm run seed:demo` (로컬에서 `DATABASE_URL` 또는 SSH 터널로 DB 접속 후).

## 로컬 개발

- `API_PREFIX` 없으면 `http://localhost:3000/auth/...` 경로.
- Docker 스택 빌드 시 클라이언트는 `VITE_API_URL=/api`.

## Render / Neon

관리형 Postgres + API만 클라우드에 올리려면 `deploy/RENDER.md` 와 `render.yaml` 을 사용하세요.
