/* ============================================================
   order-result.js —— 预约成功 / 支付结果页
   交互：入场倒计时（≤3 分钟变红提示即将超时）、双出口导航、失败态重试
   接口：POST /api/orders/{id}/pay/retry  期望返回 { code:200 }
   ============================================================ */
(function () {
  // —— 倒计时：从 14:32 递减 ——
  const cdEl = document.getElementById('cdTime');
  const cdBox = document.getElementById('countdown');
  let total = 14 * 60 + 32;
  function renderCD() {
    const m = String(Math.floor(total / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    cdEl.textContent = m + ':' + s;
    cdBox.classList.toggle('urgent', total <= 180);
  }
  renderCD();
  setInterval(() => {
    if (total > 0) { total--; renderCD(); }
    else App.toast('预约已超时，车位已释放', 'error');
  }, 1000);

  // —— 双出口 ——
  document.getElementById('btnViewOrder').addEventListener('click', () => location.href = 'user-list.html');
  document.getElementById('btnBackHome').addEventListener('click', () => location.href = 'home.html');

  // —— 失败态操作（演示占位） ——
  // 重新支付：调用 POST /api/orders/1/pay/retry，期望返回 { code: 200, data: { payUrl: "..." } }
  document.getElementById('btnRetryPay').addEventListener('click', () => {
    fetch('/api/orders/1/pay/retry', { method: 'POST' })
      .catch(() => { /* 无后端静默 */ });
    App.toast('已发起重新支付（演示）', 'info');
  });
  document.getElementById('btnChangePay').addEventListener('click', () => location.href = 'user-form.html');
})();
