/* ============================================================
   order-detail.js —— 订单详情·在场与计费支付
   交互：在场时长秒级递增（等宽数字）、立即支付
   接口：POST /api/orders/pay  参数 { orderId, payType, amount }
   期望返回：{ code: 200, data: { paid: true } }
   ============================================================ */
(function () {
  // —— 在场计时：从 02:14:30 起本地秒级递增（设计规范：等宽数字防跳字） ——
  const timeEl = document.getElementById('stayTime');
  let sec = 2 * 3600 + 14 * 60 + 30;
  function renderTime() {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    timeEl.textContent = h + ':' + m + ':' + s;
  }
  renderTime();
  setInterval(() => { sec++; renderTime(); }, 1000);

  // —— 立即支付 ——
  const btn = document.getElementById('btnPayNow');
  btn.addEventListener('click', () => {
    btn.classList.add('is-loading');
    // 期望返回：{ code: 200, data: { paid: true } }
    fetch('/api/orders/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'ORD20260908001', payType: 'wechat', amount: 10.00 })
    })
      .then(res => res.json())
      .then(r => {
        if (r && r.code === 200) location.href = 'order-result.html';
        else App.toast('支付失败，请重试', 'error');
      })
      .catch(() => App.toast('接口未就绪，演示跳转支付结果', 'warning'))
      .finally(() => setTimeout(() => { location.href = 'order-result.html'; }, 600));
  });
})();
