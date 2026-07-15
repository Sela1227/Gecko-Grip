# CLAUDE.md — Gecko Grip

> **這份是給下次 Claude 看的工作上下文，不是文件。**
> 判斷標準：下次 Claude 讀完，能不能直接動手？
> 維護章法：`SELA-Starter-Kit/conventions/CLAUDE-MD-章法.md`，每次升版前複習。
> 每升一版至少更新三處：踩過的坑、版本歷程、下版候選工作。

---

## 〇、當前狀態

- **版本：** V0.8.0
- **狀態：** 可運作
- **一句話定位：** 個人英文單字間隔重複練習工具，英文顯示 → 中文遮蔽 → Space 揭示 → 可選拼字測試（開啟時英文反向遮蔽），Leitner 五盒 + 失誤懲罰排程 + 詞性配比選字，雙詞庫（通用萬字 + 醫學專業）
- **命名由來：** 壁虎腳掌的 van der Waals 抓力 = 單字牢牢黏住不放；呼應 SELA 品牌壁虎標記
- **技術棧：** 純 HTML + CSS + JS（無框架、無 build step），8,198 筆多詞性繁體釋義 + 詞性/變化形標記離線嵌入
- **入口點：** `index.html`（雙擊或 GitHub Pages）
- **PWA：** 可安裝、離線完整可用（`manifest.webmanifest` + `sw.js`）
- **部署目標：** GitHub Pages **project site**（子路徑 → 全站相對路徑，Kit 坑 #39）或本機雙擊（file:// 不註冊 SW）

---

## 一、技術棧決策

| 選擇 | 替代品 | 理由 |
|------|--------|------|
| 純 HTML + 內嵌 JS/CSS | React/Vue | 無 build step、雙擊可跑、GitHub Pages 直接 host |
| 詞庫全嵌 index.html | JSON fetch | 支援 file:// 雙擊，完全離線可用 |
| localStorage | 後端 DB | 個人工具、零 PII；換裝置匯出 JSON 即可 |
| Leitner 五盒 | SuperMemo SM-2 | 實作簡單、符合個人學習節奏 |
| dictionaryapi.dev | 其他字典 API | 免費、有真人錄音 MP3 |
| build script 注入詞庫 | 手動貼上 | 9,858 字 + 9,767 筆 ZH map 不適合人工維護 |

---

## 二、業務對映表

### 版本號的三方對齊（Kit 坑 #14 要求，發版必查）

| # | 檔案 | 位置 | 格式 |
|---|------|------|------|
| 1 | `index.html` | `<title>` | `Gecko Grip V0.8.0 — 英文單字記憶` |
| 2 | `index.html` | `.brand-text .ver` | `英文單字記憶 · V0.8.0` |
| 3 | `index.html` | `const VERSION` | `V0.8.0` |
| 4 | **`sw.js`** | **`CACHE_VERSION`** | **`gecko-grip-V0.8.0`**（前綴不同！） |
| 5 | `README.md` | 版本章節 + 頁尾 | `V0.8.0` |
| 6 | `CLAUDE.md` | 〇 當前狀態 + 版本歷程 | `V0.8.0` |

**漏掉第 4 項的後果**：SW 不會清舊快取，使用者永遠看到舊版且不知道為什麼。煙霧測試已加自動比對。

### 主題色的「N 處真相清單」（Kit 坑 #42 補強要求）

| # | 位置 | 值 |
|---|------|-----|
| 1 | `index.html` CSS `:root --primary` | `#5A7A8B` |
| 2 | `index.html` `<meta name="theme-color">` | `#5A7A8B` |
| 3 | `manifest.webmanifest` `theme_color` | `#5A7A8B` |
| 4 | `manifest.webmanifest` `background_color` | `#FAFBFC`（= `--bg`，避免啟動閃白） |

**注意**：SELA 橘 `#F36825` 只用於 logo 與「新字」標記，**不可用於 theme-color**（品牌色 ≠ 介面色，Kit 坑 #42）。

---

## 三、關鍵檔案路徑

| 想改什麼 | 動哪些檔 |
|---------|---------|
| 配色 | `index.html` `<style>` 的 `:root { --... }` 區塊 |
| App 名稱 / 副標 | `index.html` `<title>` + `.brand-text` 的 `<h1>` 與 `.ver` |
| 通用詞庫 | build script 讀 `words_clean.txt`（重跑 build 後產新 index.html） |
| 醫學詞庫 | `index.html` JS 的 `const MEDICAL = [...]` 陣列 |
| 中文翻譯對照表 | build script 讀 `zh_map.json`（重跑 build） |
| Leitner 間隔天數 | `index.html` JS `const BOX_DAYS = [0,1,3,7,14,30]`（**唯一真相**，UI 標籤由 `BOX_LABEL()` 衍生，不要另寫字串表 — 見坑 P10） |
| 新字詞性配比 | `index.html` JS `MIX_PRESETS`（方案）／`allocQuota()`（赤字補償）／`newCandidates()`（選字） |
| 詞性資料 | `index.html` JS `const PRIM`（主要詞性）／`const INFL`（變化形旗標）／`const ZH`（多詞性釋義）— **三者由 build script 產生，不可手改**（見坑 P7） |
| 失誤懲罰幅度 | `index.html` JS `const LAPSE_MULT = [1,.7,.55,.45]`（索引 = 累計答錯次數，上限 3） |
| 「補考不給升級」規則 | `index.html` JS `grade(word,ok,relearn)` 的 `relearn` 分支；呼叫端 `answer()` 傳 `sessWrong.has(w)` |
| 英文定義的抓取／過濾 | `index.html` JS `lookup()` 與 `NOISE_DEF` 正規表達式（見坑 P9） |
| 拼字遮罩行為 | `index.html` JS `maskWord()` / `unmaskWord()` / `toggleTyping()` / `checkTyping()` 四者連動，改一個要看其他三個 |
| PWA manifest | `manifest.webmanifest`（**必須在根目錄** — 放子目錄會把 scope 限制在該目錄，見坑 P15） |
| Service Worker | `sw.js`（改動前先讀檔頭的約束清單：Kit 坑 #13 / #14 / #39 / #60） |
| 離線／安裝 UI | `index.html` JS 的 PWA 區塊（`canSW` / `beforeinstallprompt` / `syncOnline()`） |
| handoff（給 Kit Claude）| `SELA-handoff.md`（**與 CLAUDE.md 讀者不同**：這份給下次專案 Claude、那份給升 Kit 用的 Kit Claude）|
| 版本號 | `index.html` JS `const VERSION` + `<title>` + `.ver` 顯示（三處同步） |
| Logo | `assets/sela.svg`（取自 SELA Starter Kit，不可替換） |
| Favicon | `favicon/` 整個目錄（已含完整 Kit 套組，正常不用改） |

---

## 四、踩過的坑（編號累積，永不重排）

P1. **localStorage 在特定環境下不可用**
   - 症狀：進度無法儲存，重整後消失
   - 原因：Safari Private Mode / 某些嵌入式 WebView 禁止 localStorage
   - 做法：所有 localStorage 操作均有 try/catch，失敗靜默降級

P2. **dictionaryapi.dev 對多字片語（> 2 字）查無結果**
   - 症狀：`stereotactic body radiation therapy` 等查無音標
   - 原因：字典 API 只收單字詞
   - 做法：多字片語只走 TTS 語音 + 顯示 Cambridge 連結，不送 API

P3. **MyMemory 翻譯 API 每 IP 每日 500 次免費配額**
   - 症狀：頻繁新使用者在同一 IP 可能遇翻譯失敗
   - 原因：超出免費配額
   - 做法：9,767 個通用詞已離線嵌入 ZH map，API 只做 fallback（正常不觸發）

P4. **file:// 雙擊時 fetch / ES module 失敗**
   - 症狀：Console 報 CORS policy
   - 原因：Chrome 安全策略禁止 file:// 的跨來源請求
   - 做法：詞庫全部內嵌（無 fetch 讀本地），對外 API 均為網路請求，符合 file:// 環境

P5. **配色規範與前版不一致**（V0.3.0 Kit 對齊時發現）
   - 症狀：SELA 橘先前用 #FA7A35，Kit 標準為 #F36825
   - 原因：前版未對齊 Kit colors.md
   - 做法：V0.3.0 起全面改為 Kit 規範色 #F36825；grade 按鈕（ok/no）為強化 UX 分辨性刻意留彩度，不走 Kit danger #9A8585

P6. **改 App 名稱時若一併改 localStorage key，使用者進度全毀**
   - 症狀：V0.4.0 從 SELA Vocab 更名為 Gecko Grip，若把 key `sv3` 改成 `gg1`，既有 Leitner 進度讀不到、等同從零開始
   - 原因：localStorage 以 key 定址，rename 只是顯示層的事，儲存層無關
   - 做法：**key 永久凍結為 `sv3`**，不隨 App 名稱或版本變動。真要改 schema 時必須寫 migration（讀舊 key → 轉換 → 寫新 key → 刪舊 key），不可直接換 key
   - 適用範圍：這條對所有帶 localStorage 的 SELA 靜態工具都成立，建議回流 Kit 坑庫

P7. **build script 手動維護詞庫陣列時會靜默掉詞**
   - 症狀：V0.3.0 交付訊息回報醫學詞彙 252 筆，實際只有 250 筆（`differentiation`、`conformity index` 在 build script 改寫時遺失）
   - 原因：MEDICAL 陣列在多次 build script 之間手抄搬移，沒有任何筆數斷言，掉詞不會報錯
   - 做法：V0.4.0 起煙霧測試加入筆數與重複詞驗證（見第五章的 node 一行式）；**回報數字前先實測，不要沿用上一版的口徑**
   - 通則：凡是「人工搬移的資料陣列」都要有 count assertion，否則掉了也不知道

P8. **「揭示」與「遮蔽」在同一張卡上是兩個相反方向，容易寫成互相打架**
   - 症狀：V0.4.0 的拼字測試在英文仍可見時開啟，使用者照抄即可通過，測不到任何記憶
   - 原因：主流程是「英文可見 → 遮中文 → 揭示中文」，拼字測試需要的卻是反向的「遮英文 → 憑記憶輸入 → 揭示英文」。兩個方向共用同一個 `#en-word` 節點，第一版只做了前者
   - 做法：用獨立的 `#en-mask` 節點承載底線遮罩（不是改 `#en-word` 的 textContent — 那樣還原時要重存原字串，容易掉），`#en-word` 只切 `.hidden`。四個進出點都要處理：開啟拼字 → mask、確認 → unmask、收起 → unmask、換下一張 → unmask
   - 通則：**任何「可選的反向測驗模式」都要盤點所有進出點**，只做主路徑（開啟）不做逃生路徑（收起 / 換卡 / 中途評分）會留下狀態殘留

P9. **dictionaryapi.dev 會把同形異義詞的多個 entry 一起回傳，全抓會讓釋義變成噪音**
   - 症狀：`year` 卡片上連續出現三個 `noun`，第一個是「太陽年」，第二、三個卻是「This place; this location」與「Eye dialect spelling of hear」— 那是 *here* / *hear* 的方言拼法，跟「年」無關
   - 原因：API 回傳的 `j` 是 **entry 陣列**（依詞源拆分），不是單一詞條。原本的迴圈 `for(const e of j)` 把所有 entry 的 meanings 混抓進同一張卡；又因為每個 entry 各自有 `partOfSpeech:"noun"`，畫面就出現三個並列的 noun
   - 做法：三層修正 —
     1. **只取 `j[0]`**（主詞源）作為釋義來源；音標／錄音才允許往後 fallback（後續 entry 拼法相同，音檔仍可用）
     2. `NOISE_DEF` 正規表達式濾掉「這個拼法是另一個字的變體」類定義（eye dialect / alternative spelling / misspelling / abbreviation of …）— 這類定義對背單字零價值。整組被濾光時退回原始，不留空白
     3. 同 `partOfSpeech` 用 `Map` 合併成一組，避免畫面連續三個 noun
   - 通則：**字典 API 的回傳是「這個拼法的所有可能」，不是「這個字的意思」。** 凡是拿外部語料當教材，都要先問「這批資料的每一筆，是不是都在回答我要問的那個問題」

P10. **標籤與資料各寫一份 → 必然漂移（Kit 坑 #3 的實例）**
   - 症狀：卡片顯示 `Box2·隔日` 但實際間隔是 **3 天**；`Box3·三天` 實際 **7 天**；`Box4·週複習` 實際 **14 天**。README 的對照表也跟著錯
   - 原因：`BOX_DAYS=[0,1,3,7,14,30]` 是資料，`BOX_NAMES=["","Box1·每日","Box2·隔日",…]` 是另一份手寫顯示字串。兩份沒有任何連結，改了間隔不會有人提醒你改標籤，於是靜默說謊了三個版本
   - 做法：刪掉 `BOX_NAMES`，標籤改由資料衍生 —— `BOX_LABEL = b => \`Box${b}·${BOX_DAYS[b]}天\``。改間隔時標籤自動跟著對
   - 通則：**凡是「同一件事寫兩遍」都是待爆的地雷。** 顯示層要嘛從資料算出來，要嘛就別存在。這正是 Kit `cross-project-pitfalls.md` #3「資料 vs 顯示混用」，在本專案的第二次現形

P11. **同回合補考答對 = 短期記憶，給升級等於自我欺騙**
   - 症狀：V0.5.1 以前，答錯的字打回 Box1、隔 4 張補考，答對就升 Box2 拉到 3 天後 —— 但你 4 張卡前才剛看過答案
   - 原因：`grade()` 只知道「這次對不對」，不知道「這張卡剛剛才錯過」。`sessWrong` 這個資訊在 `answer()` 手上，沒傳進去
   - 做法：`grade(word, ok, relearn)` 加第三參數；`answer()` 傳 `sessWrong.has(w)`（**必須在 `sessWrong.add(w)` 之前呼叫**，順序調換就永遠是 false）。`relearn` 為真時停在 Box1、`next = 明天`，不給升級
   - 通則：**間隔重複的整個價值建立在「間隔」上。** 任何讓使用者在短間隔內重看答案又拿到長間隔獎勵的路徑，都是在破壞這個工具存在的理由

P12. **字典的詞性順序是編排慣例，不是使用頻率**
   - 症狀：想按詞性配比選字，先用 ECDICT 釋義的詞性前綴（`n.` / `vt.`）判定主要詞性 —— 結果 `work`/`use`/`show`/`study`/`increase`/`support`/`treat` 全被判成**名詞**，動詞佔比只有 6.6%（真值 18.5%）。加上「動詞義出現在前兩個詞性槽就升級為動詞」的補丁後，換成 `school`/`message`/`name`/`time`/`water` 被判成**動詞**（因為它們確實有 `vt.` 義項，只是幾乎沒人那樣用）
   - 原因：字典把名詞義列在前面是**編排慣例**。義項的「存在」與「使用頻率」是兩件事，而詞典只告訴你前者。任何基於詞性順序的啟發法都在猜，猜的方向還會隨補丁翻來覆去
   - 做法：**用語料庫的實際標註統計，不要用字典的排版順序。** 本案改用 NLTK Brown 語料庫（116 萬個已標註詞），取每個字出現最多的詞性；變化形（works/working/worked）先用 ECDICT `exchange` 欄位歸回原形再統計。實測**修正了 24% 的分類**，且 Brown 未覆蓋的 15% 才退回字典啟發法
   - 通則：**當你要的是「頻率」而手上只有「順序」，那不是資料不足，是資料型別不對。** 補丁只會讓錯誤換個方向出現

P13. **詞頻表把變化形當獨立條目，配比模式會把它們濃縮成一桶**
   - 症狀：動詞配比一開，取到的「動詞」是 `used, said, does, made, did, using, been, were, has, united`。全是變化形與助動詞，沒有一個值得當生字學
   - 原因：兩層 ——
     ① Google 10k 詞頻表收錄的是**表面形**：`years`/`books`/`services`/`said`/`is`/`been` 都各佔一個 rank。全表 **25.2% 是變化形**
     ② 這個問題從 V0.1.0 就存在（使用者一直在背 `years` 這種卡），但依詞頻順序發時它們散在各處不明顯；**配比模式把動詞變化形全濃縮進動詞桶**（rank 101–3000 的動詞桶有 **54%** 是變化形）才現形
   - 做法：用 ECDICT `exchange` 的 `1:` **關係碼**判定（`1:s`=複數、`1:pd`=過去式/分詞、`1:i`=-ing），命中就不發新卡。兩個必要的防呆：
     - **不採信 `1:r` / `1:t`（比較級/最高級）** —— ECDICT 把 `number` 當成 `numb` 的比較級（numb+er），照收會誤殺 `number`
     - **原形必須也在詞表內** —— `data` 的原形 `datum` 不在表內，濾掉 `data` 會真的損失學習機會
   - 通則：**新功能常常不是「製造」問題，而是「把既有問題排列到同一個地方」。** 這條坑的正確歸因是「詞表品質」而不是「配比功能有 bug」

P14. **各自四捨五入的配額，誤差會同向累積、永遠達不到目標比例**
   - 症狀：設定動 45 / 名 35 / 形 20，實測跑出 50 / 30 / 20，而且**背再多字都不會收斂**
   - 原因：每回合 10 個名額各自 round：`4.5→5`、`3.5→4`、`2.0→2` 共 11 個超額；改用最大餘數法變成固定的 5/3/2 = 50/30/20。**每回合都拆出同一組整數，誤差同向累積、永不抵銷**
   - 做法：改為**赤字補償** —— 每發一個名額，都看「已學組成 vs 目標比例」，挑落後最多的桶。實測 100 字後即精準命中 45/35/20，且使用者中途改配比也會自動往新目標修正
   - 通則：**比例型配額不能只看「這一批怎麼分」，要看「累積起來像不像」。** 無狀態的四捨五入必然有系統性偏差

P15. **PWA manifest 放在子目錄會把 scope 鎖死在該子目錄**
   - 症狀：沿用 Kit favicon 套組附的 `favicon/site.webmanifest` 當 PWA manifest，安裝後 app 的 scope 變成 `/favicon/`，`start_url` 要寫成 `../` 才指得回首頁，且離開 `/favicon/` 就跳出 standalone 模式回到瀏覽器
   - 原因：manifest 的 `scope` **預設是 manifest 檔案所在的目錄**，不是 `start_url` 的目錄。Kit 的 `favicon/site.webmanifest` 是給 favicon 產生器用的 metadata（name 寫死 `"SELA"`、`theme_color` 寫死品牌橘），它從來不是為了當 PWA manifest 而存在
   - 做法：**PWA manifest 一律放專案根目錄**，icon 用相對路徑指進 `favicon/`。本專案已移除 `favicon/site.webmanifest` 並新建根目錄 `manifest.webmanifest` —— 保留兩份會變成兩份真相（一份寫 `SELA`/橘、一份寫 `Gecko Grip`/霧藍），未來必然有人改錯邊
   - 通則：**「檔案放哪裡」有時是語意的一部分，不只是整潔問題。** manifest 的位置定義 scope、`.gitignore` 的位置定義作用範圍、`CLAUDE.md` 的位置定義它在講哪個專案

P16. **`theme-color` 沿用品牌橘 = 把品牌色誤當介面色**（Kit 坑 #42 的實例）
   - 症狀：`<meta name="theme-color" content="#F36825">` 從 V0.3.0 首次對齊 Kit 時就寫死品牌橘，但本 app 是北歐霧藍 + 近白底（`--bg:#FAFBFC`）。安裝成 PWA 後啟動會閃橘色，跟 app 本體毫無關係
   - 原因：Kit `logo/CLAUDE.md` 把「logo 永遠橘+白」（品牌鐵律）跟 theme-color 的範例寫在一起，我對齊時整段照抄，**沒意識到那是兩個概念** —— 品牌色是識別用的、介面色是沉浸體驗用的
   - 做法：`theme-color` 與 manifest `theme_color` 都改為 app 主題色 `#5A7A8B`；`background_color` 用 `--bg` 的 `#FAFBFC` 避免啟動閃白。**logo 顏色完全不動**（兩條規則並行不衝突）
   - 同時修掉的第二份真相：CSS 裡 `.pos-v{color:#5A7A8B}` 等四處硬編十六進位，與 `:root` 變數是兩份真相 —— 已全部改為 `var(--primary)` 等（Kit 坑 #42 的「N 處真相清單」補強正是在講這個）
   - 通則：**照抄規範時，要抄的是它的「理由」不是它的「值」。** 抄值會在理由不適用的地方出錯，而且錯得很安靜

---

## 五、煙霧測試

```bash
# 本機預覽（PWA 功能必須用這個測，file:// 不註冊 SW）
cd "Gecko Grip"
python -m http.server 8000
# 開 http://localhost:8000

# 或直接雙擊
open index.html      # macOS
start index.html     # Windows

# 資料完整性驗證（打包前必跑，見坑 P7）
node -e "
const h=require('fs').readFileSync('index.html','utf8');
const arr=eval('['+h.match(/const MEDICAL = \[([\s\S]+?)\n\];/)[1]+']');
console.log('MEDICAL:', arr.length, '(預期 252)');
const c={};arr.forEach(x=>c[x.cat]=(c[x.cat]||0)+1);console.log(c);
console.log('重複:', arr.map(x=>x.w).filter((v,i,a)=>a.indexOf(v)!==i));
console.log('WORDS:', h.match(/const WORDS = \"([^\"]+)\"/)[1].split(' ').length, '(預期 9858)');
const s=h.match(/<script>([\s\S]+)<\/script>/)[1];
new Function(s.replace(/document\./g,'d.').replace(/localStorage/g,'l').replace(/window/g,'w').replace(/new Audio/g,'Object'));
console.log('JS 語法通過');
"
```

手動確認：
- [ ] 標頭顯示 SELA logo + `Gecko Grip` + 副標「英文單字記憶 · V0.4.0」
- [ ] favicon 在分頁標籤顯示為 SELA 橘色 logo
- [ ] Tab 切換：📖 通用英文 / 🏥 醫學詞彙 均可啟動回合
- [ ] 英文字出現後 0.4 秒自動播音（或 TTS）
- [ ] Space 揭示中文 + 評分按鈕出現
- [ ] T 開拼字輸入 → **上方英文立刻變成底線遮罩**（`_ _ _ _ _`，字數可見、字母不可見）
- [ ] Enter 或「確認」→ 英文還原，同時顯示「你打的 X / 正確 Y」
- [ ] 拼字未確認就按 T 收起 → 英文還原（不留遮罩殘留）
- [ ] 拼字未確認就按 1/2 評分 → 下一張的英文正常顯示（不留遮罩殘留）
- [ ] 醫學詞彙接受縮寫（如 SBRT）
- [ ] **練到 `year` 時只顯示一組 noun（太陽年），不出現「This place」或「Eye dialect」**（坑 P9 迴歸測試）
- [ ] 練到 `run` 時 verb / noun 分開顯示（確認合併沒做過頭）
- [ ] **盒標籤顯示真實天數**（`Box2·3天` 而非 `Box2·隔日`），且與 `BOX_DAYS` 一致（坑 P10 迴歸測試）
- [ ] 答錯一張 → 同回合補考答對 → **仍停在 Box1、標籤顯示「曾錯 1 次 · 間隔 ×0.7」**（坑 P11 迴歸測試）
- [ ] 首頁階梯下方出現「曾答錯過 N 字 — 間隔已縮短」註記
- [ ] 設定頁選「醫學論文 45/35/20」→ 練 100 字後首頁「已學組成」約為 動 45%／名 35%／形 20%（坑 P14 迴歸測試）
- [ ] 通用卡片右上出現詞性 chip；`increase` 揭示後同時列出「動詞 增加、加大」與「名詞 增加、增進、利益」
- [ ] **chip 的詞性 = 第一個釋義的詞性**（不得 chip 說動詞、釋義先顯示名詞義）
- [ ] 新字**不出現** `said` / `years` / `is` / `using` / `made` 等變化形（坑 P13 迴歸測試）
- [ ] 選「依詞頻（不分詞性）」→ 行為回到 V0.6.1，但仍不發變化形
- [ ] 設定頁改配比／詞頻範圍時，下方庫存提示即時更新（如「動詞 246 字（每回合 5 個 → 約 49 回合）」）

**PWA（必須用 http://localhost:8000 或已部署的 https，file:// 測不到）**
- [ ] DevTools → Application → Service Workers 顯示 `sw.js` 已 activated
- [ ] DevTools → Application → Manifest 無錯誤，圖示正常顯示，scope 為 app 根（**不是** `/favicon/`，坑 P15）
- [ ] 網址列出現安裝圖示／頁面右上出現「安裝」按鈕 → 可安裝到主畫面
- [ ] 安裝後啟動：狀態列為霧藍 `#5A7A8B`、啟動底色為 `#FAFBFC`（**不是橘色**，坑 P16）
- [ ] DevTools → Network 勾 Offline → 重整 → **app 完整載入、可正常練習**（中文釋義與排程不需連線）
- [ ] 離線時頁面右上出現「離線」徽章；發音自動改用系統語音、不報錯
- [ ] 離線時 Console **沒有** `Failed to execute 'put' on 'Cache'` 之類錯誤（坑 #13 迴歸）
- [ ] **雙擊 index.html（file://）仍完全可用**，Console 無 SW 註冊錯誤紅字
- [ ] 部署到 GitHub Pages 子路徑（`user.github.io/gecko-grip/`）後 icon 與 manifest 皆 200（坑 #39）
- [ ] 自動檢查（打包前必跑）：
  ```bash
  # CACHE_VERSION 與 app VERSION 同步（坑 #14）
  node -e "
  const fs=require('fs');
  const v=fs.readFileSync('index.html','utf8').match(/const VERSION = \"([^\"]+)\"/)[1];
  const c=fs.readFileSync('sw.js','utf8').match(/CACHE_VERSION = 'gecko-grip-([^']+)'/)[1];
  console.log(v===c ? 'OK '+v : 'FAIL: index='+v+' sw='+c);
  "
  ```
- [ ] 排程邏輯離線驗證（改 `grade()` / `BOX_DAYS` / `LAPSE_MULT` 後必跑）：
  ```bash
  # 驗四種情境：理想路徑 1/3/7/14/30、補考不升級、曾錯間隔縮短、錯越多回來越勤
  # 腳本作法：從 index.html 切出 Leitner 常數區 + grade()，注入假的 today() 後 eval
  ```
- [ ] 1/2 評分後進下一張
- [ ] 設定儲存後重整仍保留
- [ ] **從 V0.3.0 升上來的既有進度仍在**（key `sv3` 未動，見坑 P6）
- [ ] 匯出 JSON 檔名為 `gecko-grip-YYYY-MM-DD.json`
- [ ] 匯入舊的 `sela-vocab-*.json` 仍可還原（JSON 內部結構未變）

---

## 六、版本歷程

| 版本 | 重點 |
|------|------|
| V0.1.0 | 通用英文萬字 Leitner 練習，英文顯示 → 揭示英文定義，dictionaryapi.dev 真人錄音 |
| V0.2.0 | 改中文先考（英文遮蔽）、醫學詞彙 252 個（CLI/LAB/ONC/RAD/RES）、9,767 詞離線 ZH map |
| V0.3.0 | 回歸英文先考（中文遮蔽）、揭示後可選拼字測試（T）、首次依 SELA Starter Kit V1.23.1 規範打包，色盤對齊 Kit（#F36825、#5A7A8B、#FAFBFC）、使用真正 sela.svg |
| V0.8.0 | **PWA 化**：新增根目錄 `manifest.webmanifest` 與真實 `sw.js`，可安裝、離線完整練習；順帶修掉兩個既有違規 —— `theme-color` 從品牌橘改為 app 主題色（坑 P16 / Kit #42）、CSS 硬編色票改引用 `:root`。移除 `favicon/site.webmanifest`（放子目錄會鎖死 PWA scope，坑 P15）。SW 遵守 Kit #13（POST 與外部 API 放行）／#14（版本同步，已進業務對映表）／#39（全相對路徑）／#60（真實同源檔） |
| V0.7.0 | **選字大修**：① 新增詞性配比（醫學論文 45/35/20 ／均衡 ／依詞頻 ／自訂），配額用赤字補償收斂（坑 P14）② 主要詞性改由 Brown 語料庫實測，修正字典啟發法 24% 的誤判（坑 P12）③ 排除 25.2% 的變化形，動詞桶不再是 said/does/made（坑 P13）④ 多詞性繁體釋義（OpenCC s2twp），`increase` 同時顯示動詞義與名詞義 ⑤ 卡片詞性 chip、首頁「已學組成」 |
| V0.6.1 | 交付物補完：首次產出 `SELA-handoff.md`（坑 P6–P11 分類完畢：4 條建議進 Kit、2 條留專案；另回報 Kit 自身 3 處問題）。**無程式變更** |
| V0.6.0 | **排程大修**：① 同回合補考答對不再給升級，停 Box1 明天重考（坑 P11）② 加失誤懲罰 `LAPSE_MULT`，曾錯的字間隔永久縮短、Box5 到頂也只有 14–21 天而非 30 天 ③ 盒標籤改由 `BOX_DAYS` 衍生，修掉說謊三版的 `Box2·隔日`（坑 P10）④ 卡片加「曾錯 N 次 · 間隔 ×0.7」標籤、首頁加曾錯註記 |
| V0.5.1 | 修 `lookup()`：只取首筆 entry、濾掉方言／變體拼法類定義、同詞性合併 — 解決 `year` 顯示三個 noun 且混入 here/hear 釋義的問題（新增坑 P9） |
| V0.5.0 | 拼字測試改為**真正的主動回想**：開啟時英文反向遮蔽為底線（保留字數提示），確認後才揭曉並比對「你打的 vs 正確」；四個進出點皆解除遮罩（新增坑 P8） |
| V0.4.0 | 更名 SELA Vocab → **Gecko Grip**（壁虎抓力隱喻，UI 加中文副標「英文單字記憶」）、匯出檔名同步更名、localStorage key 凍結為 `sv3` 保進度（坑 P6）、補回 V0.3.0 靜默掉的 `differentiation` / `conformity index` 兩詞回到 252 筆並加筆數斷言（坑 P7） |

---

## 七、下版候選工作

1. **核心高頻動詞需要搭配卡，不是單義卡** — V0.7.0 讓動詞佔 45% 了，但**卡片形式對高頻動詞是錯的**：`get` → 「得到、獲得」這張卡沒有教到任何東西。使用者真正缺的是 `get home / get better / get married / get sick / get ready`。單義閃卡能教 `demonstrate`／`indicate`／`reduce`（中頻專指動詞、一對一對應），卻教不了 `get`／`take`／`make`（高頻多義動詞、價值在搭配）。**下版應把動詞桶再切兩層**：中頻專指動詞走現行卡片；核心高頻動詞改出搭配題（給片語考中文，或給情境選介系詞）
2. **拼字結果餵回 Leitner 評分** — 拼字錯誤仍完全不影響排程：中文答對、拼字全錯，按 2 之後照樣升盒。系統知道你拼錯了卻假裝沒看到
3. 醫學詞彙支援分類篩選（只練 RAD / 只練 RES 等）
4. 回合結束後顯示答錯詞列表供複習
5. 個別詞可標記「暫時略過」（太難或太生僻）
6. PWA 進階：背景同步預抓下一批字的真人錄音，讓離線也有真人發音
7. **把坑 P6–P16 回流到 Kit `cross-project-pitfalls.md`** — 已累積 6 條，其中 P10 是 Kit 既有坑 #3 的第二次現形（可補強原條目）、P7 與 P10 同屬「同一件事寫兩遍」家族，值得合併成一條通則
8. 醫學詞庫外移成獨立 `medical.js`（classic script 設 window 全域，維持 file:// 相容），降低人工搬移掉詞風險

---

## 八、一句話總結

V0.8.0：PWA 化（可安裝、離線完整可用），SW 遵守 Kit 的 4 條 PWA 坑並實測驗證 POST／外部 API 放行；順帶修掉沿用品牌橘當 theme-color 的既有違規（坑 P16）與 manifest 放子目錄會鎖死 scope 的問題（坑 P15）。下版第一優先仍是「核心高頻動詞改出搭配卡」—— `get` →「得到」這張卡教不了 `get better`，那才是高頻動詞的真正難處。
