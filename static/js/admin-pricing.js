/* ============================================================
   admin-pricing.js —— 计费规则配置 + 费用试算器
   接口：POST /api/admin/pricing/save  参数为表单序列化结果
   期望返回：{ code: 200, data: { appliedParks: 3 } }
   计费逻辑（与设计稿 C7 明细一致）：
     0–30 分钟免费；31–60 分钟按首小时；61 分钟起每 30 分钟一个单元
     （不足一个单元按一个单元计）→ ×车型系数 → 比每日封顶/夜间上限取低
   ============================================================ */
(function () {
  const API = { save: '/api/admin/pricing/save' };
  const round2 = n => Math.round(n * 100) / 100;

  function markError(input, on) {
    const f = input.closest('.field');
    f.classList.toggle('invalid', !!on);
    input.classList.toggle('error', !!on);
  }

  // —— 试算器 ——
  function calc() {
    const s = new Date(document.getElementById('calcStart').value);
    const e = new Date(document.getElementById('calcEnd').value);
    const coef = parseFloat(document.getElementById('calcCarType').value);
    const firstHour = parseFloat(document.getElementById('firstHourPrice').value) || 10;
    const unitMin = parseInt(document.getElementById('unitMinutes').value) || 30;
    const unitPrice = parseFloat(document.getElementById('unitPrice').value) || 3;
    const freeMin = parseInt(document.getElementById('freeMinutes').value) || 0;
    const dailyCap = parseFloat(document.getElementById('dailyCap').value) || 60;
    const nightOn = document.getElementById('nightEnabled').checked;
    const nightCap = parseFloat(document.getElementById('nightCap').value) || 15;

    const box = document.getElementById('calcResult');
    if (isNaN(s) || isNaN(e) || e <= s) {
      box.innerHTML = '<div class="text-danger text-sm">请输入有效的入场 / 出场时间（出场需晚于入场）</div>';
      return;
    }
    const mins = Math.ceil((e - s) / 60000);
    const rows = [];
    let total = 0;

    if (mins <= freeMin) {
      rows.push(['免费时长 ' + mins + ' 分钟', 0]);
    } else {
      rows.push(['免费时长 ' + freeMin + ' 分钟', 0]);
      const after = mins - freeMin;
      if (after <= 60) {
        rows.push(['首小时（' + after + ' 分钟）', firstHour]);
        total += firstHour;
      } else {
        rows.push(['首小时', firstHour]);
        total += firstHour;
        const units = Math.ceil((after - 60) / unitMin);
        const amt = round2(units * unitPrice);
        rows.push(['后续 ' + units + ' × ¥' + unitPrice.toFixed(2) + ' / ' + unitMin + ' 分钟', amt]);
        total += amt;
      }
    }

    // 车型系数
    if (coef !== 1) {
      const diff = round2(total * (coef - 1));
      rows.push(['车型系数 ×' + coef, diff]);
      total = round2(total * coef);
    }

    // 封顶（夜间上限与每日封顶取低者）
    let capNote = '';
    const isNight = nightOn && (s.getHours() >= 22 || s.getHours() < 8);
    const cap = isNight ? Math.min(dailyCap, nightCap) : dailyCap;
    if (total > cap) {
      rows.push(['已触发' + (isNight ? '夜间' : '每日') + '封顶 ¥' + cap.toFixed(2), round2(cap - total)]);
      total = cap;
      capNote = isNight ? '夜间 22:00–08:00 单次上限 ¥' + nightCap.toFixed(2) + '，与日封顶取低者' : '每日封顶 ¥' + cap.toFixed(2);
    }

    box.innerHTML =
      rows.map(r => '<div class="calc-row"><span class="text-tertiary">' + r[0] + '</span><span class="tabular">' +
        (r[1] < 0 ? '−' : '') + '¥' + Math.abs(r[1]).toFixed(2) + '</span></div>').join('') +
      '<div class="calc-total"><span class="fw600">合计（' + mins + ' 分钟）</span><span class="amt">¥' + total.toFixed(2) + '</span></div>' +
      (capNote ? '<div class="mt3"><span class="cap-hit">已达封顶</span> <span class="text-xs text-tertiary">' + capNote + '</span></div>' : '');
  }
  document.getElementById('btnCalc').addEventListener('click', calc);
  ['calcStart', 'calcEnd', 'calcCarType'].forEach(id =>
    document.getElementById(id).addEventListener('change', calc));
  calc();

  // —— 保存并应用 ——
  const btn = document.getElementById('btnSavePricing');
  btn.addEventListener('click', () => {
    // 校验必填数值
    let ok = true;
    ['freeMinutes', 'firstHourPrice', 'unitMinutes', 'unitPrice', 'dailyCap'].forEach(id => {
      const el = document.getElementById(id);
      const bad = el.value === '' || Number(el.value) < 0;
      markError(el, bad);
      if (bad) ok = false;
    });
    if (!ok) { App.toast('请检查标红的表单项', 'warning'); return; }

    btn.classList.add('is-loading');
    const data = App.serialize(document.getElementById('pricingForm'));
    // 期望返回：{ code: 200, data: { appliedParks: 3 } }
    fetch(API.save, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(r => { if (r && r.code === 200) App.toast('规则已保存并应用', 'success'); else App.toast('保存失败，请重试', 'error'); })
      .catch(() => App.toast('接口未就绪，规则仅本地演示', 'warning'))
      .finally(() => btn.classList.remove('is-loading'));
  });

  // —— 取消 ——
  document.getElementById('btnReset').addEventListener('click', () => {
    document.getElementById('pricingForm').reset();
    calc();
    App.toast('已恢复默认值', 'info');
  });

  // —— 车场切换器 ——
  const parks = ['万象城停车场', '市第一医院停车场', '科技园 A 区停车场'];
  let idx = 0;
  document.getElementById('parkSwitcher').addEventListener('click', () => {
    idx = (idx + 1) % parks.length;
    document.getElementById('curPark').textContent = parks[idx];
    App.toast('已切换至 ' + parks[idx], 'info');
  });
})();
