# Community Board

Next.js 기반으로 만든 커뮤니티 게시판 웹앱입니다. 게시글, 댓글, 신고, 북마크, 알림, 관리자 기능까지 포함한 확장형 게시판 프로젝트입니다.

## 프로젝트 소개

기본적인 게시판 기능에서 시작해 실제 서비스 형태에 가깝게 확장한 커뮤니티 보드입니다. 사용자 인증, 게시글/댓글 관리, 첨부파일 업로드, 태그/카테고리, 알림, 신고/차단, 관리자 페이지까지 한 프로젝트 안에 구성했습니다.

## 주요 기능

- 회원가입, 로그인, 로그아웃, 비밀번호 변경
- 게시글 작성, 수정, 삭제, 검색, 페이지네이션
- 댓글, 대댓글, 댓글 수정/삭제
- 첨부파일 업로드와 게시글 이미지 표시
- 카테고리, 태그, 공지글, 상단 고정 게시글
- 좋아요, 북마크, 북마크 폴더, 최근 글 사이드바
- 알림 확인, 마이페이지, 프로필 이미지 설정
- 신고, 차단, 소프트 삭제, 관리자 통계/관리 기능
- 서버 측 권한 검사, 입력 검증, 업로드 보안 처리

## 기술 스택

- Frontend: Next.js App Router, React, TypeScript
- Styling: Tailwind CSS v4
- Database: Prisma, SQLite, better-sqlite3
- Auth/Security: bcryptjs, jose, zod
- Testing: Vitest, Testing Library

## 실행 방법

```bash
npm install
npx prisma migrate dev
npm run dev
```

실행 후 브라우저에서 `http://localhost:3000`으로 접속하면 됩니다.

## 검증 명령어

```bash
npm test
npm run lint
npm run build
```

## 주요 페이지

- `/` : 게시글 목록
- `/login` : 로그인
- `/register` : 회원가입
- `/write` : 게시글 작성
- `/posts/[id]` : 게시글 상세
- `/posts/[id]/edit` : 게시글 수정
- `/mypage` : 마이페이지
- `/admin` : 관리자 대시보드

## 프로젝트 구조

- `src/app` : 페이지와 라우트 구성
- `src/components` : 재사용 UI 컴포넌트
- `src/lib` : 게시판 핵심 로직, 세션, 권한, 유틸리티
- `prisma/schema.prisma` : 데이터베이스 스키마
- `prisma/migrations` : 마이그레이션 이력
- `public/uploads` : 업로드된 파일 저장 경로

## 향후 개선 아이디어

- 배포 환경 기준 이미지 저장소 분리
- 검색 및 정렬 옵션 고도화
- 관리자 모니터링과 신고 처리 흐름 개선
