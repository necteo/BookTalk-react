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

| 기능             | 설명                                             |
| ---------------- | ------------------------------------------------ |
| 도서 목록 / 상세 | 도서 조회, 페이지네이션, 상세 정보               |
| 리뷰             | 로그인 사용자 리뷰 작성 / 수정 / 삭제            |
| 소셜 로그인      | Google, Kakao, Naver OAuth2 (HttpOnly 쿠키 기반) |
| AI 챗봇          | Gemini 기반 챗봇                                 |
| 게시판           | Express 서버 기반 커뮤니티 게시판 (CRUD)         |
| 뉴스 / 유튜브    | 키워드 기반 뉴스·유튜브 영상 검색                |

---

## 주요 구현 포인트

### 전역 인증 상태 — AuthContext

JWT를 HttpOnly 쿠키로 관리하므로 JS에서 토큰을 직접 읽을 수 없습니다.
대신 앱 초기 진입 시 `/api/member/me`를 호출해 로그인 상태를 확인합니다.
`200 OK`이면 회원 정보를 전역 상태로 저장하고, `401`이면 Axios 인터셉터가
자동으로 토큰을 재발급(refresh)한 뒤 재시도합니다. refresh까지 실패하면 비로그인으로 처리합니다.

```typescript
const fetchMember = async () => {
  try {
    // 401이면 인터셉터가 refresh 후 재시도 → 성공 시 회원 정보, 실패 시 catch
    const { data } = await apiClient.get('/api/member/me');
    setMember(data);
  } catch {
    setMember(null);
  }
};
```

### 토큰 자동 재발급 — Axios 인터셉터

응답이 `401`이면 `/api/auth/refresh`로 Access Token을 재발급하고 원래 요청을 재시도합니다.
refresh 요청 자체는 재시도 대상에서 제외해 무한 루프를 방지하고,
refresh가 실패하면(7일 만료 등) `/login`으로 이동합니다(단 `/api/member/me`는 비로그인 처리).
Access Token(15분)이 만료돼도 Refresh Token(7일)이 유효하면 로그인이 유지됩니다.

### Axios 인스턴스 분리

Spring Boot API용 `apiClient`와 Express API용 `boardClient`를 분리해 관리합니다.
`withCredentials: true`를 설정해 쿠키 기반 인증이 크로스 오리진에서도 동작하도록 했습니다.

### 외부 API 프록시

네이버 뉴스·YouTube 검색은 Express 서버를 거쳐 호출합니다. 외부 API 키는 서버
환경변수(`.env`)에만 두고, 프론트는 `boardClient`로 우리 서버만 호출해 키가
클라이언트에 노출되지 않습니다.

---

## 프로젝트 구조

```
src/
├── components/
│   ├── auth/       # AuthContext — 전역 인증 상태
│   ├── book/       # 도서 목록 / 상세 / 리뷰
│   ├── board/      # 커뮤니티 게시판
│   ├── chat/       # AI 챗봇
│   ├── layout/     # Header, Footer, Home
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
