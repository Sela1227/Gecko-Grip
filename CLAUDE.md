# CLAUDE.md — Gecko Grip

> **這份是給下次 Claude 看的工作上下文，不是文件。**
> 判斷標準：下次 Claude 讀完，能不能直接動手？
> 維護章法：`SELA-Starter-Kit/conventions/CLAUDE-MD-章法.md`，每次升版前複習。
> 每升一版至少更新三處：踩過的坑、版本歷程、下版候選工作。

---

## 〇、當前狀態

- **版本：** V0.5.1
- **狀態：** 可運作
- **一句話定位：** 個人英文單字間隔重複練習工具，英文顯示 → 中文遮蔽 → Space 揭示 → 可選拼字測試（開啟時英文反向遮蔽），Leitner 五盒演算法，雙詞庫（通用萬字 + 醫學專業）
- **命名由來：** 壁虎腳掌的 van der Waals 抓力 = 單字牢牢黏住不放；呼應 SELA 品牌壁虎標記
- **技術棧：** 純 HTML + CSS + JS（無框架、無 build step），9,767 個中文翻譯離線嵌入
- **入口點：** `index.html`（雙擊或 GitHub Pages）
- **部署目標：** GitHub Pages（推 main 即上線）或本機雙擊

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

（V0.4.0 單檔 JS < 600 行，業務邏輯與程式碼幾乎 1:1，暫不立表；若未來拆檔或詞庫外移再立）

---

## 三、關鍵檔案路徑

| 想改什麼 | 動哪些檔 |
|---------|---------|
| 配色 | `index.html` `<style>` 的 `:root { --... }` 區塊 |
| App 名稱 / 副標 | `index.html` `<title>` + `.brand-text` 的 `<h1>` 與 `.ver` |
| 通用詞庫 | build script 讀 `words_clean.txt`（重跑 build 後產新 index.html） |
| 醫學詞庫 | `index.html` JS 的 `const MEDICAL = [...]` 陣列 |
| 中文翻譯對照表 | build script 讀 `zh_map.json`（重跑 build） |
| Leitner 間隔天數 | `index.html` JS `const BOX_DAYS = [0,1,3,7,14,30]` |
| 英文定義的抓取／過濾 | `index.html` JS `lookup()` 與 `NOISE_DEF` 正規表達式（見坑 P9） |
| 拼字遮罩行為 | `index.html` JS `maskWord()` / `unmaskWord()` / `toggleTyping()` / `checkTyping()` 四者連動，改一個要看其他三個 |
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

---

## 五、煙霧測試

```bash
# 本機預覽
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
| V0.5.1 | 修 `lookup()`：只取首筆 entry、濾掉方言／變體拼法類定義、同詞性合併 — 解決 `year` 顯示三個 noun 且混入 here/hear 釋義的問題（新增坑 P9） |
| V0.5.0 | 拼字測試改為**真正的主動回想**：開啟時英文反向遮蔽為底線（保留字數提示），確認後才揭曉並比對「你打的 vs 正確」；四個進出點皆解除遮罩（新增坑 P8） |
| V0.4.0 | 更名 SELA Vocab → **Gecko Grip**（壁虎抓力隱喻，UI 加中文副標「英文單字記憶」）、匯出檔名同步更名、localStorage key 凍結為 `sv3` 保進度（坑 P6）、補回 V0.3.0 靜默掉的 `differentiation` / `conformity index` 兩詞回到 252 筆並加筆數斷言（坑 P7） |

---

## 七、下版候選工作

1. **拼字結果餵回 Leitner 評分** — V0.5.0 拼字已是真回想，但結果純顯示、不影響排程；「中文答對但拼字全錯」目前會被判為認識而拉長到 30 天，等於漏掉一個已知的弱點。下版可讓拼字錯誤時預選「不認得」，或引入獨立的拼字盒
2. 醫學詞彙支援分類篩選（只練 RAD / 只練 RES 等）
3. 回合結束後顯示答錯詞列表供複習
4. 個別詞可標記「暫時略過」（太難或太生僻）
5. 把坑 P6（localStorage key 不隨 rename 變動）與 P7（人工搬移資料陣列必加 count assertion）回流到 Kit `cross-project-pitfalls.md`
6. 醫學詞庫外移成獨立 `medical.js`（classic script 設 window 全域，維持 file:// 相容），降低人工搬移掉詞風險

---

## 八、一句話總結

V0.5.1：修掉字典 API 的同形異義詞噪音（`year` 不再混入 here/hear 的方言釋義），只取主詞源 entry、濾變體拼法、同詞性合併（坑 P9）。下版第一優先是「拼字結果餵回 Leitner 評分」，因為現在拼字全錯仍可能被判為認識而拉長到 30 天，這個弱點被排程漏掉了。
