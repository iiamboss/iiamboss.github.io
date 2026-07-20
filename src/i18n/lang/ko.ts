import type { UIStrings } from "../types";

// 사이트 본문 톤과 맞춘다: 서술체("~합니다") 대신 명사·평서형으로 끊는다.
export default {
  nav: {
    home: "홈",
    posts: "기록",
    tags: "태그",
    archives: "아카이브",
    search: "검색",
  },
  post: {
    publishedAt: "작성",
    updatedAt: "수정",
    sharePostIntro: "이 글 공유:",
    sharePostOn: "{{platform}}에 공유",
    sharePostViaEmail: "이메일로 공유",
    tagLabel: "태그",
    backToTop: "맨 위로",
    goBack: "뒤로",
    editPage: "페이지 수정",
    previousPost: "이전 글",
    nextPost: "다음 글",
  },
  pagination: {
    prev: "이전",
    next: "다음",
    page: "페이지",
  },
  home: {
    socialLinks: "링크",
    featured: "대표 글",
    recentPosts: "최근 글",
    allPosts: "전체 글",
  },
  footer: {
    copyright: "Copyright",
    allRightsReserved: "All rights reserved.",
  },
  pages: {
    tagTitle: "태그",
    tagDesc: "이 태그가 붙은 글",

    tagsTitle: "태그",
    tagsDesc: "글에 쓰인 태그 전체.",

    postsTitle: "기록",
    postsDesc: "만들고 운영하며 내린 판단과, 그 판단이 막지 못하는 것들.",

    archivesTitle: "아카이브",
    archivesDesc: "지금까지 쓴 글 전체.",

    searchTitle: "검색",
    searchDesc: "글 검색",
  },
  a11y: {
    skipToContent: "본문으로 건너뛰기",
    openMenu: "메뉴 열기",
    closeMenu: "메뉴 닫기",
    toggleTheme: "테마 전환",
    searchPlaceholder: "글 검색...",
    noResults: "결과 없음",
    goToPreviousPage: "이전 페이지로",
    goToNextPage: "다음 페이지로",
  },
  notFound: {
    title: "404 Not Found",
    message: "페이지를 찾을 수 없다",
    goHome: "홈으로 돌아가기",
  },
} satisfies UIStrings;
