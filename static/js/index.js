/* ============================================================
   index.js —— 登录/注册页交互逻辑
   对接接口（路径集中声明，不硬编码散落）：
     POST /api/login    登录
     POST /api/register 注册
     POST /api/sms/send 发送短信验证码
   说明：不要求真联调，fetch 完整写出；无后端时捕获异常并提示演示数据。
   ============================================================ */
(function () {
  const API_BASE = '/api';
  const API = {
    login:    API_BASE + '/login',
    register: API_BASE + '/register',
    sendSms:  API_BASE + '/sms/send'
  };

  /* ---------- 登录 / 注册 Tab 切换 ---------- */
  const tabs = document.getElementById('authTabs');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    [...tabs.children].forEach(b => b.classList.toggle('active', b === btn));
    const isLogin = btn.dataset.tab === 'login';
    loginForm.style.display = isLogin ? '' : 'none';
    registerForm.style.display = isLogin ? 'none' : '';
  });

  /* ---------- 错误标记工具 ---------- */
  function markError(input, on) {
    const f = input.closest('.field');
    f.classList.toggle('invalid', !!on);
    input.classList.toggle('error', !!on);
  }

  /* ---------- 发送验证码（带 60s 倒计时） ---------- */
  const btnSend = document.getElementById('btnSendCode');
  let smsTimer = null;
  btnSend.addEventListener('click', () => {
    const phone = document.getElementById('regPhone');
    if (!App.validPhone(phone.value)) { markError(phone, true); App.toast('请先填写正确的手机号', 'warning'); return; }
    markError(phone, false);
    fetch(API.sendSms, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 期望返回：{ code: 200, data: { sent: true } }
      body: JSON.stringify({ phone: phone.value })
    }).catch(() => { /* 无后端联调时静默，仅走本地倒计时 */ });

    let n = 60;
    btnSend.disabled = true;
    btnSend.textContent = n + 's';
    smsTimer = setInterval(() => {
      n--;
      btnSend.textContent = n + 's';
      if (n <= 0) { clearInterval(smsTimer); btnSend.disabled = false; btnSend.textContent = '获取验证码'; }
    }, 1000);
    App.toast('验证码已发送（演示）', 'success');
  });

  /* ---------- 登录 ---------- */
  const btnLogin = document.getElementById('btnLogin');
  btnLogin.addEventListener('click', () => {
    const phone = document.getElementById('loginPhone');
    const pwd = document.getElementById('loginPwd');
    let ok = true;
    if (!App.validPhone(phone.value)) { markError(phone, true); ok = false; } else markError(phone, false);
    if (!pwd.value) { markError(pwd, true); ok = false; } else markError(pwd, false);
    if (!ok) return;

    btnLogin.classList.add('is-loading');
    const data = App.serialize(loginForm);
    // 期望返回：{ code: 200, data: { token: "xxx", userId: 1, phone: "138****0001" } }
    fetch(API.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(r => { if (r && r.code === 200) { App.toast('登录成功', 'success'); setTimeout(() => { location.href = 'home.html'; }, 800); } else App.toast('登录失败，请检查手机号或密码', 'error'); })
      .catch(() => App.toast('网络异常，使用演示数据进入', 'warning'))
      .finally(() => btnLogin.classList.remove('is-loading'));
  });

  /* ---------- 注册 ---------- */
  const btnRegister = document.getElementById('btnRegister');
  btnRegister.addEventListener('click', () => {
    const phone = document.getElementById('regPhone');
    const code = document.getElementById('regCode');
    const pwd = document.getElementById('regPwd');
    const agree = document.getElementById('regAgree');
    let ok = true;
    if (!App.validPhone(phone.value)) { markError(phone, true); ok = false; } else markError(phone, false);
    if (!/^\d{6}$/.test(code.value)) { markError(code, true); ok = false; } else markError(code, false);
    if (!/^[A-Za-z0-9]{6,20}$/.test(pwd.value)) { markError(pwd, true); ok = false; } else markError(pwd, false);
    if (!agree.checked) { agree.closest('.field').classList.add('invalid'); ok = false; }
    else agree.closest('.field').classList.remove('invalid');
    if (!ok) return;

    btnRegister.classList.add('is-loading');
    const data = App.serialize(registerForm);
    // 期望返回：{ code: 200, data: { userId: 1, token: "xxx" } }
    fetch(API.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(r => { if (r && r.code === 200) { App.toast('注册成功', 'success'); setTimeout(() => { location.href = 'home.html'; }, 800); } else App.toast('注册失败', 'error'); })
      .catch(() => App.toast('网络异常，使用演示数据进入', 'warning'))
      .finally(() => btnRegister.classList.remove('is-loading'));
  });

  /* ---------- 第三方登录占位 ---------- */
  ['btnWechat', 'btnAlipay', 'btnApple'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => App.toast('第三方登录需后端配置 OAuth', 'info'));
  });
})();
