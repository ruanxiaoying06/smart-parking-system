/* ============================================================
   智慧停车 · 前端共享脚本
   提供：Toast 提示、表单序列化、简易校验工具
   所有页面通过 <script src="./js/common.js"> 引入
   ============================================================ */
(function () {
  window.App = window.App || {};

  // 顶部/底部 Toast 提示（不自动 dismiss 之外的红色报错由调用方控制）
  App.toast = function (msg, type) {
    var wrap = document.getElementById('toastWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'toast-wrap';
      wrap.id = 'toastWrap';
      document.body.appendChild(wrap);
    }
    var t = document.createElement('div');
    t.className = 'toast';
    var dot = type === 'success' ? '#4ADE80'
             : type === 'error'   ? '#F87171'
             : type === 'warning' ? '#FBBF24'
             : '#60A5FA';
    t.innerHTML = '<span style="color:' + dot + '">●</span><span>' + msg + '</span>';
    wrap.appendChild(t);
    setTimeout(function () {
      t.style.opacity = '0';
      t.style.transition = 'opacity .3s';
      setTimeout(function () { t.remove(); }, 300);
    }, 2600);
  };

  // 序列化表单为对象，name 使用小驼峰（与后端属性名一致）
  App.serialize = function (form) {
    var data = {};
    var els = form.querySelectorAll('input, select, textarea');
    els.forEach(function (el) {
      if (!el.name) return;
      if (el.type === 'checkbox') data[el.name] = el.checked;
      else if (el.type === 'radio') { if (el.checked) data[el.name] = el.value; }
      else data[el.name] = el.value.trim();
    });
    return data;
  };

  // 中国大陆手机号校验
  App.validPhone = function (p) { return /^1[3-9]\d{9}$/.test(p); };
})();
