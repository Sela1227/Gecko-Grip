/* Gecko Grip Service Worker
 *
 * ⚠ CACHE_VERSION 必須與 index.html 的 const VERSION 同步（Kit 坑 #14）。
 *   兩處格式不同（"V0.8.0" vs "gecko-grip-V0.8.0"），發版時兩處都要改。
 *   打包前的煙霧測試會比對這兩個字串，不一致就紅燈。
 *
 * 設計約束（全部來自 Kit 坑庫，動這個檔前先讀）：
 *   #13 fetch handler 第一行必須排除非 GET；外部域名直接放行
 *   #39 所有路徑用相對路徑（GitHub Pages project site 部署在子路徑）
 *   #60 SW 必須是真實同源檔，不能用 blob URL 註冊
 */

const CACHE_VERSION = 'gecko-grip-V0.8.0';

/* App shell。相對路徑（坑 #39）。
   index.html 內嵌了全部詞庫（約 537KB），快取它等於整個 app 可離線。*/
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/sela.svg',
  './favicon/sela.svg',
  './favicon/favicon-32x32.png',
  './favicon/favicon-16x16.png',
  './favicon/apple-touch-icon.png',
  './favicon/android-chrome-192x192.png',
  './favicon/android-chrome-512x512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      /* 逐檔 add 而非 addAll：addAll 只要一個 404 就整批失敗、SW 裝不起來。
         少一顆 icon 不該讓整個離線功能陣亡。*/
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // ── 坑 #13：第一行就排除非 GET。Cache API 不支援 POST，攔了會整個崩潰
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // ── 坑 #13：外部域名直接放行。
  //    本 app 會打 dictionaryapi.dev（釋義／真人錄音）與 mymemory（備援翻譯），
  //    這些是跨來源請求，攔下來只會拿到 opaque response 汙染快取。
  if (url.origin !== self.location.origin) return;

  // ── 導覽請求：網路優先，失敗才回快取。
  //    避免使用者離線裝了 app、重新上線後永遠看到舊版。
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // ── 靜態資源：快取優先（icon / svg 不會變，變了就升 CACHE_VERSION）
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => hit))
  );
});
