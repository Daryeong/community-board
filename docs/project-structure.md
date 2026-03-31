# 커뮤니티 게시판 구조 정리

이 문서는 `community-board` 프로젝트가 어떤 구조로 되어 있는지, 어떤 기능이 어디에 들어있는지 빠르게 이해하기 위한 메모입니다.

## 1. 프로젝트 한 줄 설명

- `Next.js` 기반 공개형 커뮤니티 게시판 웹사이트
- 비회원은 읽기만 가능
- 회원은 글/댓글/대댓글 작성 가능
- 작성자 본인만 수정/삭제 가능

## 2. 기술 스택

- 프레임워크: `Next.js App Router`
- 언어: `TypeScript`
- 데이터베이스: `SQLite`
- ORM: `Prisma`
- 스타일: `Tailwind CSS v4`
- 테스트: `Vitest`

## 3. 폴더 구조

```text
community-board/
├─ docs/
│  └─ project-structure.md
├─ prisma/
│  ├─ migrations/
│  └─ schema.prisma
├─ public/
├─ src/
│  ├─ app/
│  ├─ components/
│  └─ lib/
├─ dev.db
├─ package.json
└─ README.md
```

## 4. 핵심 폴더 설명

### `src/app`

실제 페이지와 서버 액션이 들어 있습니다.

- `src/app/page.tsx`
  - 게시글 목록 화면
  - 제목 검색, 페이지네이션, 글쓰기 버튼
- `src/app/login/page.tsx`
  - 로그인 화면
- `src/app/register/page.tsx`
  - 회원가입 화면
- `src/app/write/page.tsx`
  - 게시글 작성 화면
- `src/app/posts/[id]/page.tsx`
  - 게시글 상세 화면
  - 댓글/대댓글 영역 포함
- `src/app/posts/[id]/edit/page.tsx`
  - 게시글 수정 화면
- `src/app/posts/[id]/comments/[commentId]/edit/page.tsx`
  - 댓글 수정 화면
- `src/app/actions.ts`
  - 회원가입, 로그인, 로그아웃
  - 글 작성/수정/삭제
  - 댓글 작성/수정/삭제

### `src/components`

여러 화면에서 같이 쓰는 UI 조각입니다.

- `src/components/header.tsx`
  - 상단 헤더
  - 로그인 상태에 따라 버튼 다르게 표시
- `src/components/auth-form.tsx`
  - 로그인/회원가입 공통 폼
- `src/components/post-form.tsx`
  - 글 작성/수정 공통 폼
- `src/components/comment-thread.tsx`
  - 댓글/대댓글 출력과 입력 UI
- `src/components/notice.tsx`
  - 안내 문구 박스
- `src/components/submit-button.tsx`
  - 제출 중 상태를 처리하는 버튼

### `src/lib`

비즈니스 로직과 공통 처리 코드입니다.

- `src/lib/board.ts`
  - 입력값 검증 스키마
  - 댓글 트리 구성
  - 권한 확인 보조 함수
  - 페이지네이션 계산
- `src/lib/board-data.ts`
  - DB 기반 게시판 로직
  - 회원가입/로그인 처리
  - 글/댓글 CRUD 처리
- `src/lib/session.ts`
  - 세션 생성/조회/삭제
  - 현재 로그인 사용자 확인
- `src/lib/security.ts`
  - 안전한 리다이렉트 경로 처리
  - 세션 토큰 해시 처리
- `src/lib/db.ts`
  - Prisma 클라이언트 연결
- `src/lib/utils.ts`
  - 날짜 포맷 등 작은 공통 함수

## 5. 데이터 구조

DB 구조는 `prisma/schema.prisma`에 정의되어 있습니다.

- `User`
  - 사용자 정보
  - 아이디, 닉네임, 이메일, 비밀번호 해시
- `Session`
  - 로그인 세션 정보
- `Post`
  - 게시글 정보
  - 제목, 내용, 작성자, 삭제 여부
- `Comment`
  - 댓글/대댓글 정보
  - 부모 댓글 ID로 대댓글 관계 표현

## 6. 현재 구현된 기능

- 회원가입
- 로그인 / 로그아웃
- 게시글 목록 보기
- 게시글 상세 보기
- 게시글 작성 / 수정 / 삭제
- 댓글 작성 / 수정 / 삭제
- 대댓글 작성
- 제목 검색
- 페이지네이션
- 권한 없는 접근 시 안내 문구

## 7. 권한 규칙

- 비회원
  - 글 목록/상세 읽기 가능
  - 작성 기능 불가
- 회원
  - 글/댓글/대댓글 작성 가능
- 작성자 본인
  - 자신의 글/댓글만 수정/삭제 가능

## 8. 디자인 방향

- 익숙한 한국형 커뮤니티 게시판 UX
- 깔끔하고 정돈된 레이아웃
- 목록은 테이블형 중심
- 상세는 문서형 본문 + 댓글 스레드 구조
- 댓글은 블록형, 대댓글은 한 단계 들여쓰기

## 9. 실행 방법

```bash
npx prisma migrate dev
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:3000
```

## 10. 검증 명령어

```bash
npm test
npm run lint
npm run build
```

## 11. 지금 이 문서를 어떻게 활용하면 좋은가

- 프로젝트 구조를 빠르게 이해하는 용도
- 다음 기능을 추가하기 전에 참고하는 용도
- 팀원이나 미래의 나에게 설명하는 용도
- 커밋 전에 현재 상태를 정리하는 기준 문서
