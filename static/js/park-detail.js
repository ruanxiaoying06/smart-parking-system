/* ============================================================
   park-detail.js —— 车场详情·选时段
   交互：日期切换、时段选择（已满/冲突不可选）、余位实时刷新
   立即预约 → user-form.html（携带所选时段，经 localStorage 传递）
   ============================================================ */
(function () {
  const API = { slots: '/api/parks/1/slots' };   // 期望返回：{ code:200, data:{ keepUntil:"15:00" } }

  let curSlot = null;   // { time, price }
  let curDate = '09-08';

  // 日期切换
  document.getElementById('dateRow').addEventListener('click', e => {
    const chip = e.target.closest('.date-chip');
    if (!chip) return;
    [...e.currentTarget.children].forEach(c => c.classList.toggle('active', c === chip));
    curDate = chip.dataset.date;
    App.toast('已切换到 ' + curDate, 'info');
  });

  // 时段选择：已满 / 冲突不可选
  document.getElementById('slotGrid').addEventListener('click', e => {
    const slot = e.target.closest('.slot-time');
    if (!slot) return;
    if (slot.classList.contains('full')) { App.toast('该时段车位已满', 'warning'); return; }
    if (slot.classList.contains('conflict')) { App.toast('该时段与已有预约冲突', 'warning'); return; }
    [...e.currentTarget.children].forEach(s => s.classList.toggle('selected', s === slot));
    curSlot = { date: curDate, time: slot.dataset.t, price: +slot.dataset.p };
    App.toast('已选 ' + curDate + ' ' + curSlot.time, 'success');
  });

  // 立即预约 → 预约确认页
  document.getElementById('btnReserve').addEventListener('click', () => {
    if (!curSlot) { App.toast('请先选择时段', 'warning'); return; }
    try { localStorage.setItem('smartparking.slot', JSON.stringify(curSlot)); } catch (err) { /* 隐私模式忽略 */ }
    location.href = 'user-form.html';
  });
})();
