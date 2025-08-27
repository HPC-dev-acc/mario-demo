# DESIGN.md 
## 1. 系統架構概觀
- **前端單頁**：`index.html` 掛載 Canvas 與 HUD；以 `<div id="stage">` 維持 **16:9** 比例，Canvas 與 HUD 等比縮放。
- **渲染**：Canvas 2D，基於邏輯座標（上限 **960×540**），實際解析度 = CSS 大小 × `devicePixelRatio`，**禁用平滑** 確保像素銳利。
- **遊戲引擎子系統**
  - **Loop**：`update(dt)` → `render()`；`requestAnimationFrame` 時序。
  - **輸入**：鍵盤（Left/Right/Jump/Slide）、觸控（虛擬按鍵）。
  - **物理**：重力、加速度、速度整合；AABB 碰撞。
  - **碰撞網格**：**24px 子格**、2×2 `mask` 支援半格/自訂圖樣。
  - **相機**：玩家超過視窗 **60%** 門檻時水平卷動。
  - **AI/NPC**：右入→行走/停頓/奔跑→左出；踩踏、側撞反應；**紅燈暫停**。
  - **UI/HUD**：齒輪選單（ℹ、版本、⚙）、Info/Debug 面板、倒數計時、全螢幕切換、語系。
  - **PWA**：`manifest.json`、`sw.js` 快取；版本化與資源更新。
  - **i18n**：語言選擇器影響 UI 與對話字串（建議：以 `i18n.<lang>.json`/常數表管理）。

## 2. 檔案與模組對應
- `index.html`：Canvas 與 HUD 範本、起始頁（START）、通關/失敗覆蓋層、語言選擇器、腳本載入順序（`version.js` → `hud.js` → `main.js` 等）。
- `style.css`：`#stage` 比例盒、HUD 藥丸（pills）、對話泡泡（含紅燈圖示）、觸控按鈕尺寸與透明度、覆蓋層樣式。
- `main.js`：初始化資源、遊戲 loop、狀態機（Start/Playing/Clear/Fail/Paused）、相機與碰撞、NPC 生成、倒數計時與事件分派。
- `hud.js`：齒輪選單、Info/Debug、語言切換、版本顯示、全螢幕控制與 Restart 綁定。
- `orientation-guard.js`：行動直向偵測與覆蓋層，進入橫向後恢復。
- `landscape-fit-height.js`：行動橫向「**fit-height**」算法，追蹤瀏覽器 UI 變化，維持畫面置中。
- `sw.js`：PWA 快取名與檔案白名單；版本升級策略（建議：`skipWaiting` + 客製更新提示）。
- `manifest.json`：名稱、圖示、display 模式（fullscreen/standalone），iOS/Android 安裝設定。
- `version.js`：版本常數（例如 `2.0.0`）。
- `assets/objects.custom.js`：關卡物件清單與碰撞圖樣（**資料檔**）；美術資產（sprite/tiles/music）。
- `tests/*.test.js`：Jest 測試（HUD、樣式、起始頁、行人燈與滑行、橫向適配、OL 行走動畫等）。
- `docs/`、`scripts/`、`src/`：文件、工具腳本與（若有）模組化來源檔（可視實際內容補完）。
- `.github/workflows/`：CI（lint/test/部署 GitHub Pages）。
- `package.json`：開發指令（`test`, `build`, `serve` 等）、Jest/Babel 設定。

## 3. 遊戲狀態與流程
```mermaid
flowchart LR
S[Start Page] -->|START| P[Playing]
P -->|Reach Goal| C[Stage Clear]
P -->|Time Up| F[Fail]
C -->|Restart| P
F -->|Restart| P
P -->|Mobile Portrait| O[Orientation Guard \n(Paused)]
O -->|Rotate Landscape| P
```

## 4. 主要資料結構（建議型）
```ts
type Vec2 = { x:number, y:number }
type HitBox = { w:number, h:number, ox?:number, oy?:number }

interface Entity {
  id:string; type:'player'|'npc'|'light'|'coin'|'block';
  pos:Vec2; vel:Vec2; dir:1|-1; onGround:boolean;
  state:string; // 'idle'|'run'|'jump'|'slide'|'stun'...
  hitbox:HitBox; anim?:{sheet:string, frame:number, t:number};
}

interface TrafficLight { phase:'green'|'blink'|'red'; t:number; area:{x:number,y:number,w:number,h:number} }

interface LevelObject { id:string; kind:string; cell:{x:number,y:number}; mask:[0|1,0|1,0|1,0|1]; solid?:boolean; trigger?:boolean }
```

## 5. 座標與渲染
- **邏輯座標**：以 16:9 基準（上限 **960×540**）；當 CSS 尺寸超過基準時，以 `renderScale` 放大 sprites 與地圖。
- **Canvas DPR**：`canvas.width = cssWidth * devicePixelRatio`（同理 height）；`ctx.imageSmoothingEnabled = false`。
- **可視範圍裁剪**：僅渲染相機視口內之瓦片與物件，降低 fill rate。

## 6. 物理與碰撞
- **整合**：`vel += gravity*dt`，`pos += vel*dt`；落地歸零 `vy`、給予彈跳。
- **AABB**：以 24px 子格與 2×2 `mask` 做細緻邊界；上衝不解碰撞（避免頭頂上方誤碰，僅落下時處理）。
- **行人燈特例**：垂直碰撞忽略，側向穿越不改變垂直速度；但在 **紅燈** 時，鄰近角色 `onHold=true`（暫停/顯示對話）。

## 7. AI / NPC
- **生成**：每 **4–8s** 生成一次，避免重複同型（`createNpc({type,facing})`）。
- **互動**：踩踏彈跳（第 3 次穿越）、側撞雙方 **knockback**，NPC 短暫硬直。
- **OL 角色**：尺寸略大，對應碰撞盒與獨立走/被撞動畫。

## 8. UI / HUD / i18n
- **HUD**：右上齒輪選單；Info 面板（玩法說明）、Debug 面板（位置/速度/碰撞格顯示）；版本 pill 顯示 `version.js`。
- **計時**：1 分倒數，**最後 10 秒閃爍**。
- **語系**：英文/日文/繁中/簡中（建議將字串集中管理）；重來按鈕依語系切換標籤。
- **觸控**：行動裝置顯示方向與跳躍/滑行按鍵，透明不遮擋視覺。

## 9. 全螢幕與裝置方向
- **全螢幕**：以 `#stage` 容器請求，全畫面無拉伸；以黑邊維持 16:9。
- **方向守門**：直向顯示遮罩並 **暫停**（同時靜音 BGM），橫向後恢復並解除遮罩。
- **Fit-Height**：監聽 `resize`/`fullscreenchange` 調整 CSS 與 `data-css-scale-x`，確保背景/滾動同步。

## 10. PWA 設計
- **快取**：核心 JS/CSS/圖檔版本化；`install` 預快取、`fetch` 快取優先或網路優先（視資產類型），`activate` 清理舊快取。
- **更新**：`skipWaiting + clients.claim`（建議）並在 HUD 顯示「有新版本」提示。

## 11. 測試策略（Jest）
- **單元**：`hud.test.js`, `style.test.js`, `orientation-guard.test.js`, `landscape-fit-height.test.js`, `ol-walk-sprites.test.js`, `start-page.test.js`, `redLightSlide.test.js`。
- **整合**（建議補）：相機卷動、碰撞邊界、PWA 安裝流程、語系切換。
- **覆蓋率門檻**（建議）：行數 80%/分支 70% 起。

## 12. 目錄與建置（建議）
```
/assets           # sprites / 音效 / 關卡資料(objects.custom.js)
/src              # 引擎/物理/AI/渲染模組（若使用）
/docs             # 文檔（本檔/需求/設計/關卡規格）
/tests            # Jest 測試
.github/workflows # CI：Lint / Test / Pages 部署
index.html style.css main.js hud.js sw.js manifest.json version.js
```

## 13. 擴充與待辦
- 關卡編輯模式 UI 化（現有 24px 格與旋轉 `Q` 鍵能力可延伸）。
- 多關卡與資源分流（按世界/關卡載入）。
- 音效/音量設定、手把支援、可及性（無障礙）細節。
