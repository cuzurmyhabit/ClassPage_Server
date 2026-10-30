# Credential configuration

- JWT_SECRET is mandatory in every environment, including local development: at least 32 characters of independently provisioned cryptographically random data (recommended: 64 random hexadecimal characters). Templates are intentionally blank. Published placeholders are rejected. Signing and verification both enforce HS256 and use the same validator. No keys are generated or printed by this repository change.
- Database access requires DATABASE_URL, or DB_PASSWORD with DB_HOST / DB_PORT / DB_USERNAME / DB_DATABASE. The latter connection fields retain local non-secret defaults; DB_PASSWORD has no source fallback. Local Docker also requires DB_PASSWORD explicitly.
- Production stack requires POSTGRES_PASSWORD and JWT_SECRET in ignored deploy/stack.env. POSTGRES_PASSWORD is passed to both PostgreSQL and the API DB_PASSWORD. Set NODE_ENV=production. Render requires JWT_SECRET and its managed DATABASE_URL; no database password fallback is supplied.
- NEIS_API_KEY, NEIS_OFFICE_CODE and NEIS_SCHOOL_CODE are needed for the corresponding school/meal integration, not for JWT startup. Configure CORS_ORIGIN for your deployment.
- Seed commands have no built-in password: explicitly supply DEMO_SEED_PASSWORD or CLASS_USERS_SEED_PASSWORD (12+ characters), plus database credentials. Use a disposable isolated database for demos. Class-user seeding resets existing users' passwords by design; do not run it casually on a live database.
- Initialization SQL no longer provisions accounts with a public shared password/hash. On a new database, initialize the first administrator privately before exposing the API, or explicitly seed users. Existing database users are not changed by editing SQL; existing public/default passwords must be reviewed by the operator.
- Copy .env.example to .env for local use and fill JWT_SECRET and DB_PASSWORD; the latter is shared by local compose and the API. Local examples and demo identifiers are public examples, not evidence of live credential exposure.
- Never commit filled environment files or private-key material. Ignore rules do not untrack already tracked files. node_modules and dist were already tracked: dependencies are retained and security-relevant dist modules are synchronized manually (the checked-in dependency tree lacks the compiler; a full rebuild remains required). A separate repository-hygiene change may untrack generated assets after review.
- This change neither revokes any deployed key nor rewrites Git history. Historical exposure and existing deployment credentials still require an owner-led review; no external validation was performed.

## Local verification limits

The checkout contains an incomplete tracked dependency tree: TypeScript, ts-node and even Nest runtime entrypoints cannot be resolved. No installation was attempted. A full build and application/meal tests are blocked until dependencies are restored. Security-focused dist modules were patched to match source validation and PostgreSQL configuration; modified source maps have empty mappings rather than misleading stale line mappings. Rebuild dist with a trusted complete dependency installation before deployment.

## 배포 산출물 검증
변경 소스 5개는 TypeScript 5.9.3 transpileModule로 JS/source map을 재생성했습니다. 이는 타입 검사나 전체 Nest 빌드가 아닙니다. 의존성 설치 후 전체 빌드를 별도로 수행하세요. 새 dist/config/environment.* 및 dist/typeorm.config.*는 .gitignore 대상이므로 산출물을 계속 커밋한다면 git add -f로 함께 포함해야 합니다.
