import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://iamboss.today/",
    title: "홍성찬",
    description:
      "거래소, 실시간 게임 서버, 온체인 결제 인프라. 만들며 내린 판단과, 그 판단이 막지 못하는 것들에 대한 기록.",
    author: "홍성찬",
    profile: "https://github.com/iiamboss",
    ogImage: "default-og.jpg",
    lang: "ko",
    timezone: "Asia/Seoul",
    dir: "ltr",
  },
  posts: {
    perPage: 10,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  // 쓰는 것만 남긴다. 없는 계정을 링크해두면 죽은 링크가 된다.
  socials: [
    { name: "github", url: "https://github.com/iiamboss" },
    { name: "mail", url: "mailto:fatzerocoke@gmail.com" },
  ],
  // 개발 기록이라 SNS 공유 동선은 최소로 둔다.
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
