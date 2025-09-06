(function () {
  // 1) 取得 canvas（若有特定容器請改成精準選擇器，如 '#game canvas'）
  const canvas = document.querySelector('canvas');
  if (!canvas) return;

  // 1.1) 建立 UI 容器，將相關介面元素搬移進去以便統一縮放與位移
  const uiIds = [
    'hud-top-center',
    'debug-panel',
    'top-right',
    'touch-left',
    'touch-right',
    'stage-clear',
    'stage-fail',
    'ped-dialog',
  ];
  let uiLayer = document.getElementById('ui-layer');
  if (!uiLayer) {
    uiLayer = document.createElement('div');
    uiLayer.id = 'ui-layer';
    uiLayer.style.position = 'fixed';
    uiLayer.style.top = '0';
    uiLayer.style.left = '0';
    uiLayer.style.transformOrigin = 'top left';
    uiLayer.style.zIndex = '5';
    document.body.appendChild(uiLayer);
    uiIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) uiLayer.appendChild(el);
    });
  }

  // 2) 建立置中容器，將 canvas 包裝進去（只做一次）
  let stage = document.getElementById('canvas-stage');
  if (!stage) {
    stage = document.createElement('div');
    stage.id = 'canvas-stage';
    const parent = canvas.parentNode;
    parent.insertBefore(stage, canvas);
    stage.appendChild(canvas);
  }

  // 3) 動態樣式（Flex 置中 + 安全區）
  const style = document.createElement('style');
  style.textContent = `
    #canvas-stage{
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;       /* 垂直置中 */
      justify-content: center;   /* 水平置中 */
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
      background: transparent;   /* 需要黑邊可改 #000 */
      z-index: 0;
      touch-action: none;        /* 降低誤捲動 */
    }
  `;
  document.head.appendChild(style);

  // 4) 紀錄初始 CSS（方便還原）
  const initialStyle = {
    width: canvas.style.width,
    height: canvas.style.height,
    maxWidth: canvas.style.maxWidth,
    maxHeight: canvas.style.maxHeight,
    imageRendering: canvas.style.imageRendering,
  };

  // 5) 裝置與方向判斷
  const isMobile = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const isLandscape = () => (window.matchMedia ? window.matchMedia('(orientation: landscape)').matches
                                           : window.innerWidth >= window.innerHeight);

  // 6) 取得可視視口尺寸（優先 visualViewport 以相容 iOS 工具列收合）
  const getViewportSize = () => {
    const vv = window.visualViewport;
    return {
      w: Math.floor(vv?.width || window.innerWidth),
      h: Math.floor(vv?.height || window.innerHeight),
    };
  };

  // 7) 主邏輯：行動＋橫向 → 以「高度貼齊」並保持比例；否則還原
  function applyFit() {
    const { w: vw, h: vh } = getViewportSize();

    // 內部比例（以實際 internal resolution 優先，退回 offset 以避免 NaN）
    const iw = Math.max(1, canvas.width || canvas.offsetWidth || 1);
    const ih = Math.max(1, canvas.height || canvas.offsetHeight || 1);
    const aspect = iw / ih;

    let targetW = iw;
    let targetH = ih;
    let offsetX = 0;
    let offsetY = 0;

    if (isMobile() && isLandscape()) {
      // 以高度貼齊（vh 為可視高度），計算對應寬度
      targetH = vh;
      targetW = Math.round(targetH * aspect);

      // 若寬超過可視寬，回退為「貼齊寬」
      if (targetW > vw) {
        targetW = vw;
        targetH = Math.round(targetW / aspect);
      }

      // 僅改 CSS 尺寸（不動 internal resolution → 不改手感）
      canvas.style.width = `${targetW}px`;
      canvas.style.height = `${targetH}px`;
      canvas.style.maxWidth = '100vw';
      canvas.style.maxHeight = '100vh';
      canvas.style.imageRendering = 'pixelated'; // 像素風建議；非像素風可移除

      offsetX = Math.floor((vw - targetW) / 2);
      offsetY = Math.floor((vh - targetH) / 2);
    } else {
      // 還原 CSS
      canvas.style.width = initialStyle.width || '';
      canvas.style.height = initialStyle.height || '';
      canvas.style.maxWidth = initialStyle.maxWidth || '';
      canvas.style.maxHeight = initialStyle.maxHeight || '';
      canvas.style.imageRendering = initialStyle.imageRendering || '';

      const rect = canvas.getBoundingClientRect();
      targetW = rect.width || iw;
      targetH = rect.height || ih;
      offsetX = rect.left || 0;
      offsetY = rect.top || 0;
    }

    // 調整 UI 容器的縮放與位移，使其貼齊 canvas
    if (uiLayer) {
      uiLayer.style.width = `${iw}px`;
      uiLayer.style.height = `${ih}px`;
      const scale = targetW / iw;
      uiLayer.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    }
  }

  // 8) 去抖觸發
  const schedule = (() => {
    let raf = 0;
    return () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applyFit);
    };
  })();

  // 9) 事件監聽：工具列收合、旋轉、視窗尺寸變化
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', schedule, { passive: true });
  if (window.visualViewport) {
    visualViewport.addEventListener('resize', schedule, { passive: true });
    visualViewport.addEventListener('scroll', schedule, { passive: true }); // iOS Safari 工具列滑動
  }

  // 10) 初始化
  if (document.readyState === 'complete' || document.readyState === 'interactive') schedule();
  else document.addEventListener('DOMContentLoaded', schedule, { once: true });
})();

