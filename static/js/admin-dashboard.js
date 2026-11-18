/* ============================================================
   admin-dashboard.js —— 数据看板
   接口：GET /api/admin/dashboard?parkId=
   期望返回：{ code: 200, data: { metrics:{...}, trend7d:[], trend30d:[], ... } }
   无后端联调时使用页面静态演示数据。
   ============================================================ */
(function () {
  const API = { dashboard: '/api/admin/dashboard' };

  // —— 车场切换器 ——
  const parks = ['万象城停车场', '市第一医院停车场', '科技园 A 区停车场'];
  let curParkIdx = 0;
  const sw = document.getElementById('parkSwitcher');
  sw.addEventListener('click', () => {
    curParkIdx = (curParkIdx + 1) % parks.length;
    document.getElementById('curPark').textContent = parks[curParkIdx];
    App.toast('已切换至 ' + parks[curParkIdx] + '（待对接 GET /api/admin/dashboard）', 'info');
  });

  // —— 趋势图 7 日 / 30 日切换（两组静态 SVG path 演示） ——
  const PATHS = {
    '7d': {
      line: 'M20,158 L107,134 L193,174 L280,110 L367,81 L453,126 L540,59',
      area: 'M20,158 L107,134 L193,174 L280,110 L367,81 L453,126 L540,59 L540,190 L20,190 Z'
    },
    '30d': {
      line: 'M20,170 L107,150 L193,160 L280,120 L367,130 L453,95 L540,70',
      area: 'M20,170 L107,150 L193,160 L280,120 L367,130 L453,95 L540,70 L540,190 L20,190 Z'
    }
  };
  document.getElementById('trendTabs').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    [...e.currentTarget.children].forEach(b => b.classList.toggle('active', b === btn));
    const p = PATHS[btn.dataset.range];
    document.getElementById('linePath').setAttribute('d', p.line);
    document.getElementById('areaPath').setAttribute('d', p.area);
  });

  // —— 异常处理 / 车场详情（占位） ——
  // 处理异常：调用 PUT /api/admin/exceptions/{id}/handle，期望返回 { code: 200 }
  document.querySelectorAll('[data-act="handle"]').forEach(b =>
    b.addEventListener('click', () => App.toast('打开异常处理（待对接 /api/admin/exceptions）', 'info')));
  document.querySelectorAll('[data-act="detail"]').forEach(b =>
    b.addEventListener('click', () => App.toast('打开车场详情抽屉（待对接）', 'info')));

  // —— 更新时间 ——
  const now = new Date();
  document.getElementById('updatedAt').textContent =
    String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
})();
