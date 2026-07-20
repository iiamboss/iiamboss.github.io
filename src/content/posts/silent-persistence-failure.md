---
title: "성공적으로 아무것도 안 한다"
description: "예외를 던지는 실패는 어차피 잡힌다. 잡히지 않는 건 성공한 척 아무것도 안 하는 쪽이다. 영속화가 통째로 죽어 있었는데 에러도 경고도 없었다."
pubDatetime: 2025-10-19T09:00:00+09:00
tags: ["Node.js", "Yjs", "y-websocket", "Redis", "WebSocket"]
---

가장 위험한 실패는 예외를 던지는 실패가 아니다. 그건 로그에 남고 알림이 울리고
어차피 잡힌다. 잡히지 않는 건 성공한 척 아무것도 안 하는 쪽이다. 정상 경로는 완벽히
동작하고, 어디에도 실패가 없고, 다만 하기로 한 일을 안 한다.

협업 편집 기능을 붙이면서 영속화를 그렇게 죽여뒀다. 개발 중 테스트에서 잡아 고쳤는데,
잡힌 경위가 마음에 걸려서 적어둔다.

## 문서가 재시작할 때마다 사라졌다

여러 사용자가 동시에 편집하는 협업 메모 기능을 붙였다. 실시간 동기화는
[Yjs](https://yjs.dev/)(CRDT), 전송은 `y-websocket`, 영속화는 Redis.

편집은 잘 됐다. 그런데 서버를 재시작하면 문서가 사라졌다.

구성은 분명히 해뒀다. Redis 연결에 TLS, 운영 환경용 SSH 터널까지 공들여 붙였고,
`RedisPersistence` 인스턴스를 만들어 WebSocket 연결 핸들러에 넘겼다.

```js
const persistence = new RedisPersistence({ /* Redis, TLS, SSH 터널 구성 */ });

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req, {
    persistence,   // ← 여기로 넘기면 되는 줄 알았다
  });
});
```

에러도 경고도 없었다. 연결 정상, 실시간 동기화 정상. 다만 재시작하면 문서가 초기화됐다.
공들여 만든 `RedisPersistence`는 한 번도 호출되지 않고 있었다.

## 라이브러리는 그 옵션을 받지 않는다

`setupWSConnection`의 시그니처를 열어봤다.

```js
// y-websocket-server 내부
export const setupWSConnection = (conn, req, { docName, gc = true } = {}) => { ... }
```

세 번째 인자에서 destructuring하는 건 `docName`과 `gc` 둘뿐이다. `persistence`라는
키는 어디서도 받지 않는다. 내가 넘긴 `{ persistence }`는 그냥 조용히 버려졌다.

JavaScript에서 함수에 없는 키를 얹어 넘기는 건 에러가 아니다. 타입 검사도 통과한다
(옵션 객체 타입에 없는 필드는 초과 프로퍼티일 뿐이다). 그래서 아무 신호도 안 났다.

영속화가 실제로 주입되는 경로는 따로 있었다. 이 라이브러리는 persistence를 모듈 전역
상태로 두고 별도 setter로 주입한다.

```js
// y-websocket-server 내부. persistence는 모듈 전역이고 setter로만 주입된다
let persistence = null
export const setPersistence = persistence_ => { persistence = persistence_ }

// 문서가 열릴 때: 전역 persistence가 null이 아니면 상태를 복원(bindState)
// 마지막 연결이 끊길 때: 전역 persistence가 null이 아니면 상태를 저장(writeState)
```

전역 `persistence`가 `null`인 채였으니 문서를 열 때 복원도, 닫을 때 저장도 일어나지
않았다. 문서는 프로세스 메모리에만 존재했고 재시작하면 증발했다.

버전 문제도 아니다. 옵션 객체가 도입된 v1.1.0 이래 이 자리가 받는 키는 `docName`과
`gc` 둘뿐이었고, v2로 넘어오면서도 그대로다.

고치는 건 한 줄이었다.

```diff
  const persistence = new RedisPersistence({ /* ... */ });
+ setPersistence(persistence);

  setupWSConnection(ws, req, {
-   persistence,
+   // persistence,  // 이 옵션은 무시된다. 위의 setPersistence로 주입해야 한다.
  });
```

## 침묵에는 구조가 있다

고친 것보다 이쪽이 더 남는 이야기 같아서 정리해 둔다.

영속화가 죽어도 정상 경로는 완벽히 동작한다. 실시간 동기화는 메모리 CRDT라 멀쩡하고,
데모나 개발 중에는 서버를 자주 재시작하지 않으니 증상 자체가 안 보인다.

에러를 던질 지점도 없다. 없는 옵션 키는 무시되고, 전역 persistence가 null이면
복원·저장 로직을 그냥 건너뛴다. 어디에도 실패가 없다. 성공적으로 아무것도 안 한다.

## 관례가 갈리는 지점

남은 건 내 가정 문제인데, 아무 데서나 온 가정은 아니었다.

`RedisPersistence`를 가져온 y-redis 계열은 persistence를 설정 객체의 키로 받는다.

```js
// y-redis(@y/hub) 문서의 구성 예시
const yhub = await createYHub({
  redis:    { url: 'redis://localhost:6379', prefix: 'y' },
  postgres: 'postgres://...',
  persistence: [new S3PersistenceV1({ /* ... */ })],
});
```

같은 생태계 안에서 persistence를 옵션으로 주입하는 건 관용적인 방식이다. 어긋난 쪽은
y-websocket이고, 하필 이 라이브러리는 영속화 설정을 README에서 다루지 않는다. 배선
위치가 옮겨다닌 탓에 커스텀 persistence를 붙일 수 없게 됐다는
[이슈](https://github.com/yjs/y-websocket/issues/76)까지 있다.

그런데 y-websocket README에는 「Websocket Server with Persistence」라는 절이 있었다.
읽어보면 LevelDB를 쓰라는 안내와 환경변수 이야기뿐이다. 내가 필요한 것 — 직접 만든
persistence 인스턴스를 어떻게 꽂느냐 — 은 거기 없었다. `setPersistence`는 v1.3부터
v1.5까지 README에 단 한 번도 등장하지 않는다. 그게 문서에 적힌 건 서버가
`y-websocket-server`로 분리되고 나서다.

답이 없는 문서보다 나쁜 건, 답이 있어 보이는 자리에 다른 답이 있는 문서다. 관례가
어긋나는 지점은 결국 소스를 봐야 잡힌다.

## 배운 것

부수효과가 핵심인 설정은 "설정했다"가 아니라 그 효과가 실제로 일어나는지로 확인해야
한다. 영속화라면 재시작 후 복원까지 가야 한 테스트다. 옵션 객체인지 전역 setter인지도
소스 한 줄이면 갈리는데, 그 한 줄을 안 본 대가가 이 버그였다.

여기서 유일한 신호는 "재시작하면 사라진다"뿐이었고, 그마저도 재시작을 해봐야 보였다.
조용한 실패를 찾는 방법은 결국 조용할 수 없는 조건을 만들어보는 것밖에 없다.
