/* ============================================================
   admin-login.js —— 后台登录页
   接口：POST /api/admin/login
   期望返回：{ code: 200, data: { token, role: "parkAdmin" | "superAdmin" } }
   ============================================================ */
(function () {
  const API = { login: '/api/admin/login' };

  // —— 图形验证码（前端演示：随机 4 位） ——
  const capEl = document.getElementById('captchaImg');
  let captcha = '';
  function refreshCaptcha() {
    captcha = Math.random().toString(36).slice(2, 6).toUpperCase();
    capEl.textContent = captcha;
  }
  capEl.addEventListener('click', refreshCaptcha);
  refreshCaptcha();

  function markError(input, on) {
    const f = input.closest('.field');
    f.classList.toggle('invalid', !!on);
    input.classList.toggle('error', !!on);
  }

  // —— 登录 ——
  const btn = document.getElementById('btnAdminLogin');
  btn.addEventListener('click', () => {
    const acc = document.getElementById('accAccount');
    const pwd = document.getElementById('accPwd');
    const cap = document.getElementById('accCaptcha');
    let ok = true;
    if (!acc.value.trim()) { markError(acc, true); ok = false; } else markError(acc, false);
    if (!pwd.value) { markError(pwd, true); ok = false; } else markError(pwd, false);
    if (cap.value.trim().toUpperCase() !== captcha) { markError(cap, true); ok = false; } else markError(cap, false);
    if (!ok) return;

    btn.classList.add('is-loading');
    const data = App.serialize(document.getElementById('adminLoginForm'));
    // 期望返回：{ code: 200, data: { token: "xxx", role: "parkAdmin" } }
    fetch(API.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(r => {
        if (r && r.code === 200) location.href = 'admin-dashboard.html';
        else App.toast('登录失败，请检查账号或密码', 'error');
      })
      .catch(() => App.toast('接口未就绪，演示进入数据看板', 'warning'))
      .finally(() => setTimeout(() => { location.href = 'admin-dashboard.html'; }, 600));
  });
})();
