import type { APIRoute } from "astro";
import { NOINDEX } from "@/noindex";

// 색인 차단 중에도 크롤링(Allow: /)은 열어둔다. Disallow 로 막으면 크롤러가
// 각 페이지의 noindex 메타를 읽지 못해, 이미 색인된 페이지가 오히려 검색
// 결과에서 사라지지 않는다. sitemap 안내만 뺀다.
const blocked = () => `
# 준비 중이라 색인 차단 상태입니다.
# 크롤링 자체는 허용합니다. 막아버리면 크롤러가 각 페이지의
# noindex 메타태그를 읽지 못해, 이미 색인된 페이지가 오히려
# 검색 결과에서 사라지지 않기 때문입니다.
User-agent: *
Allow: /
`;

const open = (sitemapURL: URL) => `
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  if (NOINDEX) return new Response(blocked());

  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(open(sitemapURL));
};
