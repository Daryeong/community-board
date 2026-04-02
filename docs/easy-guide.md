# 이 프로젝트를 쉽게 설명하면

이 프로젝트는 `커뮤니티 게시판` 웹사이트입니다.

쉽게 말하면 아래 기능이 있는 사이트예요.

- 회원가입
- 로그인
- 글 목록 보기
- 글 상세 보기
- 글쓰기
- 글 수정/삭제
- 댓글 쓰기
- 대댓글 쓰기

즉, 우리가 평소에 보는 일반 게시판 사이트를 만드는 프로젝트예요.

---

## 가장 먼저 보면 되는 곳

처음에는 아래 파일 4개만 보면 됩니다.

- `README.md`
  - 프로젝트 소개
- `docs/project-structure.md`
  - 구조 설명
- `docs/easy-guide.md`
  - 지금 읽고 있는 쉬운 설명
- `src/app/page.tsx`
  - 메인 게시글 목록 화면

---

## 폴더를 진짜 쉽게 설명하면

### `src/app`

사용자가 실제로 보는 화면들이 들어 있어요.

- `src/app/page.tsx`
  - 메인 화면
  - 게시글 목록이 보이는 곳
- `src/app/login/page.tsx`
  - 로그인 화면
- `src/app/register/page.tsx`
  - 회원가입 화면
- `src/app/write/page.tsx`
  - 글쓰기 화면
- `src/app/posts/[id]/page.tsx`
  - 글 상세 화면

즉,
`src/app` = 화면 폴더

---

### `src/components`

화면 안에서 여러 번 재사용하는 UI 조각들이 들어 있어요.

예를 들면:

- 헤더
- 로그인 폼
- 글쓰기 폼
- 댓글 영역

즉,
`src/components` = 부품 폴더

---

### `src/lib`

눈에 직접 보이지는 않지만, 뒤에서 실제 일을 처리하는 코드가 들어 있어요.

예를 들면:

- 로그인 검사
- 글 저장
- 댓글 저장
- 권한 검사
- DB 연결

즉,
`src/lib` = 기능 처리 폴더

---

### `prisma`

데이터베이스 구조를 정하는 곳이에요.

- 회원 정보
- 게시글 정보
- 댓글 정보

이런 걸 어떤 형태로 저장할지 적어둔 곳입니다.

즉,
`prisma` = DB 설계 폴더

---

## 진짜 중요한 파일 몇 개만 설명

### `src/app/page.tsx`
- 메인 게시판 목록 화면
- 글 제목들이 보이는 곳

### `src/app/posts/[id]/page.tsx`
- 게시글 상세 화면
- 글 내용, 댓글, 대댓글이 보이는 곳

### `src/app/actions.ts`
- 사용자가 버튼을 눌렀을 때 실제 처리하는 곳
- 예: 로그인, 글쓰기, 댓글쓰기

### `src/lib/board-data.ts`
- 게시판 핵심 로직
- 글/댓글 데이터를 DB에 저장하거나 읽어오는 곳

### `prisma/schema.prisma`
- DB 구조 정의
- 회원, 게시글, 댓글 테이블이 여기 있음

---

## 이 프로젝트를 비유하면

- `src/app` = 화면
- `src/components` = 화면 부품
- `src/lib` = 뒤에서 일하는 기능
- `prisma` = 데이터 저장 구조
- `dev.db` = 실제 데이터 저장 파일

즉,

- 화면은 `src/app`
- 기능은 `src/lib`
- 저장은 `prisma`와 `dev.db`

이렇게 생각하면 됩니다.

---

## 지금 당장 뭘 보면 좋냐

처음 보는 순서 추천:

1. `README.md`
2. `docs/easy-guide.md`
3. `src/app/page.tsx`
4. `src/app/posts/[id]/page.tsx`
5. `src/app/actions.ts`
6. `prisma/schema.prisma`

이 순서로 보면
"화면 -> 동작 -> 데이터 저장"
순서로 이해할 수 있어요.

---

## 한 줄 요약

이 프로젝트는
`일반 게시판 사이트를 만들기 위해 화면, 기능, DB를 나눠서 정리한 Next.js 프로젝트`
입니다.
