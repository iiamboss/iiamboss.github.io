# iamboss.today

개인 사이트. Astro + [AstroPaper](https://github.com/satnaing/astro-paper) 포크로 만들었고,
`master` 에 push 하면 GitHub Actions 가 빌드해서 GitHub Pages 로 배포한다.

## 무엇을 어디서 고치나

| 하고 싶은 것                            | 고칠 파일                                            |
| --------------------------------------- | ---------------------------------------------------- |
| 글 추가                                 | `src/content/posts/` 에 `.md` 새로 추가              |
| 이름·소개 문구(홈 상단)                 | `src/pages/index.astro` 의 `#hero` 블록              |
| 사이트 제목·설명·OG(SEO, 링크 미리보기) | `astro-paper.config.ts` 의 `site`                    |
| 링크(깃허브·메일), 공유 버튼            | `astro-paper.config.ts` 의 `socials` / `shareLinks`  |
| 색·타이포 토큰                          | `src/styles/theme.css`                               |
| 본문 조판(한글 줄바꿈 등)               | `src/styles/korean.css`, `src/styles/typography.css` |
| 상단 메뉴                               | `src/components/Header.astro`                        |
| 마크다운·코드블록·폰트 빌드 설정        | `astro.config.ts`                                    |
| 검색엔진 색인 허용                      | `src/noindex.ts`                                     |

설정이 두 파일로 갈린다. `astro-paper.config.ts` 는 **사이트 내용**(제목, 링크, 기능 on/off),
`astro.config.ts` 는 **빌드 방식**(마크다운 플러그인, Shiki, 폰트, i18n). 내용만 바꿀 거면
앞쪽만 보면 된다. `src/config.ts` 는 기본값을 입혀 정리한 결과물이라 직접 고치지 않는다.

## 글 추가하기

`src/content/posts/` 에 `.md` 파일을 만든다. **파일명이 그대로 주소가 된다.**

```
src/content/posts/order-system.md  →  https://iamboss.today/posts/order-system/
```

front matter:

```yaml
---
title: "글 제목" # 필수
description: "목록 카드와 검색 결과에 보이는 한 줄" # 필수
pubDatetime: 2026-06-22T09:00:00+09:00 # 필수. 타임존까지 적는다
tags: ["TypeScript", "NestJS"] # 생략하면 ["others"]
featured: true # 홈 '대표 글' 섹션에 올린다
draft: true # 빌드에서 제외
modDatetime: 2026-07-01T09:00:00+09:00 # 수정일. 있으면 같이 표시된다
---
```

`author` 는 안 적으면 `astro-paper.config.ts` 의 값이 들어간다. 그 외 `ogImage`,
`canonicalURL`, `timezone` 도 받는다 — 스키마는 `src/content.config.ts` 가 전부다.

정렬은 `pubDatetime` 내림차순. `featured` 는 홈에서 따로 빠지고, 나머지 최근 글 4개가
홈에 뜬다(`posts.perIndex`).

### 초안과 예약 발행

- `draft: true` → 어디에도 안 나온다.
- `pubDatetime` 이 미래 → 그 시각까지 목록에서 빠진다(15분 여유, `posts.scheduledPostMargin`).
- 단 **개발 서버에서는 둘 다 무시하고 보여준다.** 쓰면서 바로 확인하라는 것.
  진짜로 어떻게 나가는지 보려면 `npm run build && npm run preview`.

## 로컬에서 돌리기

Node 22.12 이상.

```sh
npm install
npm run dev        # http://localhost:4321
```

| 명령              | 하는 일                                       |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | 개발 서버                                     |
| `npm run build`   | 타입 검사 → 빌드 → 검색 인덱스 생성 (`dist/`) |
| `npm run preview` | 빌드 결과를 그대로 서빙. 배포본과 같은 상태   |
| `npm run lint`    | ESLint                                        |
| `npm run format`  | Prettier 적용 (`format:check` 는 검사만)      |

`build` 는 `astro check` 로 시작한다. 타입이 깨지면 거기서 멈추고, CI 도 같은 명령을
쓰므로 **타입 에러는 배포되지 않는다.**

### 검색은 개발 서버에서 안 된다

검색은 [Pagefind](https://pagefind.app) 다. 빌드가 끝난 `dist/` 를 훑어서 인덱스를
만들기 때문에, 인덱스가 생기는 시점이 빌드 이후다. `npm run dev` 에는 인덱스가 없어
검색 페이지가 비어 보인다. 정상이다.

확인하려면 `npm run build && npm run preview`.

## 배포

`master` 에 push → `.github/workflows/deploy.yml` 이 빌드해서 Pages 로 올린다.
수동 실행(`workflow_dispatch`)도 열려 있다. 보통 1~2분.

저장소 **Settings → Pages → Source 를 "GitHub Actions"** 로 둬야 한다. 기본값인
"Deploy from a branch" 는 Jekyll 3.10 에 묶여 있어서 Astro 를 아예 못 돌린다.

### 도메인

`public/CNAME` 이 `iamboss.today`. DNS 는 Cloudflare 에 아래처럼 잡혀 있다.

```
A      iamboss.today       185.199.108.153
A      iamboss.today       185.199.109.153
A      iamboss.today       185.199.110.153
A      iamboss.today       185.199.111.153
CNAME  www.iamboss.today   iiamboss.github.io
```

전부 **DNS only(회색 구름)**. 프록시를 켜면 GitHub 이 인증서를 못 받는다.

## 이 사이트가 아닌 것

이력서가 아니다. 경력·기술 목록·학력은 **의도적으로 없다**. 이력서 문서가 이미
담고 있고, 여기 오는 사람은 그 문서를 보고 온다. 목록을 복제하면 클릭이 낭비된다.

사이트가 하는 일은 문서가 못 하는 것 하나: **어떻게 판단하는지 보여주기.**
그래서 홈은 짧은 소개 + 글이 전부다. 글이 늘면 그만큼만 늘어난다.

민감한 개인 정보(연락처 상세·생년 등)는 사이트에 싣지 않는다. 문서로만 전달.

## 공개 전 체크리스트

- [ ] `src/noindex.ts` 의 `NOINDEX` 를 `false` 로 (검색엔진 색인 허용)

지금은 `true` — 모든 페이지에 `noindex` 메타가 붙고 `robots.txt` 에서 sitemap 안내가
빠진다. 크롤링 자체는 막지 않는데, 이유는 `src/noindex.ts` 주석에 적어 뒀다.

## 테마

[AstroPaper](https://github.com/satnaing/astro-paper) (MIT) 를 포크해서 쓴다.
원본 라이선스는 `LICENSE-astro-paper`.

한글 조판(`src/styles/korean.css`)과 색인 차단 스위치(`src/noindex.ts`)는 원본에 없는,
이 저장소에서 더한 것이다. 테마를 업데이트할 때 연결이 유지되는지 확인할 것.
