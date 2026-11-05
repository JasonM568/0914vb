# LINE 圖卡發送器（個人帳號用）

用 LIFF 的 `shareTargetPicker` 把 Flex Message 以「你自己的名字」發到好友或群組。
不需要官方帳號 Bot，也不用把 Bot 拉進群組。

本資料夾放在 `public/line-card/`，Vite 建置時會原封不動複製到輸出，
部署後的路徑是 `<你的網域>/line-card/`。

## 設定步驟（只有你的 LINE 與 Vercel 帳號能做）

1. **取得公開網址**：Vercel 專案 → Settings → Deployment Protection，
   確認 **Production** 沒有開 Vercel Authentication（預覽部署預設有保護，LIFF 無法通過）。
   合併 PR 後，正式網址即 `https://<專案網域>/line-card/`。
2. 到 [LINE Developers](https://developers.line.biz/console/) 建立 Provider，
   再建立 **LINE Login channel**。
3. 進該 channel → **LIFF** 分頁 → Add：
   - Endpoint URL：`https://<專案網域>/line-card/`（需 https）
   - Size：Full
   - Scopes：`profile`
   - **Share target picker：開啟（ON）**
4. 取得 LIFF ID（`1234567890-AbCdEfGh`），貼到 `index.html` 最上方的 `LIFF_ID`，
   commit 後重新部署。
5. 在 LINE 內開 `https://liff.line.me/<LIFF ID>` → 填內容 → 分享到 LINE → 選群組。

## 注意

- 必須在 LINE App 內開 `liff.line.me` 連結才能分享（外部瀏覽器支援度有限）。
- 每次分享都要手動選對象並確認，無法排程或自動發送。
- `altText` 會顯示在聊天列表與通知，請寫成一句摘要。
- 想預覽排版：按「複製 JSON」，貼到 Flex Message Simulator。
- 配色：底 `#0e1a2a`、框 `#1b2b3d`、強調 `#f6a83a`、小字 `#94a4b8`。
- 此頁面是公開網址，`LIFF_ID` 不是機密，可以放在程式碼裡。
