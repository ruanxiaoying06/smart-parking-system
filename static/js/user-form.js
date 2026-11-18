/* ============================================================
   user-form.js —— 预约确认与支付页逻辑
   接口：POST /api/orders/save
   期望返回：{ code: 200, data: { orderId: 1, reserveCode: "824619" } }
   字段（小驼峰，与后端属性一致）：plateNo, payType, amount, parkId
   ============================================================ */
(function () {
  const API_BASE = '/api';
  const API = { save: API_BASE + '/orders/save' };

  const form = document.getElementById('reserveForm');
  const plateSelect = document.getElementById('plateSelect');
  const btnAddPlate = document.getElementById('btnAddPlate');
  const addPlateBox = document.getElementById('addPlateBox');
  const btnConfirmPlate = document.getElementById('btnConfirmPlate');
  const newPlate = document.getElementById('newPlate');
  const payList = document.getElementById('payList');
  const btnPay = document.getElementById('btnPay');

  // 中国车牌宽松校验：省份汉字 + 字母 + 5~6 位字母数字（可含间隔点）
  const PLATE_RE = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z][A-Z][·\s]?[A-Z0-9]{5,6}$/;

  /* ---------- 返回 ---------- */
  document.getElementById('btnBack').addEventListener('click', () => App.toast('返回上一页（待对接路由）', 'info'));

  /* ---------- 新增车牌展开 ---------- */
  btnAddPlate.addEventListener('click', () => {
    addPlateBox.style.display = addPlateBox.style.display === 'none' ? 'block' : 'none';
  });
  btnConfirmPlate.addEventListener('click', () => {
    const v = newPlate.value.trim();
    if (!PLATE_RE.test(v)) {
      newPlate.closest('.field').classList.add('invalid');
      return;
    }
    newPlate.closest('.field').classList.remove('invalid');
    const opt = document.createElement('option');
    opt.value = v; opt.textContent = v;
    plateSelect.appendChild(opt);
    plateSelect.value = v;
    newPlate.value = '';
    addPlateBox.style.display = 'none';
    App.toast('车牌已保存', 'success');
  });

  /* ---------- 支付方式：单选高亮 ---------- */
  payList.addEventListener('change', e => {
    if (e.target.name !== 'payType') return;
    [...payList.querySelectorAll('.pay-item')].forEach(it =>
      it.classList.toggle('active', it.contains(e.target)));
  });

  /* ---------- 提交预约（支付） ---------- */
  btnPay.addEventListener('click', () => {
    const plate = plateSelect.value;
    if (!plate) { App.toast('请先选择或新增车牌', 'warning'); return; }

    btnPay.classList.add('is-loading');
    const data = App.serialize(form);
    data.parkId = 1;                 // 演示用停车场 ID
    data.amount = 4.40;             // 预约金金额（与页面显示一致）

    // 期望返回：{ code: 200, data: { orderId: 1, reserveCode: "824619" } }
    fetch(API.save, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(r => {
        if (r && r.code === 200) location.href = 'order-result.html';
        else App.toast('提交失败，请重试', 'error');
      })
      .catch(() => App.toast('接口未就绪，演示跳转预约结果', 'warning'))
      .finally(() => setTimeout(() => { location.href = 'order-result.html'; }, 600));
  });
})();
