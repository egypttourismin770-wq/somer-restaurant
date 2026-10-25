<template>
  <main class="orders-dashboard" dir="rtl">
    <header class="orders-header">
      <a :href="siteUrl" class="orders-brand" aria-label="العودة إلى سومر">
        <span class="orders-brand-mark">S</span>
        <span><strong>سومر</strong><small>لوحة الأوردرات</small></span>
      </a>
      <div class="orders-header-actions">
        <button v-if="loggedIn" class="orders-secondary-button" type="button" @click="loadOrders" :disabled="loading">
          {{ loading ? 'جاري التحديث...' : '↻ تحديث الأوردرات' }}
        </button>
        <a class="orders-secondary-button" :href="siteUrl">العودة للموقع</a>
        <button v-if="loggedIn" class="orders-danger-button" type="button" @click="logout">تسجيل خروج</button>
      </div>
    </header>

    <section v-if="!loggedIn" class="orders-login-wrap">
      <div class="orders-login-card">
        <span class="orders-eyebrow">SUMER · STAFF AREA</span>
        <h1>دخول لوحة الأوردرات</h1>
        <p>اللوحة دي مخصصة لمتابعة الطلبات وتحديث مراحلها فقط. مش بتعرض المنيو أو إيصالات الدفع أو إعدادات الموقع.</p>
        <form @submit.prevent="login">
          <label>البريد الإلكتروني
            <input v-model.trim="email" type="email" autocomplete="username" required placeholder="بريد حساب الموظف" />
          </label>
          <label>كلمة المرور
            <input v-model="password" type="password" autocomplete="current-password" required minlength="8" placeholder="كلمة المرور" />
          </label>
          <p v-if="error" class="orders-error" role="alert">{{ error }}</p>
          <button class="orders-primary-button" type="submit" :disabled="authBusy">
            {{ authBusy ? 'جاري التحقق...' : 'دخول لوحة الأوردرات' }}
          </button>
        </form>
        <small class="orders-muted">لو حساب الموظف مش مضاف للوحة الأوردرات، اطلب من مدير الموقع تفعيل الصلاحية.</small>
      </div>
    </section>

    <section v-else class="orders-content">
      <div class="orders-page-title">
        <div>
          <span class="orders-eyebrow">SUMER OPERATIONS</span>
          <h1>الطلبات الواردة</h1>
          <p>حدّث حالة الطلب في كل مرحلة علشان باقي الفريق والعميل يتابعوا التقدم.</p>
        </div>
        <div class="orders-updated" v-if="updatedAt">آخر تحديث: {{ formatTime(updatedAt) }}</div>
      </div>

      <div class="orders-stats">
        <button v-for="filter in filters" :key="filter.id" type="button"
          class="orders-stat" :class="{ active: activeFilter === filter.id }"
          @click="activeFilter = filter.id">
          <span>{{ filter.label }}</span><strong>{{ filterCount(filter.id) }}</strong>
        </button>
      </div>

      <p v-if="notice" class="orders-notice" role="status">{{ notice }}</p>
      <p v-if="error" class="orders-error" role="alert">{{ error }}</p>
      <div v-if="loading && !orders.length" class="orders-empty">جاري تحميل الأوردرات...</div>
      <div v-else-if="filteredOrders.length === 0" class="orders-empty">
        مفيش أوردرات في التصنيف ده حاليًا.
      </div>

      <div v-else class="orders-grid">
        <article v-for="order in filteredOrders" :key="order.orderNumber" class="staff-order-card">
          <div class="staff-order-card-top">
            <div>
              <span class="orders-small-label">رقم الأوردر</span>
              <h2>#{{ order.orderNumber }}</h2>
              <small class="orders-date">{{ formatTime(order.createdAt) }}</small>
            </div>
            <span class="staff-status-pill" :class="'status-' + order.status">{{ statusLabel(order.status) }}</span>
          </div>

          <div class="staff-order-customer">
            <strong>{{ order.customerName || 'عميل' }}</strong>
            <a :href="'tel:' + order.phone">{{ order.phone }}</a>
            <a v-if="order.backupPhone" :href="'tel:' + order.backupPhone" class="orders-secondary-phone">رقم بديل: {{ order.backupPhone }}</a>
          </div>

          <div class="staff-order-address">
            <span class="orders-small-label">عنوان التوصيل</span>
            <p>{{ [order.areaName, order.streetAddress, order.building ? 'مبنى ' + order.building : '', order.floor ? 'الدور ' + order.floor : '', order.apartment ? 'شقة ' + order.apartment : ''].filter(Boolean).join('، ') || 'العنوان غير مكتمل' }}</p>
          </div>

          <div class="staff-order-items">
            <span class="orders-small-label">الأصناف</span>
            <div v-for="item in order.items" :key="item.id" class="staff-order-line">
              <span>{{ item.name }}</span><strong>× {{ item.quantity }}</strong>
            </div>
            <p v-if="order.notes" class="staff-order-notes"><strong>ملاحظات:</strong> {{ order.notes }}</p>
          </div>

          <div class="staff-order-summary">
            <div><span>قيمة الأصناف</span><strong>{{ money(order.subtotal) }}</strong></div>
            <div><span>التوصيل</span><strong>{{ money(order.deliveryFee) }}</strong></div>
            <div class="staff-total-row"><span>الإجمالي</span><strong>{{ money(order.total) }}</strong></div>
            <div><span>وقت التوصيل التقديري</span><strong>{{ formatDeliveryMinutes(order.deliveryMinutes) }}</strong></div>
          </div>

          <div v-if="order.preparationDeadlineAt && !['ready','out_for_delivery','delivered','cancelled'].includes(order.status)" class="staff-preparation-timer"
            :class="{ overdue: preparationRemaining(order) <= 0 }">
            <span>{{ preparationRemaining(order) <= 0 ? 'وقت التجهيز المتوقع انتهى' : 'الوقت المتبقي للتجهيز' }}</span>
            <strong>{{ formatRemaining(order) }}</strong>
          </div>

          <div class="staff-order-actions">
            <button v-if="nextStatus(order.status)" class="orders-primary-button" type="button"
              :disabled="updatingOrder === order.orderNumber"
              @click="updateStatus(order, nextStatus(order.status))">
              {{ updatingOrder === order.orderNumber ? 'جاري الحفظ...' : nextActionLabel(order.status) }}
            </button>
            <button v-if="!['delivered','cancelled'].includes(order.status)" class="orders-cancel-button" type="button"
              :disabled="updatingOrder === order.orderNumber"
              @click="cancelOrder(order)">
              إلغاء الأوردر
            </button>
          </div>
        </article>
      </div>
    </section>

    <footer class="orders-footer">
      <span>سومر · متابعة الطلبات</span>
      <small>لوحة مستقلة — لا تحتوي على أدوات إدارة الموقع أو إيصالات الدفع.</small>
    </footer>
  </main>
</template>

<script>
import { supabase } from '../supabase'

const BASE_URL = (process.env.BASE_URL || '/').replace(/\/?$/, '/')

export default {
  name: 'OrdersDashboard',
  data() {
    return {
      siteUrl: window.location.origin + BASE_URL,
      email: '',
      password: '',
      loggedIn: false,
      authBusy: false,
      loading: false,
      error: '',
      notice: '',
      orders: [],
      activeFilter: 'active',
      updatedAt: '',
      updatedOrderNumbers: [],
      updatingOrder: '',
      refreshTimer: null,
      clockTimer: null,
      now: Date.now(),
      filters: [
        { id: 'active', label: 'الأوردرات المفتوحة' },
        { id: 'new', label: 'جديدة' },
        { id: 'preparing', label: 'قيد التجهيز' },
        { id: 'ready', label: 'جاهزة للتوصيل' },
        { id: 'out_for_delivery', label: 'خرجت للتوصيل' },
        { id: 'delivered', label: 'تم التسليم' },
        { id: 'all', label: 'الكل' },
      ],
    }
  },
  computed: {
    filteredOrders() {
      const orders = [...this.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      if (this.activeFilter === 'active') return orders.filter(order => !['delivered', 'cancelled'].includes(order.status))
      if (this.activeFilter === 'all') return orders
      if (this.activeFilter === 'ready') return orders.filter(order => ['ready'].includes(order.status))
      return orders.filter(order => order.status === this.activeFilter)
    },
  },
  async mounted() {
    this.clockTimer = window.setInterval(() => { this.now = Date.now() }, 1000)
    try {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        this.loggedIn = true
        try {
          await this.loadOrders()
          this.startAutoRefresh()
        } catch (error) {
          await supabase.auth.signOut()
          this.loggedIn = false
          this.error = error.message || 'الحساب مش مصرح له بدخول لوحة الأوردرات.'
        }
      }
    } catch (error) {
      this.error = 'تعذر التحقق من جلسة الدخول. سجّل الدخول مرة أخرى.'
    }
  },
  beforeUnmount() {
    this.stopAutoRefresh()
    if (this.clockTimer) window.clearInterval(this.clockTimer)
  },
  methods: {
    async login() {
      if (this.authBusy) return
      this.authBusy = true
      this.error = ''
      this.notice = ''
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: this.email,
          password: this.password,
        })
        if (error) throw error
        if (!data.user) throw new Error('تعذر تحديد حساب المستخدم.')
        this.loggedIn = true
        this.password = ''
        await this.loadOrders()
        this.startAutoRefresh()
      } catch (error) {
        await supabase.auth.signOut().catch(() => {})
        this.loggedIn = false
        this.error = error.message || 'تعذر تسجيل الدخول. راجع بياناتك وصلاحية لوحة الأوردرات.'
      } finally {
        this.authBusy = false
      }
    },
    async loadOrders() {
      if (this.loading) return
      this.loading = true
      this.error = ''
      try {
        const { data, error } = await supabase.functions.invoke('sumer-orders-dashboard', {
          body: { action: 'list_orders' },
        })
        if (error) throw error
        if (!data?.ok || !Array.isArray(data.orders)) throw new Error(data?.error || 'تعذر تحميل الأوردرات.')
        this.orders = data.orders
        this.updatedAt = data.updatedAt || new Date().toISOString()
      } finally {
        this.loading = false
      }
    },
    startAutoRefresh() {
      this.stopAutoRefresh()
      this.refreshTimer = window.setInterval(async () => {
        if (!this.loggedIn || this.loading || this.updatingOrder) return
        try { await this.loadOrders() } catch (error) { this.error = error.message || 'تعذر تحديث الأوردرات.' }
      }, 20000)
    },
    stopAutoRefresh() {
      if (this.refreshTimer) window.clearInterval(this.refreshTimer)
      this.refreshTimer = null
    },
    async updateStatus(order, status) {
      if (!order || !status || this.updatingOrder) return
      this.updatingOrder = order.orderNumber
      this.error = ''
      this.notice = ''
      try {
        const { data, error } = await supabase.functions.invoke('sumer-orders-dashboard', {
          body: { action: 'update_status', orderNumber: order.orderNumber, status },
        })
        if (error) throw error
        if (!data?.ok) throw new Error(data?.error || 'تعذر تحديث حالة الأوردر.')
        const local = this.orders.find(item => item.orderNumber === order.orderNumber)
        if (local) local.status = data.status
        this.notice = 'تم تحديث حالة الأوردر #' + order.orderNumber + ' إلى: ' + this.statusLabel(status)
        await this.loadOrders()
      } catch (error) {
        this.error = error.message || 'تعذر تحديث حالة الأوردر.'
      } finally {
        this.updatingOrder = ''
      }
    },
    async cancelOrder(order) {
      if (!window.confirm('متأكد إنك عايز تلغي الأوردر #' + order.orderNumber + '؟')) return
      await this.updateStatus(order, 'cancelled')
    },
    nextStatus(status) {
      return ({
        new: 'confirmed',
        confirmed: 'preparing',
        preparing: 'ready',
        ready: 'out_for_delivery',
        out_for_delivery: 'delivered',
      })[status] || ''
    },
    nextActionLabel(status) {
      return ({
        new: '✓ تأكيد استلام الأوردر',
        confirmed: 'بدء التجهيز',
        preparing: '✓ جاهز للتوصيل',
        ready: '🚚 خرج مع المندوب',
        out_for_delivery: '✓ تم التسليم',
      })[status] || ''
    },
    statusLabel(status) {
      return ({
        new: 'جديد — لم يُستلم بعد',
        confirmed: 'تم استلام الطلب',
        preparing: 'قيد التجهيز',
        ready: 'جاهز للتوصيل',
        out_for_delivery: 'خرج للتوصيل',
        delivered: 'تم التسليم',
        cancelled: 'ملغي',
      })[status] || 'حالة غير معروفة'
    },
    filterCount(filter) {
      if (filter === 'active') return this.orders.filter(order => !['delivered', 'cancelled'].includes(order.status)).length
      if (filter === 'all') return this.orders.length
      return this.orders.filter(order => filter === 'ready' ? order.status === 'ready' : order.status === filter).length
    },
    money(value) {
      return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 2 }).format(Number(value) || 0)
    },
    formatTime(value) {
      if (!value) return '—'
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return '—'
      return date.toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })
    },
    formatDeliveryMinutes(value) {
      const minutes = Math.max(5, Math.round(Number(value) || 45))
      if (minutes < 60) return minutes + ' دقيقة'
      const hours = Math.floor(minutes / 60)
      const remainder = minutes % 60
      return hours + ' ساعة' + (remainder ? ' و ' + remainder + ' دقيقة' : '')
    },
    preparationRemaining(order) {
      if (!order?.preparationDeadlineAt) return null
      const deadline = new Date(order.preparationDeadlineAt).getTime()
      if (!Number.isFinite(deadline)) return null
      return Math.floor((deadline - this.now) / 1000)
    },
    formatRemaining(order) {
      const remaining = this.preparationRemaining(order)
      if (remaining === null) return 'الوقت غير محدد'
      const abs = Math.abs(remaining)
      const mins = Math.floor(abs / 60)
      const secs = String(abs % 60).padStart(2, '0')
      return (remaining < 0 ? 'تأخير ' : 'متبقي ') + mins + ':' + secs
    },
    async logout() {
      this.stopAutoRefresh()
      await supabase.auth.signOut()
      this.loggedIn = false
      this.orders = []
      this.password = ''
      this.email = ''
      this.error = ''
      this.notice = ''
    },
  },
}
</script>

<style scoped>
.orders-dashboard {
  min-height: 100vh; padding: 0 24px 24px; color: #f4ede6; background:
    radial-gradient(circle at 90% 0%, rgba(103, 75, 133, .23), transparent 32rem),
    linear-gradient(135deg, #10101a, #19151b 68%, #211715);
  font-family: Arial, "Noto Sans Arabic", Tahoma, sans-serif;
}
.orders-header {
  max-width: 1220px; margin: 0 auto; padding: 18px 0;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  border-bottom: 1px solid rgba(216, 176, 112, .18);
}
.orders-brand { display: flex; align-items: center; gap: 11px; text-decoration: none; color: inherit; }
.orders-brand-mark {
  display: grid; place-items: center; width: 43px; height: 43px; border-radius: 13px;
  color: #1a1411; background: #d5ae69; font-size: 24px; font-weight: 900;
}
.orders-brand strong, .orders-brand small { display: block; }
.orders-brand strong { font-size: 19px; }
.orders-brand small { margin-top: 4px; color: #b4a294; font-size: 11px; }
.orders-header-actions { display: flex; align-items: center; justify-content: end; flex-wrap: wrap; gap: 8px; }
.orders-secondary-button, .orders-danger-button, .orders-primary-button, .orders-cancel-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  min-height: 39px; padding: 9px 13px; border-radius: 9px; text-decoration: none;
  font: inherit; font-size: 12px; font-weight: 800; cursor: pointer;
}
.orders-secondary-button { color: #e6d8c9; background: transparent; border: 1px solid #574638; }
.orders-danger-button, .orders-cancel-button { color: #ffdede; background: #542b2d; border: 1px solid #824447; }
.orders-primary-button { width: 100%; color: #1b1511; background: #d5ae69; border: 1px solid #d5ae69; }
.orders-secondary-button:disabled, .orders-danger-button:disabled, .orders-primary-button:disabled, .orders-cancel-button:disabled { opacity: .55; cursor: not-allowed; }
.orders-login-wrap { min-height: calc(100vh - 130px); display: grid; place-items: center; padding: 28px 0; }
.orders-login-card {
  width: min(440px, 100%); padding: 28px; border: 1px solid rgba(213, 174, 105, .35);
  border-radius: 20px; background: rgba(25, 22, 30, .93); box-shadow: 0 22px 80px rgba(0, 0, 0, .25);
}
.orders-eyebrow { color: #d5ae69; font-size: 10px; font-weight: 900; letter-spacing: .12em; }
.orders-login-card h1 { margin: 9px 0; font-size: 27px; }
.orders-login-card p, .orders-page-title p { color: #b4a294; font-size: 13px; line-height: 1.8; }
.orders-login-card form { display: grid; gap: 14px; margin: 21px 0 14px; }
.orders-login-card label { display: grid; gap: 7px; color: #e4d8cd; font-size: 12px; font-weight: 700; }
.orders-login-card input {
  width: 100%; min-height: 45px; padding: 10px 12px; border: 1px solid #594638;
  border-radius: 9px; color: #f4ede6; background: #211b1c; outline-color: #d5ae69;
}
.orders-muted { display: block; color: #9e8d80; font-size: 11px; line-height: 1.8; }
.orders-content { max-width: 1220px; margin: 0 auto; }
.orders-page-title { display: flex; align-items: end; justify-content: space-between; gap: 20px; padding: 28px 0 14px; }
.orders-page-title h1 { margin: 7px 0 2px; font-size: clamp(25px, 4vw, 36px); }
.orders-page-title p { margin: 7px 0 0; }
.orders-updated { color: #9e8d80; font-size: 11px; }
.orders-stats { display: flex; gap: 9px; overflow-x: auto; padding: 13px 0 18px; }
.orders-stat {
  flex: 0 0 auto; display: grid; grid-template-columns: auto auto; align-items: center; gap: 14px;
  padding: 11px 14px; color: #c6b4a4; border: 1px solid #4b3c32; border-radius: 12px; background: rgba(30, 25, 27, .85);
  cursor: pointer; font-size: 12px;
}
.orders-stat strong { color: #f4ede6; font-size: 16px; }
.orders-stat.active { border-color: #d5ae69; background: rgba(213, 174, 105, .1); color: #f3d7a5; }
.orders-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }
.staff-order-card {
  padding: 18px; border: 1px solid rgba(213, 174, 105, .22); border-radius: 15px;
  background: linear-gradient(150deg, rgba(36, 30, 30, .97), rgba(23, 22, 29, .97)); min-width: 0;
}
.staff-order-card-top { display: flex; align-items: start; justify-content: space-between; gap: 15px; padding-bottom: 13px; border-bottom: 1px solid rgba(213, 174, 105, .15); }
.staff-order-card-top h2 { margin: 4px 0; font-size: 25px; }
.orders-small-label { color: #9f8c7d; font-size: 10px; }
.orders-date { color: #a99484; font-size: 10px; }
.staff-status-pill { display: inline-flex; padding: 7px 10px; border-radius: 99px; border: 1px solid #705c49; color: #efd6ad; background: rgba(213,174,105,.1); font-size: 11px; font-weight: 800; text-align: center; }
.status-new { color: #f3d59c; }
.status-confirmed, .status-preparing { color: #a8cdfd; border-color: #3c5c84; background: rgba(71, 117, 171, .15); }
.status-ready { color: #b8e3bb; border-color: #467f4b; background: rgba(54, 130, 65, .15); }
.status-out_for_delivery { color: #f5c58c; border-color: #926636; background: rgba(178, 116, 42, .15); }
.status-delivered { color: #b9e8c4; border-color: #397b4b; background: rgba(32, 130, 63, .18); }
.status-cancelled { color: #ffbaba; border-color: #8c4545; background: rgba(180, 55, 55, .15); }
.staff-order-customer { display: grid; gap: 6px; padding: 13px 0; }
.staff-order-customer strong { font-size: 16px; }
.staff-order-customer a { width: fit-content; color: #d5ae69; font-size: 12px; text-decoration: none; direction: ltr; }
.staff-order-customer .orders-secondary-phone { color: #ad9c8d; font-size: 10px; }
.staff-order-address p { margin: 5px 0 0; font-size: 12px; line-height: 1.8; overflow-wrap: anywhere; }
.staff-order-items { margin-top: 13px; padding: 12px; border-radius: 11px; border: 1px solid rgba(213,174,105,.15); background: rgba(0,0,0,.12); }
.staff-order-line { display: flex; align-items: start; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px solid rgba(213,174,105,.1); font-size: 12px; }
.staff-order-line:last-of-type { border-bottom: 0; }
.staff-order-line strong { white-space: nowrap; color: #e5c78e; }
.staff-order-notes { color: #e5c78e; font-size: 11px; line-height: 1.7; }
.staff-order-summary { display: grid; gap: 7px; margin: 12px 0; }
.staff-order-summary > div { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; color: #bba898; }
.staff-order-summary strong { color: #f4ede6; }
.staff-order-summary .staff-total-row { padding-top: 8px; border-top: 1px solid rgba(213,174,105,.18); color: #e4c586; font-weight: 900; }
.staff-order-summary .staff-total-row strong { color: #e4c586; font-size: 16px; }
.staff-preparation-timer { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 12px; border: 1px solid #705c49; border-radius: 10px; color: #d8c7b6; font-size: 11px; }
.staff-preparation-timer strong { direction: ltr; font-variant-numeric: tabular-nums; }
.staff-preparation-timer.overdue { border-color: #a74242; color: #ffbaba; background: rgba(180,55,55,.1); }
.staff-order-actions { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 9px; margin-top: 14px; }
.staff-order-actions .orders-primary-button { min-width: 0; }
.orders-cancel-button { min-width: 100px; }
.orders-empty { max-width: 1220px; margin: 25px auto; padding: 35px 15px; text-align: center; border: 1px dashed #5e4a38; border-radius: 15px; color: #b4a294; }
.orders-notice { padding: 11px 13px; border: 1px solid #397b4b; border-radius: 9px; color: #c4eccb; background: rgba(32,130,63,.1); font-size: 12px; }
.orders-error { padding: 10px 12px; border: 1px solid #8c4545; border-radius: 9px; color: #ffbaba; background: rgba(180,55,55,.1); font-size: 12px; }
.orders-footer {
  max-width: 1220px; display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  margin: 35px auto 0; padding: 18px 0; color: #9e8d80; border-top: 1px solid rgba(213,174,105,.13); font-size: 11px;
}
@media (max-width: 780px) {
  .orders-dashboard { padding: 0 13px 15px; }
  .orders-header { align-items: start; flex-direction: column; }
  .orders-header-actions { justify-content: start; width: 100%; }
  .orders-grid { grid-template-columns: 1fr; }
  .orders-page-title { align-items: start; flex-direction: column; }
  .orders-updated { font-size: 10px; }
}
@media (max-width: 420px) {
  .orders-login-card { padding: 21px; }
  .staff-order-actions { grid-template-columns: 1fr; }
  .orders-cancel-button { width: 100%; }
}
</style>
