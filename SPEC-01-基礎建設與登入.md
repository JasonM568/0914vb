# SPEC-01 基礎建設與登入

## 1. 文件資訊

- 版本：0.1
- 日期：2026-09-14
- 狀態：已確認，可開發
- 相依：無

## 2. 概述

建立單人待辦／專案管理系統的應用基礎、Google OAuth 登入、使用者資料隔離與共用資料表結構。第一期以單人使用為主，但資料模型預留未來多人協作。

## 3. 範圍

### 包含

- 響應式網頁應用程式
- Google OAuth 登入與登出
- 使用者基本資料
- 使用者只能存取自己的資料
- Supabase 資料庫與驗證
- Vercel 部署設定
- 內建收件匣專案初始化

### 明確不做

- Email／推播通知
- 團隊邀請與角色權限 UI
- Google Calendar／Drive 同步
- AI 功能
- 原生 Mac／iPhone App

## 4. 技術環境與約束

- 前端：響應式 Web UI
- 身份驗證與資料庫：Supabase
- OAuth Provider：Google
- 部署：Vercel
- 所有資料庫查詢必須在伺服器端驗證目前使用者身份
- 不得將服務端密鑰暴露到瀏覽器

## 5. 相依與執行順序

1. 建立專案與環境變數
2. 建立 Supabase Auth 與資料庫 migration
3. 實作 Google OAuth callback
4. 建立 session 保護與登出
5. 首次登入建立 profile 與收件匣專案
6. 實作資料隔離測試

## 6. 資料模型

### profiles

- id：uuid，等同 auth.users.id，主鍵
- email：text，不可為空
- display_name：text，可為空
- avatar_url：text，可為空
- created_at、updated_at：timestamptz

### projects

- id：uuid，主鍵
- owner_id：uuid，外鍵 profiles.id
- name：text，不可為空
- description：text，可為空
- status：enum，not_started／active／paused／completed／archived
- due_date：date，可為空
- color：text，可為空
- is_inbox：boolean，預設 false
- created_at、updated_at：timestamptz

限制：同一 owner 只能有一個 is_inbox=true 的收件匣專案。

## 7. 角色與權限

第一期只有 authenticated user。使用者只能讀寫 owner_id 等於自己的 profiles、projects 與後續任務資料。未登入者只能查看登入頁。

## 8. 任務清單

- 建立基礎 Web 專案與環境變數範例
- 建立 Supabase migration、enum 與索引
- 實作 Google 登入、登出與 session 保護
- 實作首次登入初始化 profile／收件匣
- 建立 RLS policies
- 補上登入、登出、跨帳號隔離測試

## 9. 驗收標準與非功能

- 未登入訪問受保護頁面會被導向登入頁。
- Google 登入成功後可進入今日首頁。
- 首次登入自動建立一個收件匣專案。
- 同一使用者重複登入不會建立第二個收件匣。
- 使用者 A 無法透過 API、URL 或篩選查到使用者 B 的資料。
- OAuth secret 與 Supabase service role key 不出現在前端 bundle。

## 10. 待確認／給 Agent 的執行指示

- Google OAuth client ID、Supabase URL／key、Vercel 專案資訊以部署環境變數提供。
- 若實作細節未定義，優先選擇可回滾的 migration 與明確錯誤訊息，不得繞過 RLS。
