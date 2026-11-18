/* ============================================================
   admin-slots.js —— 车位管理（矩阵 + 批量置位）
   接口：
     GET  /api/admin/slots?area=B1-A          期望返回 { code:200, data:[{code,status}] }
     POST /api/admin/slots/batch-status       参数 { codes:[], status } 期望返回 { code:200 }
   状态：free/reserved/occupied/maintain/locked/full（颜色 + 角标双编码）
   ============================================================ */
(function () {
  const API = {
    slots: '/api/admin/slots',
    batch: '/api/admin/slots/batch-status'
  };

  const STATUS_MAP = {
    free:      { tag: '空', cls: 'slot-free' },
    reserved:  { tag: '预', cls: 'slot-reserved' },
    occupied:  { tag: '占', cls: 'slot-occupied' },
    maintain:  { tag: '维', cls: 'slot-maintain' },
    locked:    { tag: '锁', cls: 'slot-locked' },
    full:      { tag: '满', cls: 'slot-full' }
  };

  // 演示数据：B1-A 区 48 位（页面展示 48 块）
  function genSlots() {
    const arr = [];
    const pattern = ['free', 'occupied', 'reserved', 'free', 'maintain', 'occupied', 'locked', 'free'];
    for (let i = 1; i <= 48; i++) {
      arr.push({ code: 'A-' + String(i).padStart(2, '0'), status: pattern[i % pattern.length] });
    }
    return arr;
  }
  let slots = genSlots();
  const selected = new Set();
  let curStatus = 'all';
  let curKeyword = '';

  const matrix = document.getElementById('slotMatrix');
  const batchBar = document.getElementById('batchBar');

  function render() {
    const data = slots.filter(s =>
      (curStatus === 'all' || s.status === curStatus) &&
      (!curKeyword || s.code.toLowerCase().indexOf(curKeyword) > -1));
    matrix.innerHTML = data.map(s => {
      const m = STATUS_MAP[s.status];
      const sel = selected.has(s.code) ? ' selected' : '';
      return '<div class="slot-block ' + m.cls + sel + '" data-code="' + s.code + '" title="' + s.code + ' ' + m.tag + '">' +
             s.code.replace('A-', '') + '<span class="tag">' + m.tag + '</span></div>';
    }).join('') || '<div class="empty" style="min-height:160px;width:100%"><div class="empty__title">无匹配车位</div><div class="empty__desc">调整筛选条件或关键词</div></div>';
    updateBar();
  }

  function updateBar() {
    document.getElementById('selCount').textContent = selected.size;
    batchBar.classList.toggle('show', selected.size > 0);
  }

  // 点选车位（再次点击取消）
  matrix.addEventListener('click', e => {
    const block = e.target.closest('.slot-block');
    if (!block) return;
    const code = block.dataset.code;
    if (selected.has(code)) selected.delete(code); else selected.add(code);
    block.classList.toggle('selected');
    updateBar();
  });

  // 状态筛选 / 搜索
  document.getElementById('statusFilter').addEventListener('change', e => { curStatus = e.target.value; render(); });
  document.getElementById('slotSearch').addEventListener('input', e => { curKeyword = e.target.value.trim().toLowerCase(); render(); });

  // 分区树切换（演示：重绘矩阵）
  document.getElementById('areaTree').addEventListener('click', e => {
    const item = e.target.closest('.tree__item');
    if (!item || item.classList.contains('tree__sub')) return;
    [...e.currentTarget.querySelectorAll('.tree__item')].forEach(t => t.classList.toggle('active', t === item));
    selected.clear();
    render();
    App.toast('已切换到 ' + item.textContent.trim(), 'info');
  });

  // 批量置位：调用 POST /api/admin/slots/batch-status，参数 { codes, status }
  batchBar.addEventListener('click', e => {
    const btn = e.target.closest('[data-op]');
    if (!btn) return;
    const op = btn.dataset.op;
    if (op === 'cancel') { selected.clear(); render(); return; }
    // 期望返回：{ code: 200 }
    fetch(API.batch, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes: [...selected], status: op })
    }).catch(() => { /* 无后端静默，前端本地生效 */ });
    slots.forEach(s => { if (selected.has(s.code)) s.status = op; });
    App.toast('已将 ' + selected.size + ' 个车位置为「' + STATUS_MAP[op].tag + '」', 'success');
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

  render();
})();
