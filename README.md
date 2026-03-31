# Community Board

일반적인 공개형 커뮤니티 게시판을 목표로 만든 Next.js 웹앱입니다.

## 포함 기능

- 비회원 게시글 목록/상세 열람
- 회원가입, 로그인, 로그아웃
- 게시글 작성, 수정, 삭제
- 댓글, 대댓글 작성 및 삭제
- 댓글 수정 전용 화면
- 작성자 본인만 글/댓글 수정 및 삭제 가능
- 제목 검색, 10개 단위 페이지네이션

## 기술 스택

- Next.js App Router
- TypeScript
- Prisma + SQLite
- Tailwind CSS v4
- Vitest

## 실행 방법

```bash
npm install
npx prisma migrate dev
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

## 검증 명령어

```bash
npm test
npm run lint
npm run build
```

## 주요 경로

- `/` 게시글 목록
- `/login` 로그인
- `/register` 회원가입
- `/write` 게시글 작성
- `/posts/[id]` 게시글 상세
- `/posts/[id]/edit` 게시글 수정

## 데이터 파일

- Prisma 스키마: `prisma/schema.prisma`
- SQLite DB: `dev.db`
