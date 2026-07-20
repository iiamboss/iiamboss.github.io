import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import rehypeCallouts from "rehype-callouts";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import config from "./astro-paper.config";

/**
 * ```diff 블록의 +/- 줄에 클래스를 붙인다.
 *
 * Shiki 의 transformerNotationDiff 는 `// [!code ++]` 표기용이라 언어가 diff 인
 * 코드블록에는 관여하지 않는다. 그리고 min-light 테마에는 diff 색 정의가 없어
 * 라이트 모드에서 +/- 줄이 본문과 같은 검정으로 나온다.
 *
 * CSS 는 텍스트 내용을 못 보므로 여기서 줄 단위로 판별만 하고, 색은
 * typography.css 의 `.line.diff.add` / `.line.diff.remove` 를 그대로 쓴다.
 * 클래스 이름을 맞춰 두면 diff 색이 한 군데에만 남는다.
 */
function transformerDiffLanguage() {
  const textOf = (node: any): string =>
    node.type === "text"
      ? node.value
      : (node.children ?? []).map(textOf).join("");

  return {
    name: "diff-language-lines",
    line(this: any, node: any) {
      if (this.options?.lang !== "diff") return;
      const text = textOf(node);
      // `---` / `+++` 는 파일 헤더지 추가·삭제 줄이 아니다.
      if (text.startsWith("+++") || text.startsWith("---")) return;
      if (text.startsWith("+")) this.addClassToHast(node, ["diff", "add"]);
      else if (text.startsWith("-"))
        this.addClassToHast(node, ["diff", "remove"]);
    },
  };
}

export default defineConfig({
  site: config.site.url,
  integrations: [
    mdx(),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !page.endsWith("/archives/"),
    }),
  ],
  i18n: {
    locales: ["en", "ko"],
    defaultLocale: "ko",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
      ],
      rehypePlugins: [rehypeCallouts],
    }),
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
        transformerDiffLanguage(),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // mermaid 는 다이어그램 종류별 모듈을 동적 import 로 늦게 가져오고,
      // dayjs 같은 CJS 의존성도 물고 있다. exclude 하면 그 CJS 가 interop 을
      // 못 받아 "does not provide an export named 'default'" 로 죽는다.
      // 반대로 명시적으로 include 해서 Vite 가 통째로 사전 번들링하게 둔다.
      include: ["mermaid", "dayjs"],
    },
  },
  fonts: [
    {
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
