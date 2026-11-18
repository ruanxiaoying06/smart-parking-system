/* ============================================================
   admin-orders.js —— 订单管理（筛选 + 表格 + 批量操作）
   接口：
     GET  /api/admin/orders?plate=&status=&date=
          期望返回 { code:200, data:[ { orderId, plateNo, parkName,
                   reserveStart, reserveEnd, amount, orderStatus } ] }
     POST /api/admin/orders/batch-refund   参数 { orderIds:[] } 期望 { code:200 }
     POST /api/admin/orders/batch-settle   参数 { orderIds:[] } 期望 { code:200 }
   状态：reserved/parking/paid/refunding/refunded/unpaid/expired
   ============================================================ */
(function () {
  const API = {
    orders: '/api/admin/orders',
    refund: '/api/admin/orders/batch-refund',
    settle: '/api/admin/orders/batch-settle'
  };

  const STATUS_MAP = {
    reserved:  { text: '预约中', cls: 'badge-primary' },
    parking:   { text: '在停',   cls: 'badge-warning' },
    paid:      { text: '已完成', cls: 'badge-success' },
    refunding: { text: '退款中', cls: 'badge-warning' },
    refunded:  { text: '已退款', cls: 'badge-neutral' },
    unpaid:    { text: '待支付', cls: 'badge-danger' },
    expired:   { text: '已超时', cls: 'badge-muted' }
  };

  const MOCK = [
    { orderId: 'ORD20260908001', plateNo: '京A·12345', parkName: '万象城停车场',   reserveStart: '09-08 10:24', reserveEnd: '—',            amount: 10.00, orderStatus: 'parking' },
    { orderId: 'ORD20260908002', plateNo: '沪B·6T82K', parkName: '万象城停车场',   reserveStart: '09-08 09:10', reserveEnd: '—',            amount: 16.00, orderStatus: 'unpaid' },
    { orderId: 'ORD20260907018', plateNo: '粤C·9F21M', parkName: '万象城停车场',   reserveStart: '09-07 14:00', reserveEnd: '09-07 17:30', amount: 33.00, orderStatus: 'paid' },
    { orderId: 'ORD20260907011', plateNo: '京A·12345', parkName: '万象城停车场',   reserveStart: '09-07 08:00', reserveEnd: '09-07 09:00', amount: 10.00, orderStatus: 'refunding' },
    { orderId: 'ORD20260906033', plateNo: '苏E·77K2P', parkName: '万象城停车场',   reserveStart: '09-06 19:00', reserveEnd: '09-06 21:10', amount: 13.00, orderStatus: 'refunded' },
    { orderId: 'ORD20260906029', plateNo: '京A·12345', parkName: '万象城停车场',   reserveStart: '09-06 15:00', reserveEnd: '—',            amount: 4.40,  orderStatus: 'expired' }
  ];

  let orders = [];
  const selected = new Set();
  const tbody = document.getElementById('orderTbody');
  const batchBar = document.getElementById('batchBar');

  function filtered() {
    const plate = document.getElementById('fPlate').value.trim();
    const st = document.getElementById('fStatus').value;
    return orders.filter(o =>
      (!plate || o.plateNo.indexOf(plate) > -1) &&
      (st === 'all' || o.orderStatus === st));
  }

  function render() {
    const data = filtered();
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty" style="min-height:200px">' +
        '<div class="empty__title">无匹配订单</div><div class="empty__desc">调整筛选条件后重新查询</div></div></td></tr>';
      updateBar();
      return;
    }
    tbody.innerHTML = data.map(o => {
      const s = STATUS_MAP[o.orderStatus] || STATUS_MAP.paid;
      const sel = selected.has(o.orderId) ? ' class="selected"' : '';
      const chk = selected.has(o.orderId) ? ' checked' : '';
      return '<tr data-id="' + o.orderId + '"' + sel + '>' +
        '<td><input type="checkbox" class="rowChk"' + chk + '></td>' +
        '<td class="tabular">' + o.orderId + '</td>' +
        '<td class="tabular">' + o.plateNo + '</td>' +
        '<td>' + o.parkName + '</td>' +
        '<td class="tabular">' + o.reserveStart + ' – ' + o.reserveEnd + '</td>' +
        '<td class="tabular">¥' + o.amount.toFixed(2) + '</td>' +
        '<td><span class="badge ' + s.cls + ' badge-sm">' + s.text + '</span></td>' +
        '<td><button class="btn btn-sm btn-text" data-act="detail">详情</button></td></tr>';
    }).join('');
    updateBar();
  }

  function updateBar() {
    document.getElementById('selCount').textContent = selected.size;
    batchBar.classList.toggle('show', selected.size > 0);
    const all = tbody.querySelectorAll('.rowChk');
    document.getElementById('chkAll').checked = all.length > 0 && [...all].every(c => c.checked);
  }

  // 行复选框
  tbody.addEventListener('change', e => {
    if (!e.target.classList.contains('rowChk')) return;
    const id = e.target.closest('tr').dataset.id;
    if (e.target.checked) selected.add(id); else selected.delete(id);
    e.target.closest('tr').classList.toggle('selected', e.target.checked);
    updateBar();
  });

  // 全选
  document.getElementById('chkAll').addEventListener('change', e => {
    selected.clear();
    if (e.target.checked) filtered().forEach(o => selected.add(o.orderId));
    render();
  });

  // 查询 / 重置
  // 查询：调用 GET /api/admin/orders?plate=&status=&date=，期望返回 { code:200, data:[...] }
  document.getElementById('btnQuery').addEventListener('click', () => {
    const plate = document.getElementById('fPlate').value.trim();
    const st = document.getElementById('fStatus').value;
    const date = document.getElementById('fDate').value;
    fetch(API.orders + '?plate=' + encodeURIComponent(plate) + '&status=' + st + '&date=' + date, { method: 'GET' })
      .then(res => res.json())
      .then(r => { if (r && r.code === 200 && Array.isArray(r.data)) { orders = r.data; render(); } })
      .catch(() => App.toast('接口未就绪，筛选本地演示数据', 'warning'));
    render();
  });
  document.getElementById('btnClear').addEventListener('click', () => {
    document.getElementById('fPlate').value = '';
    document.getElementById('fStatus').value = 'all';
    render();
  });

  // 行内详情
  tbody.addEventListener('click', e => {
    const btn = e.target.closest('[data-act="detail"]');
    if (btn) App.toast('打开订单详情抽屉（待对接）', 'info');
  });

  // 批量操作（不可逆操作二次确认）
  batchBar.addEventListener('click', e => {
    const btn = e.target.closest('[data-op]');
    if (!btn) return;
    const op = btn.dataset.op;
    if (op === 'cancel') { selected.clear(); render(); return; }
    const ids = [...selected];
    if (!ids.length) return;
    if (op === 'settle' && !confirm('强制结算不可逆，确认对 ' + ids.length + ' 个订单强制结算？')) return;
    // 期望返回：{ code: 200 }
    fetch(op === 'refund' ? API.refund : API.settle, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIds: ids })
    }).catch(() => { /* 无后端静默 */ });
    if (op === 'refund') orders.forEach(o => { if (selected.has(o.orderId)) o.orderStatus = 'refunding'; });
    else orders = orders.filter(o => !selected.has(o.orderId));
    App.toast('已对 ' + ids.length + ' 个订单执行「' + (op === 'refund' ? '退款' : '强制结算') + '」', 'success');
    selected.clear();
    render();
  });

  // 车场切换器
  const parks = ['万象城停车场', '市第一医院停车场', '科技园 A 区停车场'];
  let idx = 0;
  document.getElementById('parkSwitcher').addEventListener('click', () => {
    idx = (idx + 1) % parks.length;
    document.getElementById('curPark').textContent = parks[idx];
    App.toast('已切换至 ' + parks[idx], 'info');
  });

  // 初始加载（无后端时使用演示数据）
  fetch(API.orders, { method: 'GET' })
    .then(res => res.json())
    .then(r => { if (r && r.code === 200 && Array.isArray(r.data)) orders = r.data; else { orders = MOCK; App.toast('接口未就绪，已加载演示数据', 'warning'); } render(); })
    .catch(() => { orders = MOCK; render(); });
})();
