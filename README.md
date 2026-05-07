# 不要掛電話｜互動鬼故事 Demo v3

這是使用 AI 協作製作的互動式網頁 Demo，可直接上傳 GitHub Pages。

## v3 修正重點

- 修正 v2「背景圖已內嵌文字與 UI，HTML 又覆蓋一次」的問題
- 一般場景背景圖改為「無字純底圖」
- 角色名牌、對話文字、選項按鈕全部改由 HTML / CSS 動態疊加
- 首頁標題與開始按鈕也改由 HTML 顯示，避免圖片內文字不可控
- 保留 Jump scare 特規演出：鬼影、黑霧、震動、閃屏、Glitch、Scanline
- 小螢幕手機仍可垂直捲動，按鈕不會被遮住

## 檔案結構

```text
index.html
style.css
script.js
assets/
  images/
  audio/
  raw/
```

## 素材分層原則

- 一般場景圖：只放場景與物件，不放文字、不放按鈕、不放對話框
- UI 文字：統一由 HTML / CSS 呈現
- Jump scare：鬼影用 PNG 疊圖，特效用 CSS / JS
- Ending 圖：可保留少量海報式設計字，但重新開始按鈕由 HTML 呈現

## GitHub Pages

1. 建立 repository
2. 上傳本資料夾內所有檔案
3. Settings → Pages
4. Source: Deploy from a branch
5. Branch: main / root
6. Save

若看不到頁面，請確認 `index.html` 在根目錄，並等待 1–3 分鐘。
