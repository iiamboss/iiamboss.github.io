/**
 * 검색엔진 색인 차단 스위치.
 *
 *   true  → 모든 페이지에 noindex 메타, robots.txt 에서 sitemap 안내 제거
 *   false → 공개, 색인 허용
 *
 * 내용 검토가 끝나면 false 로 바꾼다. 그 한 줄이 전부다.
 *
 * 크롤링 자체(Allow: /)는 막지 않는다. Disallow 로 막아버리면 크롤러가 각
 * 페이지의 noindex 메타를 읽지 못해, 이미 색인된 페이지가 오히려 검색 결과에서
 * 사라지지 않는다.
 *
 * AstroPaper 기본 기능이 아니라 이 저장소에서 더한 것이다. 테마를 업데이트할
 * 때 src/pages/robots.txt.ts 와 src/layouts/Layout.astro 의 연결이 유지되는지
 * 확인할 것.
 */
export const NOINDEX = true;
