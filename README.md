<div align="center">
  <img src="assets/sela.svg" width="96" alt="SELA"/>
  <h1>Gecko Grip</h1>
  <p>英文單字記憶 — 讓單字像壁虎腳掌一樣黏住不放</p>
</div>

---

## 簡介

Leitner 五盒間隔重複演算法，幫助你高效記憶英文單字。
看英文 → 想中文 → `Space` 揭示 → 評分，答對的拉長複習間隔，答錯的明天再考。

雙詞庫：9,858 個通用英文高頻字（Google 兆詞語料庫詞頻排序）+ 252 個醫學專業詞彙（病房臨床 / 檢驗影像 / 腫瘤科 / 放射腫瘤 / 研究論文），兩庫各自獨立追蹤進度。

發音優先播放字典真人錄音，離線或查無音檔時改用系統語音。

按 `T` 可加做拼字測試 — **開啟時上方英文會反向遮蔽成底線**（`_ _ _ _ _`，只留字數提示），憑記憶輸入、確認後才揭曉正確拼字並比對。

## 使用方式

雙擊 `index.html`，或部署到 GitHub Pages。無需安裝、無帳號、完全離線可用。

```bash
# 本機預覽（推薦）
python -m http.server 8000
# 開 http://localhost:8000
```

## 操作快捷鍵

| 鍵 | 動作 |
|---|---|
| `Space` | 顯示中文意思 |
| `1` | 不認得（重回 Box 1，之後每日出現直到答對） |
| `2` | 認識（升一盒，間隔拉長） |
| `P` | 播放發音 |
| `T` | 展開／收起拼字測試（開啟時英文遮蔽） |

## Leitner 五盒

| 盒 | 複習間隔 |
|---|---|
| Box 1 | 每日 |
| Box 2 | 隔日 |
| Box 3 | 三天 |
| Box 4 | 兩週 |
| Box 5 | 一個月（精通） |

## 目錄結構

```
Gecko Grip/
├── index.html          主程式（含詞庫、邏輯、樣式）
├── assets/
│   └── sela.svg        SELA 品牌標識
├── favicon/            完整 favicon 套組
├── CLAUDE.md           給 Claude 的工作上下文
├── README.md           本檔
└── .gitignore
```

## 進度保存

存於瀏覽器 localStorage，零帳號、零 PII。換裝置請至「設定 · 進度備份」匯出 JSON 後匯入。

## 版本

V0.5.1（前身為 SELA Vocab V0.1.0–V0.3.0）

---

> Made by **SELA** · V0.5.1
