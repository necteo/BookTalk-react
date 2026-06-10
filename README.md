# BookTalk — Frontend

도서 소셜 플랫폼 BookTalk의 프론트엔드 + 게시판 Express 서버입니다.

> Backend 레포: [BookTalk-spring](https://github.com/necteo/BookTalk-spring)

## 기술 스택

### Frontend
- React 19, TypeScript
- Tanstack Query (React Query), Axios
- React Router DOM

### Sub Server (게시판)
- Node.js, Express, TypeScript
- MySQL

---

## 주요 기능

| 기능 | 설명 |
|---|---|
| 도서 목록 / 상세 | 도서 조회, 페이지네이션, 상세 정보 |
| 리뷰 | 로그인 사용자 리뷰 작성 / 수정 / 삭제 |
| 소셜 로그인 | Google, Kakao, Naver OAuth2 (HttpOnly 쿠키 기반) |
| AI 챗봇 | Gemini 기반 챗봇 — SSE 스트리밍 타이핑 효과 |
| 게시판 | Express 서버 기반 커뮤니티 게시판 (CRUD) |
| 뉴스 / 유튜브 | 키워드 기반 뉴스 및 유튜브 영상 검색 |

---

## 주요 구현 포인트

### 전역 인증 상태 — AuthContext
JWT를 HttpOnly 쿠키로 관리하므로 JS에서 토큰을 직접 읽을 수 없습니다.
대신 앱 초기 진입 시 `/api/member/me`를 호출해 로그인 상태를 확인하고,
응답이 `204 No Content`이면 비로그인, `200 OK`이면 회원 정보를 전역 상태로 저장합니다.

```typescript
const fetchMember = async () => {
  const { status, data } = await apiClient.get('/api/member/me');
  setMember(status === 204 ? null : data);
};
```

### AI 챗봇 — SSE 스트리밍
Spring Boot에서 `Flux<String>`으로 전송하는 SSE를 `fetch` + `ReadableStream`으로 수신합니다.
스트리밍 수신 중에는 DOM에 직접 타이핑 효과를 적용하고, 완료 후 React state에 반영해
불필요한 리렌더링을 방지했습니다.

### Axios 인스턴스 분리
Spring Boot API용 `apiClient`와 Express API용 `boardClient`를 분리해 관리합니다.
`credentials: 'include'`를 설정해 쿠키 기반 인증이 크로스 오리진에서도 동작하도록 했습니다.

---

## 프로젝트 구조

```
src/
├── components/
│   ├── auth/       # AuthContext — 전역 인증 상태
│   ├── book/       # 도서 목록 / 상세 / 리뷰
│   ├── board/      # 커뮤니티 게시판
│   ├── chat/       # AI 챗봇 (SSE 스트리밍)
│   ├── layout/     # Header, Home
│   ├── news/       # 뉴스 검색
│   └── youtube/    # 유튜브 검색
├── commons/        # 공통 타입, 페이지네이션
├── http-commons.ts # Axios 인스턴스 (Spring Boot)
└── board-commons.ts# Axios 인스턴스 (Express)

board-server.ts     # Express 게시판 서버 (포트 3355)
```

---

## 실행 방법

```bash
# 의존성 설치
npm install

# React 개발 서버 (포트 3000)
npm start

# Express 게시판 서버 (포트 3355)
npm run dev
```
