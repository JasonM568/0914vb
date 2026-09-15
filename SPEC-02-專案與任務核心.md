# SPEC-02 專案與任務核心

## 1. 文件資訊

- 版本：0.1
- 日期：2026-09-14
- 狀態：已確認，可開發
- 相依：SPEC-01

## 2. 概述

提供專案、任務、子任務與收件匣整理能力。每一個任務必須且只能隸屬一個專案。

## 3. 範圍

### 包含

- 建立、編輯、封存專案
- 專案狀態與截止日期
- 快速新增任務
- 任務狀態、優先級、截止日期、標籤
- 今日焦點與阻塞標記
- 子任務
- 備註與外部連結
- 專案間移動任務

### 明確不做

- 專案巢狀專案
- 任務相依性
- 重複任務
- 附件上傳
- 任務指派與留言

## 4. 技術環境與約束

- 沿用 SPEC-01 技術棧與身份隔離。
- 專案採單層結構；任務可有多層子任務，但 UI 第一版以單層子任務操作為主。
- 快速新增只要求任務名稱，其餘欄位使用預設值。

## 5. 相依與執行順序

1. 建立 tags、tasks、task_tags、subtasks schema
2. 實作專案 CRUD 與狀態轉換
3. 實作任務 CRUD 與專案移動
4. 實作子任務與完成邏輯
5. 實作收件匣整理
6. 實作任務詳情頁

## 6. 資料模型

### tasks

- id：uuid，主鍵
- owner_id：uuid，外鍵 profiles.id
- project_id：uuid，外鍵 projects.id，不可為空
- parent_task_id：uuid，可為空，自我外鍵
- title：text，不可為空
- description：text，可為空
- status：enum，todo／in_progress／completed／cancelled／blocked
- priority：enum，critical／high／normal／low，預設 normal
- due_at：timestamptz，可為空
- is_today_focus：boolean，預設 false
- blocked_reason：text，可為空
- estimated_minutes：integer，可為空且不得小於 0
- external_url：text，可為空
- completed_at：timestamptz，可為空
- created_at、updated_at：timestamptz

### tags

- id、owner_id、name、color、created_at
- 同一 owner 的 name 不可重複

### task_tags

- task_id、tag_id，複合主鍵

## 7. 角色與權限

使用者只能操作自己的專案、任務、子任務與標籤。收件匣是特殊專案，不可刪除；可以改名但不可取消其收件匣識別。

## 8. 任務清單

- 實作專案 CRUD、狀態與封存
- 實作任務 CRUD 與欄位驗證
- 實作快速新增與收件匣整理
- 實作任務移動專案
- 實作標籤建立、套用、移除
- 實作子任務完成狀態
- 實作今日焦點與阻塞標記
- 實作任務詳情與備註／外部連結

## 9. 驗收標準與非功能

- 無 project_id 的任務無法建立或儲存。
- 快速新增後任務出現在收件匣、狀態為待處理、優先級為一般。
- 任務可移動至其他專案，且原專案不再顯示該任務。
- 任務可新增多個標籤並可移除。
- 父任務完成時，未完成子任務必須有明確提示；不得靜默遺失。
- blocked 狀態可保存阻塞原因。
- 截止日期可為空，不得強制填寫。

## 10. 待確認／給 Agent 的執行指示

- 專案完成率只計算父任務：已完成父任務數／父任務總數。
- 沒有父任務的專案顯示「尚未開始」，不顯示 100%。
- 子任務完成不直接增加專案完成率，需由父任務完成後計入。
