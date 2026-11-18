/* ============================================================
   home.js —— 首页·找车位
   接口：GET /api/parks?keyword=&filter=
   期望返回：{ code: 200, data: [ { id, parkName, distanceKm, walkMin,
             freeSlots, totalSlots, pricePerHour, status } ] }
   status: open 营业中 / closed 已停业
   无后端联调时回退本地演示数据。
   ============================================================ */
(function () {
  const API_BASE = '/api';
  const API = { parks: API_BASE + '/parks' };

  const MOCK = [
    { id: 1, parkName: '万象城停车场',    distanceKm: 1.2, walkMin: 8,  freeSlots: 38, totalSlots: 200, pricePerHour: 10, status: 'open' },
    { id: 2, parkName: '市第一医院停车场', distanceKm: 2.4, walkMin: 15, freeSlots: 5,  totalSlots: 150, pricePerHour: 8,  status: 'open' },
    { id: 3, parkName: '科技园 A 区停车场', distanceKm: 3.1, walkMin: 20, freeSlots: 0,  totalSlots: 300, pricePerHour: 6,  status: 'open' },
    { id: 4, parkName: '朝阳公园停车场',  distanceKm: 4.0, walkMin: 30, freeSlots: 12, totalSlots: 100, pricePerHour: 9,  status: 'open' },
    { id: 5, parkName: '老城区地面停车场', distanceKm: 0.8, walkMin: 5,  freeSlots: 20, totalSlots: 60,  pricePerHour: 5,  status: 'closed' }
  ];

  let parks = [];
  let curFilter = 'all';
  let keyword = '';

  const list = document.getElementById('lotList');

  function freeClass(n) { return n > 10 ? 'text-success' : (n >= 1 ? 'text-warning' : 'text-danger'); }

  function cardHTML(p) {
    const closed = p.status === 'closed';
    const full = !closed && p.freeSlots === 0;
    const cls = closed ? 'lot-card lot-card--closed card' : (full ? 'lot-card lot-card--full card' : 'lot-card card');
    const freeTxt = closed ? '—' : (full ? '已满' : '剩余 ' + p.freeSlots);
    return '' +
      '<article class="' + cls + '" data-id="' + p.id + '">' +
      '  <div class="lot-card__head">' +
      '    <span class="lot-card__name">' + p.parkName + '</span>' +
      '    <span class="lot-card__price">' + (closed ? '—' : '¥' + p.pricePerHour) + '<small>/小时起</small></span>' +
      '  </div>' +
      '  <div class="lot-card__meta">' +
      '    <span class="tabular">' + p.distanceKm.toFixed(1) + ' km</span>' +
      '    <span>步行 ' + p.walkMin + ' 分钟</span>' +
      (closed ? '' : '    <span class="flex center gap2"><span class="dot-live"></span>实时</span>') +
      '  </div>' +
      '  <div class="lot-card__foot">' +
      '    <span class="' + (closed ? 'text-tertiary' : freeClass(p.freeSlots)) + '" style="font-size:14px;font-weight:600">' + freeTxt + '</span>' +
      (closed || full
        ? '    <button class="btn btn-sm btn-secondary" disabled>' + (closed ? '已停业' : '已满') + '</button>'
        : '    <button class="btn btn-sm btn-primary" data-act="reserve">预约</button>') +
      '  </div>' +
      '</article>';
  }

  function skeletonHTML() {
    return '<div class="card skel-card"><div class="skel-line" style="width:60%"></div><div class="skel-line" style="width:80%"></div><div class="skel-line" style="width:40%"></div></div>';
  }

  function emptyHTML(kw) {
    return '' +
      '<div class="empty">' +
      '  <svg class="empty__art" viewBox="0 0 120 120" fill="none" stroke="#CBD5E1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
      '    <circle cx="52" cy="52" r="26"/><path d="m72 72 18 18"/>' +
      '  </svg>' +
      '  <div class="empty__title">未找到匹配的车场</div>' +
      '  <div class="empty__desc">试试调整关键词或清除筛选条件</div>' +
      '  <button class="btn btn-md btn-primary" id="btnClearFilter">清除筛选</button>' +
      '</div>';
  }

  function applyAndRender() {
    let data = parks.filter(p => p.status === 'open' || curFilter !== 'near'); // 已停业仅保留展示
    if (keyword) data = data.filter(p => p.parkName.indexOf(keyword) > -1);
    if (curFilter === 'near') data = [...data].sort((a, b) => a.distanceKm - b.distanceKm);
    if (curFilter === 'cheap') data = [...data].sort((a, b) => a.pricePerHour - b.pricePerHour);
    if (curFilter === 'free') data = [...data].sort((a, b) => b.freeSlots - a.freeSlots);
    if (curFilter === 'month') data = data.filter(p => p.pricePerHour >= 8);
    if (!data.length) {
      list.innerHTML = emptyHTML(keyword);
      const btn = document.getElementById('btnClearFilter');
      if (btn) btn.addEventListener('click', () => {
        keyword = ''; document.getElementById('searchInput').value = '';
        curFilter = 'all';
        [...document.querySelectorAll('#filterChips .chip')].forEach(c => c.classList.toggle('active', c.dataset.f === 'all'));
        applyAndRender();
      });
      return;
    }
    list.innerHTML = data.map(cardHTML).join('');
    list.querySelectorAll('[data-act="reserve"]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      location.href = 'park-detail.html';
    }));
    list.querySelectorAll('.lot-card').forEach(c => c.addEventListener('click', () => {
      if (c.classList.contains('lot-card--closed')) { App.toast('该车场已停业', 'warning'); return; }
      location.href = 'park-detail.html';
    }));
  }

  // 搜索
  document.getElementById('searchInput').addEventListener('input', e => {
    keyword = e.target.value.trim();
    applyAndRender();
  });

  // 筛选 chips
  document.getElementById('filterChips').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    [...e.currentTarget.children].forEach(c => c.classList.toggle('active', c === chip));
    curFilter = chip.dataset.f;
    applyAndRender();
  });

  // 地图占位入口
  document.getElementById('btnMap').addEventListener('click', () => App.toast('将跳转第三方地图', 'info'));

  // 顶部订单入口
  document.getElementById('linkOrders').addEventListener('click', () => location.href = 'user-list.html');

  // 加载车场（先展示骨架屏）
  list.innerHTML = skeletonHTML() + skeletonHTML();
  fetch(API.parks, { method: 'GET' })
    .then(res => res.json())
    .then(r => {
      if (r && r.code === 200 && Array.isArray(r.data)) parks = r.data;
      else { parks = MOCK; App.toast('接口未就绪，已加载演示数据', 'warning'); }
      applyAndRender();
    })
    .catch(() => { parks = MOCK; App.toast('接口未就绪，已加载演示数据', 'warning'); applyAndRender(); });
})();
