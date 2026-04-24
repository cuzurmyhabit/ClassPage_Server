# Render.com 배포 (PostgreSQL + Nest API)

저장소 **ClassPage_Server** 루트에 `render.yaml` 이 있으면 Blueprint 로 한 번에 연결할 수 있습니다.

## 준비

1. [Render](https://render.com) 가입 후 GitHub 연결.
2. 이 서버 저장소를 Import (Root: 저장소 루트).

## Blueprint (`render.yaml`)

1. Render 대시보드 → **New** → **Blueprint**.
2. 저장소·브랜치 선택 후 `render.yaml` 이 인식되면 **PostgreSQL** 과 **Web Service** 가 함께 생성됩니다.
3. Web Service **Environment** 에서 다음을 추가(또는 Blueprint에 없으면 수동):

   - `JWT_SECRET` — 긴 랜덤 문자열
   - `NEIS_API_KEY`, `NEIS_OFFICE_CODE`, `NEIS_SCHOOL_CODE` — 급식용
   - `CORS_ORIGIN` — 프론트 주소 (Vercel이면 `https://xxx.vercel.app` , 쉼표로 여러 개)

`DATABASE_URL` 은 Render가 Postgres에 자동 연결해 주며, `DB_SSL` 은 `render.yaml` 에 `true` 로 넣어 두었습니다.

## 배포 후

- API 기본 URL: `https://<render-서비스명>.onrender.com`
- 헬스체크: `GET https://.../health` → `ok`
- 관리자 부트스트랩: `POST https://.../auth/bootstrap-admin` (사용자 0명일 때만)

## Vercel 프론트와 연결

1. Vercel 프로젝트 **Environment Variables**: `VITE_API_URL` = 위 Render API URL (끝 `/` 없이).
2. Redeploy.
3. 서버 `CORS_ORIGIN` 에 Vercel 도메인 포함.

## Docker 스택과 동시에 쓰지 않기

- **VM Docker 스택**: 웹+API+DB 한 주소.
- **Render+Vercel**: API(Render) + 정적(Vercel) — 둘 중 하나만 쓰는 편이 설정이 단순합니다.
