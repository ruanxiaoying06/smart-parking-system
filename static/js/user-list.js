/* ============================================================
   user-list.js —— 我的订单列表页逻辑
   接口：GET /api/orders
   期望返回：{ code: 200, data: [ { id, plateNo, parkName, orderStatus,
              reserveStart, reserveEnd, amount, createTime } ] }
   无后端联调时回退本地演示数据渲染，不抛未捕获异常。
   ============================================================ */
(function () {
  const API_BASE = '/api';
  const API = { orders: API_BASE + '/orders' };

  // 订单状态 → 徽标文案与样式
  const STATUS_MAP = {
    reserved:  { text: '预约中', cls: 'badge-primary' },
    parking:   { text: '在停',   cls: 'badge-warning' },
    paid:      { text: '已完成', cls: 'badge-success' },
    cancelled: { text: '已取消', cls: 'badge-neutral' },
    expired:   { text: '已释放', cls: 'badge-muted' }
  };

  let allOrders = [];
  let curStatus = 'all';

  // 演示数据（无后端时使用）
  const MOCK = [
    { id: 1, plateNo: '京A·12345', parkName: '万象城停车场',   orderStatus: 'reserved',  reserveStart: '2026-09-08 10:00', reserveEnd: '2026-09-08 13:00', amount: 22.00 },
    { id: 2, plateNo: '沪B·6T82K', parkName: '市第一医院停车场', orderStatus: 'parking',   reserveStart: '2026-09-08 09:10', reserveEnd: '—',                 amount: 16.00 },
    { id: 3, plateNo: '京A·12345', parkName: '科技园 A 区停车场', orderStatus: 'paid',      reserveStart: '2026-09-07 14:00', reserveEnd: '2026-09-07 17:30', amount: 33.00 },
    { id: 4, plateNo: '粤C·9F21M', parkName: '万象城停车场',    orderStatus: 'expired',   reserveStart: '2026-09-06 19:00', reserveEnd: '2026-09-06 19:30', amount: 4.40 },
    { id: 5, plateNo: '京A·12345', parkName: '科技园 A 区停车场', orderStatus: 'cancelled', reserveStart: '2026-09-05 11:00', reserveEnd: '2026-09-05 12:00', amount: 0.00 }
  ];

  const fmtMoney = n => '¥' + (Number(n) || 0).toFixed(2);

  function emptyHTML() {
    return '' +
      '<div class="empty">' +
      '  <svg class="empty__art" viewBox="0 0 120 120" fill="none" stroke="#CBD5E1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
      '    <rect x="20" y="34" width="80" height="58" rx="10"/>' +
      '    <path d="M20 52h80"/><path d="M40 52V36a20 20 0 0 1 40 0v16"/>' +
      '    <circle cx="60" cy="68" r="2" fill="#CBD5E1" stroke="none"/>' +
      '  </svg>' +
      '  <div class="empty__title">还没有预约记录</div>' +
      '  <div class="empty__desc">去首页找车位，提前锁定更省心</div>' +
      '  <button class="btn btn-md btn-primary" onclick="location.href=\'index.html\'">去找车位</button>' +
      '</div>';
  }

  function cardHTML(o) {
    const s = STATUS_MAP[o.orderStatus] || STATUS_MAP.cancelled;
    const time = o.reserveEnd && o.reserveEnd !== '—'
      ? (o.reserveStart + ' – ' + o.reserveEnd)
      : (o.reserveStart + ' 至今');
    return '' +
      '<article class="order-card card" data-id="' + o.id + '">' +
      '  <div class="order-card__head">' +
      '    <span class="order-card__name">' + o.parkName + '</span>' +
      '    <span class="badge ' + s.cls + '">' + s.text + '</span>' +
      '  </div>' +
      '  <div class="order-card__plate tabular text-secondary text-sm">' + o.plateNo + '</div>' +
      '  <div class="order-card__time text-xs text-tertiary">' + time + '</div>' +
      '  <div class="divider"></div>' +
      '  <div class="order-card__foot">' +
      '    <span class="text-xs text-tertiary">预估 <span class="tabular amount">' + fmtMoney(o.amount) + '</span></span>' +
      '    <div class="flex gap2">' +
      '      <button class="btn btn-sm btn-secondary" data-act="cancel">取消</button>' +
      '      <button class="btn btn-sm btn-primary" data-act="detail">查看</button>' +
      '    </div>' +
      '  </div>' +
      '</article>';
  }

  function render() {
    const list = document.getElementById('orderList');
    const data = curStatus === 'all' ? allOrders : allOrders.filter(o => o.orderStatus === curStatus);
    if (!data.length) { list.innerHTML = emptyHTML(); return; }
    list.innerHTML = data.map(cardHTML).join('');
    list.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      const id = +b.closest('.order-card').dataset.id;
      if (b.dataset.act === 'detail') location.href = 'order-detail.html';
      else if (b.dataset.act === 'cancel') App.toast('取消预约（待对接 DELETE /api/orders/' + id + '）', 'info');
    }));
  }

  // 状态筛选
  document.getElementById('orderTabs').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    [...e.currentTarget.children].forEach(b => b.classList.toggle('active', b === btn));
    curStatus = btn.dataset.status;
    render();
  });

  // 加载订单
  fetch(API.orders, { method: 'GET' })
    .then(res => res.json())
    .then(r => {
      if (r && r.code === 200 && Array.isArray(r.data)) {
        allOrders = r.data;
      } else {
        allOrders = MOCK;
        App.toast('接口未就绪，已加载演示数据', 'warning');
      }
      render();
    })
    .catch(() => {
      allOrders = MOCK;
      App.toast('接口未就绪，已加载演示数据', 'warning');
      render();
    });
})();
