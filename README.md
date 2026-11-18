# 智慧停车场预约与计费系统 · 静态前端作业

> 学号-姓名占位，提交前请替换为真实学号与姓名（目录名、zip 名同步修改）。

## 一、页面清单（12 页，覆盖 Ardot 设计稿全部屏幕）

### C 端（车主，移动优先 390）
| 文件 | 作用 |
|---|---|
| `static/index.html` | 登录/注册（首页入口，双 Tab 表单，必交） |
| `static/home.html` | 首页·找车位（搜索 + 筛选 + 车场卡片列表 + 骨架屏/空态/停业态） |
| `static/park-detail.html` | 车场详情·选时段（费率说明 + 日期/时段选择器） |
| `static/user-form.html` | 预约确认与支付（车牌选择/新增 + 预约金构成 + 支付方式，必交表单页） |
| `static/order-result.html` | 预约成功/支付结果（预约码 + 15 分钟入场倒计时 + 失败态） |
| `static/user-list.html` | 我的订单列表（状态分段筛选 + 订单卡 + 空态，必交列表页） |
| `static/order-detail.html` | 订单详情·在场与计费（实时计时 + 计费明细时间轴 + 支付） |

### 管理后台（1440 桌面）
| 文件 | 作用 |
|---|---|
| `static/admin-login.html` | 后台登录（品牌区 + 账号/密码/图形验证码） |
| `static/admin-dashboard.html` | 数据看板（6 指标卡 + 趋势折线 + 出租率环形 + 异常/车场健康表格） |
| `static/admin-slots.html` | 车位管理（分区树 + 车位矩阵六态色块 + 批量置位操作条） |
| `static/admin-pricing.html` | 计费规则配置（四段表单 + 右侧实时费用试算器） |
| `static/admin-orders.html` | 订单管理（筛选 + 表格 + 批量退款/强制结算） |

## 二、运行方式
将 `static/` 原样拷入 SpringBoot 工程的 `src/main/resources/static/`，启动后访问：
- `http://localhost:8080/index.html`（C 端入口，登录后进入 home.html）
- `http://localhost:8080/user-list.html` / `user-form.html`（必交三件套）
- `http://localhost:8080/admin-login.html`（后台入口）

页面间已真实跳转互联：index → home → park-detail → user-form → order-result；user-list ↔ order-detail；admin-login → admin-dashboard → 其余后台页。

## 三、接口约定表
| 方法 | 路径 | 请求参数(name) | 期望返回 |
|---|---|---|---|
| POST | `/api/login` | phone, password, remember | `{code:200,data:{token}}` |
| POST | `/api/register` | phone, smsCode, password, agreement | `{code:200,data:{userId,token}}` |
| POST | `/api/sms/send` | phone | `{code:200,data:{sent:true}}` |
| GET | `/api/parks` | keyword, filter | `{code:200,data:[{id,parkName,distanceKm,walkMin,freeSlots,totalSlots,pricePerHour,status}]}` |
| POST | `/api/orders/save` | plateNo, payType, amount, parkId | `{code:200,data:{orderId,reserveCode}}` |
| POST | `/api/orders/pay` | orderId, payType, amount | `{code:200,data:{paid:true}}` |
| GET | `/api/orders` | — | `{code:200,data:[{id,plateNo,parkName,orderStatus,reserveStart,reserveEnd,amount}]}` |
| POST | `/api/admin/login` | account, password, captcha, remember | `{code:200,data:{token,role}}` |
| GET | `/api/admin/dashboard` | parkId | `{code:200,data:{metrics,trend7d,trend30d}}` |
| GET | `/api/admin/slots` | area | `{code:200,data:[{code,status}]}` |
| POST | `/api/admin/slots/batch-status` | codes, status | `{code:200}` |
| POST | `/api/admin/pricing/save` | freeMinutes, firstHourPrice, unitMinutes, unitPrice, dailyCap, nightCap, coefSmall, coefNewEnergy, coefLarge, depositPercent, depositCap, keepMinutes… | `{code:200,data:{appliedParks}}` |
| GET | `/api/admin/orders` | plate, status, date | `{code:200,data:[{orderId,plateNo,parkName,reserveStart,reserveEnd,amount,orderStatus}]}` |
| POST | `/api/admin/orders/batch-refund` | orderIds | `{code:200}` |
| POST | `/api/admin/orders/batch-settle` | orderIds | `{code:200}` |

## 四、待办说明
- 接口未接入真实后端：列表/表格/车场数据均以本地演示数据兜底，未做真联调。
- 验证码倒计时、车位保留倒计时、在场计时为前端本地演示。
- 批量退款/强制结算的二次确认使用原生 `confirm()`，可替换为统一弹窗组件。
- 地图、车牌识别为占位入口；暗色模式变量已定义但页面默认亮色。
