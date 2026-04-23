# ClassPage DB 구축 가이드

## 1) DB 실행

`ClassPage_Server` 경로에서 아래 명령 실행:

```bash
docker compose up -d
```

- MySQL 8.4 컨테이너가 실행됩니다.
- 최초 실행 시 `database/init.sql`이 자동 적용되어 테이블/기본 설정이 생성됩니다.

## 2) 애플리케이션 .env 설정

`.env`에 아래 값을 채워 주세요.

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=classpage
DB_PASSWORD=classpage1234
DB_DATABASE=classpage
DB_SYNC=false
```

## 3) 최초 관리자 계정 생성

DB가 비어 있는 상태에서 1회만 아래 API를 호출하면 관리자 계정이 생성됩니다.

- `POST /auth/bootstrap-admin`
- body 예시:

```json
{
  "username": "admin",
  "password": "admin1234",
  "name": "담임선생님"
}
```

이미 사용자가 1명이라도 있으면 이 API는 차단됩니다.

## 4) 취업정보 담당자 지정

관리자 화면 설정 값 `employment_manager_user_id`에 사용자 ID를 넣으면,

- 관리자(`admin`) / 교사(`teacher`) / 지정 1인만
- 취업정보 등록/삭제를 할 수 있습니다.
 ㅂ