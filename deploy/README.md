# Docker 한 방 배포 (Oracle Cloud / 자체 VPS)

Nest + MySQL + React 정적 파일을 **한 대의 Linux**에서 `docker compose`로 묶은 구성입니다. **코드 변경은 최소**이며, 브라우저는 **한 주소**(예: `http://공인IP`)만 쓰고 API는 같은 호스트의 **`/api`**로 갑니다.

## 전제

같은 부모 폴더에 저장소 두 개가 있어야 합니다. **폴더 이름**은 아래와 같아야 합니다 (`docker/Dockerfile.web`의 `COPY` 경로).

```text
Parent/
  ClassPage_Server/
  ClassPage_Client/
```

## Oracle Cloud Infrastructure (Always Free ARM 등)

1. 인스턴스 생성 후 **보안 목록**에서 인바운드 TCP **80**(또는 `HTTP_PORT`로 연 포트) 허용.
2. 인스턴스에 Docker 설치 ([공식 문서](https://docs.docker.com/engine/install/ubuntu/) 등).
3. 저장소 클론:

   ```bash
   cd ~
   git clone <ClassPage_Server URL> ClassPage_Server
   git clone <ClassPage_Client URL> ClassPage_Client
   ```

4. 환경 파일 (없으면 compose가 실패합니다):

   ```bash
   cd ~/ClassPage_Server
   cp deploy/stack.env.example deploy/stack.env
   nano deploy/stack.env   # JWT_SECRET, NEIS_API_KEY 등
   ```

5. (권장) MySQL 비밀번호를 기본값에서 바꾸려면, 같은 터미널에서 한 번만:

   ```bash
   export MYSQL_ROOT_PASSWORD='강한-루트-비밀번호'
   export MYSQL_PASSWORD='강한-앱-비밀번호'
   ```

   `MYSQL_PASSWORD`는 DB 사용자 `classpage`와 API 컨테이너 둘 다에 쓰입니다.

6. 기동:

   ```bash
   cd ~/ClassPage_Server
   docker compose -f docker-compose.stack.yml --env-file deploy/stack.env up -d --build
   ```

7. 브라우저에서 `http://<공인 IP>/` 접속.

8. **최초 관리자** (DB에 사용자가 한 명도 없을 때만):

   ```bash
   curl -s -X POST "http://<공인 IP>/api/auth/bootstrap-admin" \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"바꿀비밀번호","name":"관리자"}'
   ```

9. 데모 계정은 DB가 준비된 뒤, **로컬 PC에서** 서버의 MySQL에 잠깐 붙거나(보안 그룹 주의), 관리자 화면에서 사용자를 추가하세요. `database/README.md`의 `npm run seed:demo` 참고.

## 로컬 개발

- `API_PREFIX`를 쓰지 않으면 예전처럼 `http://localhost:3000/auth/...` 경로입니다.
- Docker 스택 빌드 시에만 클라이언트에 `VITE_API_URL=/api`가 들어갑니다.

## Fly.io에 대해

Fly.io는 보통 **앱(프로세스) 단위** 배포가 기본이라, 이 저장소의 **MySQL + API + nginx**를 그대로 한 번에 올리는 것은 Oracle 같은 **한 대 VM + Docker Compose**보다 설정이 많습니다. **코드를 거의 안 건드리고** 한 방에 가려면 **OCI Always Free / 저가 VPS + 이 compose**를 권장합니다.
