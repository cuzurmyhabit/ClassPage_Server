
<h1 align="center">3학년 2반 학급 관리 서비스</h1>

<p align="center">
  학급 운영 서비스의 백엔드 API (NestJS + PostgreSQL)
</p>

<p align="center">
  <a href="#-왜-만들었나요">제작 동기</a> ·
  <a href="#-설치--실행">설치/실행</a> ·
  <a href="#-어떻게-동작하나요">동작 원리</a> ·
  <a href="#-운영-옵션">운영 옵션</a>
</p>

---

## 왜 만들었나요?

이 서비스는 반 운영에서 자주 쓰는 기능(일정, 급식, 패널티, 공지, 취업정보, 포트폴리오)을  
여러 도구로 흩어 쓰지 않고 **하나의 서비스로 통합**하려고 만들었습니다.

서버는 다음 기능을 제공합니다 :

- 로그인/권한 관리
- 데이터 저장/조회
- 외부 연동(NEIS 급식)
- 운영 환경에서 안정적으로 구동되는 API 제공

---

## 🚀 설치 / 실행

### 로컬 개발

```bash
npm ci
npm run start:dev
```

기본 API 예시:

- `http://localhost:3000/auth/login`

프로덕션 빌드:

```bash
npm run build
npm run start
```

### Docker 스택 실행 (VPS/EC2)

`ClassPage_Server`와 `ClassPage_Client`가 같은 부모 폴더에 있어야 합니다.

```text
Parent/
  ClassPage_Server/
  ClassPage_Client/
```

환경 파일 준비:

```bash
cd ClassPage_Server
cp deploy/stack.env.example deploy/stack.env
```

컨테이너 실행:

```bash
docker compose -f docker-compose.stack.yml --env-file deploy/stack.env up -d --build
```

상태 확인:

```bash
docker compose -f docker-compose.stack.yml --env-file deploy/stack.env ps
```

---

## 🔍 어떻게 동작하나요?

```text
Client 요청 → JWT 인증/권한 체크 → Service 로직 처리 → PostgreSQL 저장/조회 → 응답
```

1. `auth` 모듈이 로그인/토큰 발급을 처리합니다.
2. `roles guard`로 역할별 접근 권한을 제어합니다.
3. 각 도메인 모듈(`events`, `meals`, `penalties`, `announcements` 등)이 비즈니스 로직을 담당합니다.
4. TypeORM이 PostgreSQL과 통신합니다.
5. 급식은 NEIS API를 조회하고 캐시 테이블(`meal_cache`)에 저장합니다.

### 최초 로그인 비밀번호 변경

- 기본 비밀번호(`1234`) 로그인 시 `must_change_password=true` 계정은 토큰을 즉시 발급하지 않습니다.
- 클라이언트에서 비밀번호 변경 API를 호출한 뒤, 변경 완료 시 토큰 발급/로그인됩니다.
- 이후부터는 변경한 비밀번호로 로그인합니다.

---

## 🎛️ 운영 옵션

| 옵션 | 설명 |
|------|------|
| `POSTGRES_PASSWORD` | DB 비밀번호 (API와 DB에서 동일하게 사용) |
| `JWT_SECRET` | JWT 서명 키 |
| `NEIS_API_KEY` | 급식 조회용 NEIS 인증키 |
| `NEIS_OFFICE_CODE` | 교육청 코드 |
| `NEIS_SCHOOL_CODE` | 학교 코드 |
| `HTTP_PORT` | 웹 공개 포트 (기본 80) |

---

## 📁 프로젝트 구조

```text
ClassPage_Server/
├── src/
│   ├── auth/          # 로그인/JWT/최초 비밀번호 변경
│   ├── events/        # 학사 일정
│   ├── meals/         # 급식(NEIS)
│   ├── penalties/     # 패널티
│   ├── announcements/ # 공지
│   └── ...            # 취업, 포트폴리오, 규칙 등
├── database/
│   ├── init.postgresql.sql
│   └── README.md
├── deploy/
│   ├── README.md
│   └── stack.env.example
├── scripts/
│   └── seed-class-users.ts
└── docker-compose.stack.yml
```

---

## 자주 쓰는 명령어

```bash
npm run build
npm run start:dev
npm run seed:demo
npm run seed:class-users
```

---

## 참고 문서

- Docker/VPS 배포: `deploy/README.md`
- DB/시드 설명: `database/README.md`
- Render 설정 예시: `render.yaml`
# ClassPage Server

학급 운영 서비스의 백엔드(NestJS)입니다.  
현재 운영 구성은 `ClassPage_Server` + `ClassPage_Client`를 Docker Compose로 함께 올려, 웹은 `/`, API는 `/api`로 제공하는 방식입니다.

## 주요 기능

- JWT 로그인/권한 관리 (`admin`, `teacher`, `career`, `student`)
- **최초 로그인 비밀번호 변경 강제** (기본 비밀번호 로그인 후 즉시 변경)
- 학사일정 CRUD, 일정 기간(시작일~종료일) 처리
- 급식(NEIS) 연동 및 주간 조회
- 패널티 관리(상태/시작일/만료일)
- 공지사항/취업정보/포트폴리오/학급규칙 API

## 기술 스택

- Node.js + NestJS
- TypeORM
- PostgreSQL
- Docker / Docker Compose

## 폴더 구조 (핵심)

- `src/` : API 소스 코드
- `database/init.postgresql.sql` : 초기 스키마/기본 데이터
- `scripts/seed-class-users.ts` : 학급 계정 시드 스크립트
- `docker-compose.stack.yml` : 운영용 스택(DB+API+WEB+터널)
- `deploy/stack.env` : 운영 환경변수 파일

## 빠른 시작 (로컬 개발)

### 1) 의존성 설치

```bash
npm ci
```

### 2) 개발 서버 실행

```bash
npm run start:dev
```

기본 API 주소 예시:

- `http://localhost:3000/auth/login`

### 3) 프로덕션 빌드 확인

```bash
npm run build
npm run start
```

## Docker 배포 (VPS/EC2)

`ClassPage_Server`와 `ClassPage_Client`가 같은 부모 경로에 있어야 합니다.

```text
Parent/
  ClassPage_Server/
  ClassPage_Client/
```

### 1) 환경변수 준비

```bash
cd ClassPage_Server
cp deploy/stack.env.example deploy/stack.env
```

`deploy/stack.env` 필수값:

- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `NEIS_API_KEY`
- `NEIS_OFFICE_CODE`
- `NEIS_SCHOOL_CODE`

### 2) 컨테이너 기동

```bash
docker compose -f docker-compose.stack.yml --env-file deploy/stack.env up -d --build
```

### 3) 상태 확인

```bash
docker compose -f docker-compose.stack.yml --env-file deploy/stack.env ps
```

## 기본 계정/비밀번호 정책

- 시드 기본 비밀번호: `1234`
- 첫 로그인 시 `must_change_password = true` 계정은
  - 토큰 발급 없이 비밀번호 변경 화면으로 이동
  - 비밀번호 변경 완료 후부터 새 비밀번호로 로그인

## 자주 쓰는 스크립트

```bash
npm run build
npm run start:dev
npm run seed:demo
npm run seed:class-users
```

## 트러블슈팅

- 로그인 실패(기본 비밀번호 미동작)
  - DB 비밀번호 해시/초기화 SQL 확인
  - `users.must_change_password` 플래그 상태 확인
- 컨테이너는 떴는데 화면이 안 열림
  - EC2 보안그룹 인바운드 `80/443` 확인
  - `docker compose ... ps`에서 `web` 서비스 상태 확인
- 급식 미표시
  - `NEIS_API_KEY`, `NEIS_OFFICE_CODE`, `NEIS_SCHOOL_CODE` 확인