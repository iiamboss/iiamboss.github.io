/**
 * mermaid 코드블록을 다이어그램으로 바꾼다.
 *
 * Astro 도 AstroPaper 도 mermaid 렌더러가 없어서, ```mermaid 블록이 Shiki 를
 * 그냥 통과해 "문법 강조된 텍스트"로 나온다. 여기서 그걸 실제 도형으로 만든다.
 *
 * 빌드 시점(rehype-mermaid)이 아니라 클라이언트에서 그리는 이유는, 빌드 렌더링이
 * headless 브라우저를 요구해서 CI 가 무거워지기 때문이다. 글이 몇 편 안 되고
 * 다이어그램도 페이지당 1~2개라 클라이언트 렌더로 충분하다.
 */
import mermaid from "mermaid";

const SELECTOR = 'pre[data-language="mermaid"]';

/** 현재 사이트 테마. Layout 의 인라인 스크립트가 html[data-theme] 을 세팅한다. */
function currentTheme(): "dark" | "default" {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "default";
}

/**
 * 원본 mermaid 소스를 꺼낸다.
 *
 * Shiki 가 줄마다 <span> 으로 감싸므로 textContent 를 쓰면 줄바꿈이 사라진다.
 * .line 단위로 모아야 원본이 복원된다.
 */
function readSource(pre: HTMLElement): string {
  const lines = pre.querySelectorAll(".line");
  if (lines.length === 0) return pre.textContent ?? "";
  return Array.from(lines)
    .map(line => line.textContent ?? "")
    .join("\n");
}

let seq = 0;

async function renderAll() {
  const blocks = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
  if (blocks.length === 0) return;

  mermaid.initialize({
    startOnLoad: false,
    theme: currentTheme(),
    securityLevel: "strict",
    fontFamily: "inherit",
  });

  for (const pre of blocks) {
    // 테마를 바꾸면 다시 그려야 하므로 원본을 남겨둔다.
    const source = pre.dataset.mermaidSource ?? readSource(pre);
    if (!source.trim()) continue;

    const host = document.createElement("figure");
    // 크기·정렬은 korean.css 가 정한다. Tailwind 유틸리티를 여기 문자열로
    // 쓰면, Tailwind 가 소스를 정적으로 훑는 특성상 .ts 안의 클래스를 놓쳐
    // 규칙이 아예 생성되지 않는 일이 있다(실제로 w-full 이 그랬다).
    host.className = "mermaid-diagram";
    host.dataset.mermaidSource = source;

    try {
      const { svg } = await mermaid.render(`mermaid-${seq++}`, source);
      host.innerHTML = svg;
    } catch (err) {
      // 문법 오류면 원본 코드블록을 그대로 둔다. 조용히 빈 자리를 남기지 않는다.
      // eslint-disable-next-line no-console -- 렌더 실패를 삼키면 진단할 방법이 없다
      console.error("[mermaid] 렌더 실패, 원본 코드블록 유지", err);
      continue;
    }

    pre.replaceWith(host);
  }
}

/** 테마 토글 시 다이어그램 색이 안 따라오므로 다시 그린다. */
function watchTheme() {
  const observer = new MutationObserver(async mutations => {
    if (!mutations.some(m => m.attributeName === "data-theme")) return;

    const drawn = document.querySelectorAll<HTMLElement>(".mermaid-diagram");
    if (drawn.length === 0) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: currentTheme(),
      securityLevel: "strict",
      fontFamily: "inherit",
    });

    for (const fig of drawn) {
      const source = fig.dataset.mermaidSource;
      if (!source) continue;
      try {
        const { svg } = await mermaid.render(`mermaid-${seq++}`, source);
        fig.innerHTML = svg;
      } catch (err) {
        // eslint-disable-next-line no-console -- 위와 같은 이유
        console.error("[mermaid] 테마 전환 후 렌더 실패", err);
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}

// ClientRouter(뷰 트랜지션)를 쓰므로 페이지 이동마다 다시 돈다.
document.addEventListener("astro:page-load", renderAll);

// 위 리스너만으로는 첫 화면을 놓칠 수 있다. 이 모듈이 평가되는 시점이
// astro:page-load 보다 늦으면 이벤트가 이미 지나가 버리기 때문이다.
// (dev 에서 실제로 그랬다. 에러도 안 나고 조용히 아무것도 안 그려졌다)
// renderAll 은 mermaid 코드블록을 찾아 교체하므로, 이미 그린 뒤 다시 불려도
// 남은 블록이 없어 그냥 빠져나온다.
renderAll();

watchTheme();
