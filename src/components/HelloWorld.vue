
<template>
<div class="sumer" dir="rtl" :style="themeStyle">
  <!-- شريط التنقل -->
  <header class="topbar">
    <a href="#home" class="brand">
      <span class="brand-mark">S</span>
      <span>
        <strong>{{ settings.name || 'سومر' }}</strong>
        <small>SYRIAN RESTAURANT</small>
      </span>
    </a>

    <nav class="nav-links">
      <a href="#home">الرئيسية</a>
      <a href="#menu">المنيو</a>
      <a href="#about">عن المطعم</a>
      <a href="#contact">تواصل معنا</a>
    </nav>

    <div class="top-actions">
      <a v-if="settings.whatsapp" class="whatsapp-top" :href="whatsappUrl" target="_blank" rel="noopener">واتساب</a>
      <button class="cart-button" @click="cartOpen = true">🛒 السلة <span>{{ cartCount }}</span></button>
      <button class="icon-button" title="إدارة الموقع" @click="openAdmin">⚙</button>
    </div>
  </header>

  <main>
    <!-- الواجهة الرئيسية -->
    <section id="home" class="hero" :style="heroStyle">
      <div class="hero-shade"></div>

      <button v-if="slides.length > 1" class="slide-arrow prev" aria-label="الصورة السابقة" @click="changeSlide(-1)">❯</button>

      <div class="hero-content">
        <span class="eyebrow">أصالة الشام في كل لقمة</span>
        <h1>{{ currentSlide.caption || settings.name || 'سومر' }}</h1>
        <p>{{ settings.tagline }}</p>
        <a href="#menu" class="primary-button">اكتشف المنيو</a>
      </div>

      <button v-if="slides.length > 1" class="slide-arrow next" aria-label="الصورة التالية" @click="changeSlide(1)">❮</button>

      <div class="slide-dots">
        <button
          v-for="(slide, index) in slides"
          :key="slide.id"
          :class="{ active: index === slideIndex }"
          :aria-label="'الصورة ' + (index + 1)"
          @click="setSlide(index)"
        ></button>
      </div>
    </section>

    <section class="features">
      <div><span>✦</span><strong>نكهة شامية أصيلة</strong><small>طعم يفتكرك بالبيت</small></div>
      <div><span>♨</span><strong>تحضير باهتمام</strong><small>نهتم بكل تفصيلة</small></div>
      <div><span>⌂</span><strong>توصيل للمنزل</strong><small>اختار منطقتك عند الطلب</small></div>
    </section>

    <!-- المنيو -->
    <section id="menu" class="section menu-section">
      <div class="section-heading">
        <span class="eyebrow">اكتشف مذاق الشام</span>
        <h2>منيو <em>{{ settings.name || 'سومر' }}</em></h2>
        <p>اختار أطباقك المفضلة واطلبها بسهولة.</p>
      </div>

      <div class="menu-tools">
        <input v-model.trim="search" placeholder="ابحث عن أكلة..." />
        <div class="categories">
          <button
            v-for="category in categories"
            :key="category"
            :class="{ selected: activeCategory === category }"
            @click="activeCategory = category"
          >{{ category }}</button>
        </div>
      </div>

      <div v-if="dbLoading" class="empty-state">جاري تحميل بيانات المنيو من قاعدة البيانات...</div>
      <div v-else-if="dbError" class="empty-state database-error">{{ dbError }}</div>

      <div v-else-if="filteredProducts.length" class="product-grid">
        <article v-for="product in filteredProducts" :key="product.id" class="product-card">
          <div class="product-image">
            <img :src="product.image || fallbackImage" :alt="product.name" @error="onImageError" />
            <span v-if="product.featured" class="featured-tag">اختيار مميز</span>
          </div>

          <div class="product-info">
            <span class="product-category">{{ product.category }}</span>
            <h3>{{ product.name }}</h3>
            <p>{{ product.description }}</p>
            <div class="product-bottom">
              <strong>{{ money(product.price) }}</strong>
              <button :disabled="product.available === false" @click="addToCart(product)">
                {{ product.available === false ? 'غير متاح' : '+ أضف للسلة' }}
              </button>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">مفيش أصناف متاحة حاليًا. أضف المنتجات من لوحة الإدارة بعد الاتصال بقاعدة البيانات.</div>
    </section>

    <!-- عن المطعم -->
    <section id="about" class="about-section">
      <div class="about-art">
        <div class="about-art-inner">
          <span>SUMER</span>
          <strong>من قلب الشام</strong>
          <small>طعم يجمعنا</small>
        </div>
      </div>
      <div class="about-copy">
        <span class="eyebrow">حكاية وطعم</span>
        <h2>أهلاً بيك في {{ settings.name || 'سومر' }}</h2>
        <p>{{ settings.tagline }}</p>
        <p>نسعى لتقديم تجربة طعام مميزة، تجمع بين جودة المكونات وروح المطبخ الشامي.</p>
        <a href="#menu" class="primary-button">شوف المنيو</a>
      </div>
    </section>

    <!-- بيانات التواصل -->
    <section id="contact" class="section contact-section">
      <div class="section-heading">
        <span class="eyebrow">إحنا هنا لخدمتك</span>
        <h2>تواصل معانا</h2>
      </div>

      <div class="contact-grid">
        <div class="contact-card">
          <span>⌖</span><strong>العنوان</strong>
          <p>{{ settings.address || 'أضف عنوان المطعم من لوحة الإدارة' }}</p>
        </div>
        <div class="contact-card">
          <span>☎</span><strong>رقم الهاتف</strong>
          <p>{{ settings.phone || 'أضف رقم الهاتف من لوحة الإدارة' }}</p>
        </div>
        <div class="contact-card">
          <span>◷</span><strong>مواعيد العمل</strong>
          <p>{{ settings.hours || 'أضف مواعيد العمل من لوحة الإدارة' }}</p>
        </div>
      </div>
    </section>
  </main>

  <!-- الفوتر -->
  <footer class="footer">
    <div>
      <a href="#home" class="footer-brand">{{ settings.name || 'سومر' }}</a>
      <p>{{ settings.tagline }}</p>
    </div>

    <div class="footer-links">
      <a v-for="link in visibleSocialLinks" :key="link.id" :href="link.url" target="_blank" rel="noopener">{{ link.label }}</a>
      <a v-if="settings.whatsapp" :href="whatsappUrl" target="_blank" rel="noopener">واتساب</a>
      <div v-if="settings.menuQrEnabled && menuQrUrl" class="footer-menu-qr">
        <a :href="menuQrTarget" target="_blank" rel="noopener" aria-label="فتح المنيو عبر QR Code">
          <img :src="menuQrUrl" alt="QR Code للمنيو" />
        </a>
        <small>امسح الكود لفتح المنيو</small>
      </div>
    </div>

    <small>© {{ new Date().getFullYear() }} {{ settings.name || 'سومر' }} — نسخة تجريبية</small>
    <button class="admin-footer-link" @click="openAdmin">إدارة الموقع ⚙</button>
  </footer>

  <!-- السلة -->
  <div v-if="cartOpen" class="overlay" @click.self="cartOpen = false">
    <section class="drawer">
      <div class="drawer-heading">
        <h2>سلة الطلبات</h2>
        <button class="close-button" @click="cartOpen = false">✕</button>
      </div>

      <div v-if="!cart.length" class="empty-state">السلة لسه فاضية.</div>

      <div v-for="item in cart" :key="item.id" class="cart-item">
        <div>
          <strong>{{ item.name }}</strong>
          <small>{{ money(item.price) }} للواحد</small>
        </div>
        <div class="quantity-control">
          <button @click="changeQuantity(item.id, 1)">+</button>
          <strong>{{ item.quantity }}</strong>
          <button @click="changeQuantity(item.id, -1)">−</button>
        </div>
      </div>

      <div v-if="cart.length" class="cart-summary">
        <div><span>قيمة المنتجات</span><strong>{{ money(cartSubtotal) }}</strong></div>
        <div><span>التوصيل</span><strong>{{ money(selectedDeliveryFee) }}</strong></div>
        <div class="total-row"><span>الإجمالي</span><strong>{{ money(cartTotal) }}</strong></div>
      </div>

      <button v-if="cart.length" class="primary-button full-button" @click="openCheckout">استكمال بيانات الطلب</button>
    </section>
  </div>

  <!-- إتمام الطلب -->
  <div v-if="checkoutOpen" class="overlay" @click.self="checkoutOpen = false">
    <section class="modal checkout-modal">
      <div class="drawer-heading">
        <h2>بيانات التوصيل والطلب</h2>
        <button class="close-button" @click="checkoutOpen = false">✕</button>
      </div>

      <form @submit.prevent="submitOrder">
        <div class="form-grid">
          <label>الاسم بالكامل *
            <input v-model.trim="checkout.name" required maxlength="100" placeholder="اسم العميل" />
          </label>
          <label>رقم الهاتف الأساسي *
            <input v-model.trim="checkout.phone" required type="tel" maxlength="25" placeholder="01xxxxxxxxx" />
          </label>
          <label>رقم هاتف بديل
            <input v-model.trim="checkout.phone2" type="tel" maxlength="25" placeholder="اختياري" />
          </label>
          <label>المنطقة *
            <select v-model="checkout.areaId" required>
              <option disabled value="">اختار المنطقة</option>
              <option v-for="area in activeAreas" :key="area.id" :value="area.id">
                {{ area.name }} — {{ money(area.fee) }}
              </option>
            </select>
          </label>
          <label>اسم الشارع أو المبنى *
            <input v-model.trim="checkout.street" required maxlength="150" placeholder="اسم الشارع / المبنى" />
          </label>
          <label>الدور
            <input v-model.trim="checkout.floor" maxlength="20" placeholder="رقم الدور" />
          </label>
          <label>رقم الشقة
            <input v-model.trim="checkout.apartment" maxlength="20" placeholder="رقم الشقة" />
          </label>
          <label>طريقة الدفع *
            <select v-model="checkout.paymentMethod" required>
              <option v-if="settings.cashOnDeliveryEnabled !== false" value="cash">الدفع عند الاستلام</option>
              <option value="vodafone">فودافون كاش</option>
              <option value="instapay">إنستاباي</option>
            </select>
          </label>
        </div>

        <div v-if="checkout.paymentMethod !== 'cash'" class="payment-details">
          <strong>بيانات الدفع</strong>
          <p v-if="checkout.paymentMethod === 'vodafone'">
            محفظة فودافون كاش: {{ settings.vodafoneWallet || 'لم يضف المطعم رقم المحفظة بعد' }}
          </p>
          <p v-else>
            بيانات إنستاباي: {{ settings.instapayAddress || 'لم يضف المطعم بيانات إنستاباي بعد' }}
          </p>
          <label class="upload-label">
            صورة إيصال التحويل * (مطلوبة)
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" required @change="handleProofUpload" />
          </label>
          <p v-if="proofFileName" class="hint">تم اختيار: {{ proofFileName }}</p>
          <label class="upload-label">رقم العملية (اختياري)
            <input v-model.trim="checkout.paymentReference" maxlength="120" placeholder="رقم مرجع التحويل إن وُجد" />
          </label>
          <p class="hint">سيظل الدفع «مراجعة مطلوبة» لحد ما الإدارة تراجع الإيصال وتؤكد استلام المبلغ.</p>
        </div>

        <label>ملاحظات إضافية
          <textarea v-model.trim="checkout.notes" rows="2" maxlength="500" placeholder="أي تفاصيل تساعد في توصيل الطلب"></textarea>
        </label>

        <div class="invoice">
          <h3>ملخص الفاتورة</h3>
          <div v-for="item in cart" :key="item.id">
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <strong>{{ money(item.price * item.quantity) }}</strong>
          </div>
          <div><span>المنتجات</span><strong>{{ money(cartSubtotal) }}</strong></div>
          <div><span>التوصيل</span><strong>{{ money(selectedDeliveryFee) }}</strong></div>
          <div class="total-row"><span>الإجمالي النهائي</span><strong>{{ money(cartTotal) }}</strong></div>
        </div>

        <p v-if="orderError" class="hint error-message">{{ orderError }}</p>
        <p class="hint">تأكيد الطلب يرسله إلى قاعدة البيانات من خلال وظيفة create-sumer-order.</p>
        <button class="primary-button full-button" type="submit" :disabled="sending">
          {{ sending ? 'جاري إرسال الطلب...' : 'تأكيد الطلب' }}
        </button>
      </form>
    </section>
  </div>

  <!-- تأكيد الطلب -->
  <div v-if="confirmedOrder" class="overlay" @click.self="confirmedOrder = null">
    <section class="modal confirmation">
      <span class="confirmation-icon">✓</span>
      <h2>تم إرسال الطلب</h2>
      <p>رقم الطلب: <strong>{{ confirmedOrder.id }}</strong></p>
      <p>الإجمالي: <strong>{{ money(confirmedOrder.total) }}</strong></p>
      <p>الحالة: {{ confirmedOrder.status }}</p>
      <p v-if="confirmedOrder.whatsappNotification === 'not_configured'" class="hint error-message">
        تم حفظ الطلب، لكن إشعار واتساب لم يُرسل لأن إعدادات الاتصال غير مكتملة.
      </p>
      <p v-else-if="confirmedOrder.whatsappNotification && confirmedOrder.whatsappNotification.includes('failed')" class="hint error-message">
        تم حفظ الطلب، لكن تعذّر إرسال جزء من إشعار واتساب أو صورة الإيصال. راجع سجل الوظيفة قبل إعادة المحاولة.
      </p>
      <p v-else-if="confirmedOrder.whatsappNotification && confirmedOrder.whatsappNotification.startsWith('summary_sent')" class="hint">
        تم قبول ملخص الطلب للإرسال عبر واتساب. حالة الصور: {{ confirmedOrder.whatsappNotification.includes('images_sent') ? 'تم قبول إرسال الصور' : 'لم يتم تأكيد إرسال صور الأصناف' }}.
      </p>
      <button class="primary-button full-button" @click="confirmedOrder = null">تمام</button>
    </section>
  </div>

  <!-- لوحة الإدارة -->
  <div v-if="adminOpen" class="overlay admin-overlay" @click.self="closeAdmin">
    <section class="admin-panel">
      <div class="admin-header">
        <div>
          <span class="eyebrow">SUMER CONTROL CENTER</span>
          <h2>لوحة إدارة المطعم</h2>
        </div>
        <button class="close-button" @click="closeAdmin">✕</button>
      </div>

      <div v-if="!adminLoggedIn" class="login-box">
        <h3>تسجيل دخول الإدارة</h3>
        <p>استخدم حساب الإدارة الذي أنشأته في Supabase Auth.</p>
        <form @submit.prevent="login">
          <label>البريد الإلكتروني
            <input v-model.trim="adminEmail" type="email" autocomplete="off" name="sumer-admin-email" placeholder="admin@example.com" required />
          </label>
          <label>كلمة المرور
            <input v-model="adminPassword" type="password" autocomplete="new-password" name="sumer-admin-password" placeholder="كلمة المرور" required />
          </label>
          <p v-if="loginError" class="error-message">{{ loginError }}</p>
          <button class="primary-button full-button" type="submit" :disabled="adminBusy">
            {{ adminBusy ? 'جاري التحقق...' : 'تسجيل الدخول' }}
          </button>
        </form>
        <p class="hint">يلزم إضافة معرّف حساب المدير إلى جدول admin_users. لا توجد كلمة مرور ثابتة داخل هذا الملف.</p>
      </div>

      <template v-else>
        <nav class="admin-tabs">
          <button
            v-for="tab in adminTabs"
            :key="tab.id"
            :class="{ active: adminTab === tab.id }"
            @click="adminTab = tab.id"
          >{{ tab.label }}</button>
        </nav>

        <p v-if="adminError" class="hint error-message">{{ adminError }}</p>

        <!-- إدارة الطلبات -->
        <div v-if="adminTab === 'orders'" class="admin-content">
          <div class="admin-title-row">
            <h3>الطلبات والعملاء</h3>
            <button class="secondary-button" @click="loadOrders">تحديث الطلبات</button>
            <button class="secondary-button" @click="exportOrders">تصدير CSV</button>
          </div>

          <div v-if="ordersLoading" class="empty-state">جاري تحميل الطلبات...</div>
          <div v-else-if="!orders.length" class="empty-state">لا توجد طلبات في قاعدة البيانات حتى الآن.</div>

          <article v-for="order in sortedOrders" :key="order.dbId" class="admin-card">
            <div class="admin-title-row">
              <strong>طلب {{ order.id }}</strong>
              <span class="status-pill">{{ order.status }}</span>
            </div>
            <div
              v-if="order.createdAtTimestamp && !['تم التسليم', 'ملغي'].includes(order.status)"
              class="preparation-timer order-age-timer"
              role="status"
              aria-live="polite"
            >
              <strong>المدة منذ استلام الطلب:</strong>
              <span>{{ formatOrderAge(order) }}</span>
            </div>
            <div
              v-if="order.preparationDeadlineAt && !['خرج للتوصيل', 'تم التسليم', 'ملغي'].includes(order.status)"
              class="preparation-timer"
              :class="{ overdue: preparationRemaining(order) <= 0 }"
              role="status"
              aria-live="polite"
            >
              <strong>مؤقّت التجهيز:</strong>
              <span>{{ formatPreparationRemaining(order) }}</span>
              <b v-if="preparationRemaining(order) <= 0"> — الطلب متأخر</b>
            </div>
            <p><strong>العميل:</strong> {{ order.customer.name }} — {{ order.customer.phone }}</p>
            <p><strong>الهاتف البديل:</strong> {{ order.customer.phone2 || '—' }}</p>
            <p><strong>العنوان:</strong> {{ order.customer.areaName }}، {{ order.customer.street }}، الدور {{ order.customer.floor || '—' }}، شقة {{ order.customer.apartment || '—' }}</p>
            <p><strong>الدفع:</strong> {{ paymentLabel(order.paymentMethod) }} —
              <span class="status-pill" :class="{ paid: order.paymentStatusRaw === 'paid' }">{{ order.paymentStatus }}</span>
            </p>
            <p v-if="order.paymentReference"><strong>رقم العملية:</strong> {{ order.paymentReference }}</p>
            <p v-if="order.paymentProofPath">
              <strong>إيصال التحويل:</strong>
              <button class="secondary-button small-button" @click="preparePaymentProof(order)">تجهيز رابط عرض الإيصال</button>
              <a v-if="order.paymentProofUrl" class="proof-link" :href="order.paymentProofUrl" target="_blank" rel="noopener">عرض الإيصال في تبويب جديد</a>
            </p>
            <p v-else-if="order.paymentMethod !== 'cash'"><strong>تنبيه:</strong> لا يوجد مسار إيصال محفوظ لهذا الطلب.</p>
            <p><strong>التاريخ:</strong> {{ order.createdAt }}</p>
            <section class="whatsapp-message-log" aria-label="حالات إشعارات واتساب">
              <strong>إشعارات واتساب</strong>
              <div v-if="order.whatsappMessages && order.whatsappMessages.length" class="whatsapp-message-list">
                <div v-for="message in order.whatsappMessages" :key="message.messageId" class="whatsapp-message-row">
                  <span>{{ whatsappMessageTypeLabel(message.messageType) }}</span>
                  <span class="status-pill" :class="'whatsapp-status-' + message.status">
                    {{ whatsappMessageStatusLabel(message.status) }}
                  </span>
                  <small v-if="message.lastError" class="error-message">يوجد خطأ مسجل في آخر تحديث.</small>
                </div>
              </div>
              <p v-else class="hint">لم تُسجَّل رسائل واتساب لهذا الطلب بعد.</p>
            </section>
            <p><strong>الإجمالي:</strong> {{ money(order.total) }}</p>
            <div v-for="item in order.items" :key="item.id" class="order-line">
              {{ item.name }} × {{ item.quantity }} — {{ money(item.price * item.quantity) }}
            </div>
            <p v-if="order.notes"><strong>ملاحظات:</strong> {{ order.notes }}</p>
            <div class="admin-inline">
              <label>حالة الطلب
                <select :value="order.status" @change="updateOrderStatus(order.dbId, $event.target.value)">
                  <option>جديد</option>
                  <option>قيد التجهيز</option>
                  <option>خرج للتوصيل</option>
                  <option>تم التسليم</option>
                  <option>ملغي</option>
                </select>
              </label>
              <label v-if="order.paymentMethod !== 'cash'">حالة الدفع
                <select :value="order.paymentStatusRaw" @change="updatePaymentStatus(order.dbId, $event.target.value)">
                  <option value="pending">مراجعة مطلوبة</option>
                  <option value="review">مراجعة مطلوبة</option>
                  <option value="paid">تم الدفع</option>
                  <option value="failed">مرفوض</option>
                </select>
              </label>
            </div>
            <p class="hint">حذف الطلب متوقف مؤقتًا لحماية بيانات الأصناف المرتبطة به.</p>
          </article>
        </div>

        <!-- إدارة المنتجات -->
        <div v-if="adminTab === 'products'" class="admin-content">
          <div class="admin-title-row">
            <h3>إدارة المنيو</h3>
            <button class="primary-button small-button" @click="newProduct">+ إضافة صنف</button>
          </div>

          <form v-if="productFormOpen" class="admin-form" @submit.prevent="saveProduct">
            <h4>{{ editingId ? 'تعديل الصنف' : 'إضافة صنف جديد' }}</h4>
            <div class="form-grid">
              <label>اسم الصنف *
                <input v-model.trim="productForm.name" required />
              </label>
              <label>السعر بالجنيه *
                <input v-model.number="productForm.price" type="number" min="0" step="0.01" required />
              </label>
              <label>القسم *
                <input v-model.trim="productForm.category" required placeholder="مشويات، مقبلات..." />
              </label>
              <label>رابط صورة الصنف
                <input v-model.trim="productForm.image" type="url" placeholder="https://..." />
              </label>
            </div>
            <label>وصف الصنف
              <textarea v-model.trim="productForm.description" rows="2"></textarea>
            </label>
            <div class="checkbox-row">
              <label><input v-model="productForm.featured" type="checkbox" /> صنف مميز</label>
              <label><input v-model="productForm.available" type="checkbox" /> متاح للطلب</label>
            </div>
            <p class="hint">تفعيل وإيقاف المنتج يُحفظ في عمود active بقاعدة البيانات. علامة «صنف مميز» تحتاج عمودًا إضافيًا إذا أردت مزامنتها بين جميع الأجهزة.</p>
            <div class="admin-inline">
              <button class="primary-button" type="submit" :disabled="adminBusy">{{ adminBusy ? 'جاري الحفظ...' : 'حفظ الصنف' }}</button>
              <button class="secondary-button" type="button" @click="cancelProduct">إلغاء</button>
            </div>
          </form>

          <article v-for="product in products" :key="product.id" class="admin-list-item">
            <img :src="product.image || fallbackImage" :alt="product.name" @error="onImageError" />
            <div class="admin-list-main">
              <strong>{{ product.name }}</strong>
              <small>{{ product.category }} · {{ money(product.price) }}</small>
              <small>{{ product.available === false ? 'غير متاح' : 'متاح' }}</small>
            </div>
            <button class="secondary-button" @click="editProduct(product)">تعديل</button>
            <button class="danger-button" @click="deleteProduct(product.id)">إيقاف</button>
          </article>
        </div>

        <!-- إدارة صور الخلفية -->
        <div v-if="adminTab === 'slides'" class="admin-content">
          <h3>صور الواجهة الرئيسية</h3>
          <p class="hint">أضف رابط صورة عامًّا يبدأ بـ https:// . الصور الفعالة تُقرأ من جدول slides.</p>

          <form class="admin-form" @submit.prevent="saveSlide">
            <h4>{{ slideForm.id ? 'تعديل صورة' : 'إضافة صورة' }}</h4>
            <label>رابط الصورة *
              <input v-model.trim="slideForm.image" type="url" required placeholder="https://..." />
            </label>
            <label>العنوان الظاهر على الصورة
              <input v-model.trim="slideForm.caption" placeholder="أهلاً بيك في سومر" />
            </label>
            <div class="admin-inline">
              <button class="primary-button" type="submit" :disabled="adminBusy">{{ slideForm.id ? 'حفظ التعديلات' : 'إضافة الصورة' }}</button>
              <button class="secondary-button" type="button" @click="resetSlideForm">تفريغ الحقول</button>
            </div>
          </form>

          <label class="interval-control">مدة عرض كل صورة بالثواني
            <input v-model.number="settings.slideSeconds" type="number" min="2" max="60" />
          </label>
          <button class="secondary-button" @click="persistDemo">حفظ مدة العرض على هذا المتصفح</button>

          <article v-for="(slide, index) in slides" :key="slide.id" class="slide-admin-item">
            <img :src="slide.image" :alt="slide.caption" @error="onImageError" />
            <div class="admin-list-main">
              <strong>{{ slide.caption || 'صورة بدون عنوان' }}</strong>
              <small>الترتيب: {{ index + 1 }}</small>
            </div>
            <button class="secondary-button" :disabled="index === 0" @click="moveSlide(index, -1)">↑</button>
            <button class="secondary-button" :disabled="index === slides.length - 1" @click="moveSlide(index, 1)">↓</button>
            <button class="secondary-button" @click="editSlide(slide)">تعديل</button>
            <button class="danger-button" @click="deleteSlide(slide.id)">إخفاء</button>
          </article>
        </div>

        <!-- مناطق التوصيل -->
        <div v-if="adminTab === 'delivery'" class="admin-content">
          <h3>مناطق التوصيل والأسعار</h3>
          <form class="admin-form" @submit.prevent="saveArea">
            <h4>{{ areaForm.id ? 'تعديل المنطقة' : 'إضافة منطقة' }}</h4>
            <label>اسم المنطقة *
              <input v-model.trim="areaForm.name" required placeholder="مثال: مدينة نصر" />
            </label>
            <label>رسوم التوصيل بالجنيه *
              <input v-model.number="areaForm.fee" type="number" min="0" step="0.01" required />
            </label>
            <label class="checkbox-label"><input v-model="areaForm.active" type="checkbox" /> المنطقة متاحة للتوصيل</label>
            <div class="admin-inline">
              <button class="primary-button" type="submit" :disabled="adminBusy">{{ adminBusy ? 'جاري الحفظ...' : 'حفظ المنطقة' }}</button>
              <button class="secondary-button" type="button" @click="resetAreaForm">إلغاء</button>
            </div>
          </form>

          <article v-for="area in areas" :key="area.id" class="admin-list-item">
            <div class="admin-list-main">
              <strong>{{ area.name }}</strong>
              <small>{{ money(area.fee) }} · {{ area.active ? 'متاحة' : 'متوقفة' }}</small>
            </div>
            <button class="secondary-button" @click="editArea(area)">تعديل</button>
            <button class="danger-button" @click="deleteArea(area.id)">إيقاف</button>
          </article>
        </div>

        <!-- بيانات المطعم والروابط -->
        <div v-if="adminTab === 'settings'" class="admin-content">
          <h3>بيانات المطعم والتصميم</h3>
          <form class="admin-form" @submit.prevent="saveSettings">
            <div class="form-grid">
              <label>اسم المطعم
                <input v-model.trim="settings.name" required />
              </label>
              <label>رقم الهاتف
                <input v-model.trim="settings.phone" type="tel" />
              </label>
              <label>رقم واتساب مع كود الدولة
                <input v-model.trim="settings.whatsapp" placeholder="201xxxxxxxxx" />
              </label>
              <label>العنوان
                <input v-model.trim="settings.address" />
              </label>
              <label>مواعيد العمل
                <input v-model.trim="settings.hours" />
              </label>
              <label>عنوان المحفظة - فودافون كاش
                <input v-model.trim="settings.vodafoneWallet" placeholder="أدخل البيانات الحقيقية" />
              </label>
              <label>بيانات إنستاباي
                <input v-model.trim="settings.instapayAddress" placeholder="أدخل البيانات الحقيقية" />
              </label>
              <label>رابط الموقع المنشور
                <input v-model.trim="settings.publicUrl" type="url" placeholder="https://..." />
              </label>
              <label>رابط المنيو المباشر
                <input v-model.trim="settings.menuUrl" type="url" placeholder="https://.../#menu" />
              </label>
            </div>

            <label>الوصف المختصر
              <textarea v-model.trim="settings.tagline" rows="3"></textarea>
            </label>

            <h4>ألوان الهوية — تُحفظ على هذا المتصفح</h4>
            <div class="color-grid">
              <label>لون الخلفية <input v-model="settings.bgColor" type="color" /></label>
              <label>لون البطاقات <input v-model="settings.cardColor" type="color" /></label>
              <label>اللون الذهبي <input v-model="settings.accentColor" type="color" /></label>
              <label>لون النص <input v-model="settings.textColor" type="color" /></label>
            </div>

            <label class="checkbox-label"><input v-model="settings.menuQrEnabled" type="checkbox" /> إظهار QR Code صغير للمنيو أسفل رابط واتساب في الفوتر</label>
            <p class="hint">الرابط الافتراضي يفتح قسم المنيو في الموقع المنشور. يمكنك تغييره من هنا ثم حفظ البيانات.</p>

            <h4>روابط التواصل الاجتماعي</h4>
            <div v-for="link in socialLinks" :key="link.id" class="social-edit-row">
              <input v-model="link.label" aria-label="اسم الرابط" placeholder="اسم الرابط" />
              <input v-model="link.url" aria-label="عنوان الرابط" type="url" placeholder="https://..." />
              <button class="danger-button" type="button" @click="removeSocialLink(link.id)">حذف</button>
            </div>
            <button class="secondary-button" type="button" @click="addSocialLink">+ إضافة رابط تواصل</button>

            <p class="hint">اسم المطعم والهاتف وواتساب والعنوان والمواعيد وبيانات الدفع وروابط التواصل ورابط المنيو وخيار QR تُحفظ في قاعدة البيانات وتظهر لكل الزوار. الألوان والوصف المختصر ومدة السلايدر محفوظة محليًا في هذا المتصفح.</p>
            <div class="admin-inline">
              <button class="primary-button" type="submit" :disabled="adminBusy">{{ adminBusy ? 'جاري الحفظ...' : 'حفظ البيانات' }}</button>
            </div>
          </form>
        </div>

        <!-- بطاقة البيانات و QR -->
        <div v-if="adminTab === 'data'" class="admin-content">
          <h3>بطاقة بيانات المطعم</h3>
          <div class="data-card">
            <span class="brand-mark">S</span>
            <h2>{{ settings.name || 'سومر' }}</h2>
            <p>{{ settings.tagline }}</p>
            <p>العنوان: {{ settings.address || 'غير محدد' }}</p>
            <p>الهاتف: {{ settings.phone || 'غير محدد' }}</p>
            <p>واتساب: {{ settings.whatsapp || 'غير محدد' }}</p>
            <p>مواعيد العمل: {{ settings.hours || 'غير محددة' }}</p>
            <button class="secondary-button" @click="copyRestaurantData">نسخ بيانات المطعم</button>
          </div>

          <h3 class="qr-heading">QR Code للموقع</h3>
          <p class="hint">أدخل رابط الموقع بعد نشره. الرمز يفتح الرابط الذي أدخلته.</p>
          <div v-if="settings.publicUrl" class="qr-box">
            <img :src="qrUrl" alt="QR Code للموقع" />
            <p>{{ settings.publicUrl }}</p>
            <a class="secondary-button link-button" :href="qrUrl" target="_blank" rel="noopener">فتح صورة QR</a>
          </div>
          <div v-else class="empty-state">أضف رابط الموقع المنشور في إعدادات المطعم لإنشاء QR.</div>

          <p class="hint">توليد QR هنا يعتمد على خدمة خارجية، ويُرسل لها رابط الموقع لإنشاء الرمز.</p>
          <button class="danger-button" @click="resetDemo">إعادة ضبط إعدادات العرض المحلية</button>
          <p class="hint">هذا الزر يعيد إعدادات العرض المحلية فقط، ولا يحذف المنتجات أو الطلبات من قاعدة البيانات.</p>
        </div>

        <!-- أدوات الربط -->
        <div v-if="adminTab === 'integrations'" class="admin-content">
          <h3>أدوات الربط والاتصال</h3>

          <article class="integration-card">
            <div><strong>WhatsApp</strong><p>رابط التواصل المباشر مع المطعم.</p></div>
            <span :class="['status-pill', settings.whatsapp ? 'connected' : 'disconnected']">
              {{ settings.whatsapp ? 'الرقم مُدخل' : 'يحتاج إعداد' }}
            </span>
            <a v-if="settings.whatsapp" :href="whatsappUrl" target="_blank" rel="noopener">اختبار الرابط</a>
          </article>

          <article class="integration-card">
            <div><strong>Facebook</strong><p>صفحة المطعم الرسمية.</p></div>
            <span class="status-pill" :class="hasSocial('Facebook') ? 'connected' : 'disconnected'">
              {{ hasSocial('Facebook') ? 'الرابط مُدخل' : 'غير مربوط' }}
            </span>
          </article>

          <article class="integration-card">
            <div><strong>Instagram</strong><p>حساب المطعم على إنستجرام.</p></div>
            <span class="status-pill" :class="hasSocial('Instagram') ? 'connected' : 'disconnected'">
              {{ hasSocial('Instagram') ? 'الرابط مُدخل' : 'غير مربوط' }}
            </span>
          </article>

          <article class="integration-card">
            <div><strong>قاعدة بيانات Supabase</strong><p>تحميل المنتجات ومناطق التوصيل والإعدادات وحفظ الطلبات.</p></div>
            <span :class="['status-pill', databaseConnected ? 'connected' : 'disconnected']">
              {{ databaseConnected ? 'اتصال قاعدة البيانات ناجح' : 'الاتصال لم يكتمل' }}
            </span>
          </article>

          <article class="integration-card">
            <div><strong>Meta Business / Ads Manager</strong><p>إدارة الحملات الإعلانية وربط الحسابات.</p></div>
            <span class="status-pill disconnected">يحتاج إعداد خارجي</span>
          </article>

          <article class="integration-card">
            <div><strong>Meta Pixel / Conversion API</strong><p>قياس الزيارات والتحويلات الإعلانية.</p></div>
            <span class="status-pill disconnected">غير مربوط</span>
          </article>

          <div class="notice">
            نجاح تحميل بيانات Supabase لا يثبت وحده أن سياسات RLS آمنة أو أن جميع عمليات الإدارة تعمل. يلزم إعداد صلاحيات القراءة للزوار وصلاحيات الكتابة للمدير فقط، بالإضافة إلى إعداد وظيفة الطلبات واختبارها.
          </div>
          <button class="secondary-button" @click="loadData">اختبار الاتصال وإعادة تحميل البيانات</button>
        </div>

        <div class="admin-bottom">
          <button class="secondary-button" @click="exportBackup">تصدير نسخة بيانات JSON</button>
          <button class="secondary-button" @click="closeAdmin">معاينة الموقع</button>
          <button class="danger-button" @click="logout">تسجيل خروج</button>
        </div>
      </template>
    </section>
  </div>

  <div v-if="toast" class="toast">{{ toast }}</div>
</div>
</template>

<script>
import { supabase } from '../supabase'

const STORAGE_KEY = 'sumer-demo-v2'

const fallbackImage =
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80'

function makeId(prefix = 'item') {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7)
}

function defaultSettings() {
  return {
    name: 'سومر',
    tagline: 'من قلب الشام، نقدم لك تجربة طعام تجمع بين الأصالة والنكهة التي لا تُنسى.',
    address: '',
    phone: '',
    hours: '',
    whatsapp: '',
    vodafoneWallet: '',
    instapayAddress: '',
    publicUrl: '',
    menuUrl: '',
    menuQrEnabled: false,
    slideSeconds: 6,
    bgColor: '#171313',
    cardColor: '#241d1b',
    accentColor: '#d5ae69',
    textColor: '#f7f0e8',
    cashOnDeliveryEnabled: true,
    currency: 'EGP'
  }
}

function defaultSocialLinks() {
  return [
    { id: 'facebook', label: 'Facebook', url: '' },
    { id: 'instagram', label: 'Instagram', url: '' }
  ]
}

export default {
  name: 'HelloWorld',

  data() {
    return {
      fallbackImage,

      // البيانات الأساسية تُحمّل من Supabase بدل بيانات المنتجات المحلية القديمة.
      products: [],
      slides: [],
      settings: defaultSettings(),
      categoryRows: [],
      areas: [],
      socialLinks: defaultSocialLinks(),
      orders: [],

      search: '',
      activeCategory: 'الكل',
      cart: [],
      cartOpen: false,
      checkoutOpen: false,
      confirmedOrder: null,
      checkout: this.emptyCheckout(),
      proofFileName: '',
      paymentProofFile: null,
      orderError: '',
      sending: false,

      dbLoading: true,
      dbError: '',
      databaseConnected: false,
      ordersLoading: false,

      adminOpen: false,
      adminLoggedIn: false,
      adminUser: null,
      adminEmail: '',
      adminPassword: '',
      loginError: '',
      adminError: '',
      adminBusy: false,
      adminTab: 'orders',

      productFormOpen: false,
      editingId: null,
      productForm: this.emptyProduct(),
      slideForm: this.emptySlide(),
      areaForm: this.emptyArea(),

      slideIndex: 0,
      slideTimer: null,
      timerNow: Date.now(),
      timerInterval: null,
      delayedNotifiedOrders: [],
      lastWhatsAppStatusRefreshAt: 0,
      whatsappStatusRefreshing: false,
      toast: '',
      toastTimer: null,

      adminTabs: [
        { id: 'orders', label: 'الطلبات' },
        { id: 'products', label: 'المنيو' },
        { id: 'slides', label: 'الصور' },
        { id: 'delivery', label: 'التوصيل' },
        { id: 'settings', label: 'الإعدادات' },
        { id: 'data', label: 'بطاقة البيانات وQR' },
        { id: 'integrations', label: 'أدوات الربط' }
      ]
    }
  },

  computed: {
    themeStyle() {
      return {
        '--bg': this.settings.bgColor || '#171313',
        '--card': this.settings.cardColor || '#241d1b',
        '--accent': this.settings.accentColor || '#d5ae69',
        '--text': this.settings.textColor || '#f7f0e8'
      }
    },

    currentSlide() {
      return this.slides[this.slideIndex] || {
        image: fallbackImage,
        caption: this.settings.name || 'أهلاً بيك في سومر'
      }
    },

    heroStyle() {
      return {
        backgroundImage: 'url("' + (this.currentSlide.image || fallbackImage) + '")'
      }
    },

    categories() {
      return ['الكل', ...new Set(this.products.map(p => p.category).filter(Boolean))]
    },

    filteredProducts() {
      const term = this.search.toLowerCase()
      return this.products.filter(product => {
        const matchesCategory =
          this.activeCategory === 'الكل' || product.category === this.activeCategory
        const matchesSearch =
          !term ||
          String(product.name || '').toLowerCase().includes(term) ||
          String(product.description || '').toLowerCase().includes(term)
        return matchesCategory && matchesSearch
      })
    },

    cartCount() {
      return this.cart.reduce((sum, item) => sum + item.quantity, 0)
    },

    cartSubtotal() {
      return this.cart.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0)
    },

    selectedArea() {
      return this.areas.find(area => String(area.id) === String(this.checkout.areaId) && area.active)
    },

    selectedDeliveryFee() {
      return this.selectedArea ? Number(this.selectedArea.fee) || 0 : 0
    },

    cartTotal() {
      return this.cartSubtotal + this.selectedDeliveryFee
    },

    activeAreas() {
      return this.areas.filter(area => area.active)
    },

    visibleSocialLinks() {
      return this.socialLinks.filter(link => link.label && this.isValidUrl(link.url))
    },

    whatsappUrl() {
      const number = String(this.settings.whatsapp || '').replace(/\D/g, '')
      if (!number) return '#'
      return 'https://wa.me/' + number + '?text=' +
        encodeURIComponent('مرحبًا، أريد الاستفسار عن منيو ' + (this.settings.name || 'سومر'))
    },

    qrUrl() {
      return 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' +
        encodeURIComponent(this.settings.publicUrl || '')
    },

    menuQrTarget() {
      const explicitTarget = String(this.settings.menuUrl || '').trim()
      const publicUrl = String(this.settings.publicUrl || '').trim()
      const normalizedPublicUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl
      const currentPageUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : ''
      const target = explicitTarget || (normalizedPublicUrl ? normalizedPublicUrl + '/#menu' : (currentPageUrl ? currentPageUrl + '#menu' : ''))
      return this.isValidUrl(target) ? target : ''
    },

    menuQrUrl() {
      const target = this.menuQrTarget
      if (!target) return ''
      return 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' +
        encodeURIComponent(target)
    },

    sortedOrders() {
      return [...this.orders].sort((a, b) => Number(b.createdAtTimestamp || 0) - Number(a.createdAtTimestamp || 0))
    }
  },

  watch: {
    // لا نخزّن الطلبات أو المنتجات في localStorage بعد الربط.
    // يُحفظ محليًا فقط ما لا يوجد له عمود في جدول إعدادات المطعم.
    settings: {
      deep: true,
      handler() {
        this.persistDemo()
        this.startSlideshow()
      }
    },

    slides: {
      deep: true,
      handler() {
        if (!this.dbLoading) this.startSlideshow()
      }
    }
  },

  created() {
    this.loadLocalPreferences()
    this.startSlideshow()
    this.timerInterval = setInterval(() => {
      this.timerNow = Date.now()
      this.checkDelayedOrders()

      // Refresh WhatsApp delivery receipts while the admin order board is open.
      if (
        this.adminLoggedIn &&
        this.adminOpen &&
        this.adminTab === 'orders' &&
        this.timerNow - this.lastWhatsAppStatusRefreshAt >= 10000
      ) {
        this.lastWhatsAppStatusRefreshAt = this.timerNow
        this.refreshWhatsAppStatuses()
      }
    }, 1000)
  },

  async mounted() {
    // استعادة جلسة Supabase إن كان المدير قد سجل دخوله بالفعل.
    try {
      const { data, error } = await supabase.auth.getSession()
      if (!error && data.session?.user) {
        const { data: adminRecord, error: adminCheckError } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', data.session.user.id)
          .maybeSingle()

        if (!adminCheckError && adminRecord) {
          this.adminUser = data.session.user
          this.adminLoggedIn = true
        } else {
          await supabase.auth.signOut()
        }
      }
    } catch (error) {
      console.error('تعذر استعادة جلسة الإدارة:', error)
    }

    await this.loadData()
  },

  beforeUnmount() {
    this.stopSlideshow()
    if (this.toastTimer) clearTimeout(this.toastTimer)
    if (this.timerInterval) clearInterval(this.timerInterval)
  },

  methods: {
    emptyProduct() {
      return {
        name: '',
        price: 0,
        category: '',
        image: '',
        description: '',
        featured: false,
        available: true,
        sort_order: 0
      }
    },

    emptySlide() {
      return { id: '', image: '', caption: '', sort_order: 0 }
    },

    emptyArea() {
      return { id: '', name: '', fee: 0, active: true, sort_order: 0 }
    },

    emptyCheckout() {
      return {
        name: '',
        phone: '',
        phone2: '',
        areaId: '',
        street: '',
        floor: '',
        apartment: '',
        paymentMethod: 'cash',
        paymentReference: '',
        notes: ''
      }
    },

    money(value) {
      const currency = this.settings.currency || 'EGP'
      return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2
      }).format(Number(value) || 0)
    },

    isValidUrl(value) {
      try {
        const url = new URL(value)
        return url.protocol === 'https:' || url.protocol === 'http:'
      } catch {
        return false
      }
    },

    showToast(message) {
      this.toast = message
      if (this.toastTimer) clearTimeout(this.toastTimer)
      this.toastTimer = setTimeout(() => {
        this.toast = ''
      }, 3200)
    },

    loadLocalPreferences() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) return

        const data = JSON.parse(saved)
        const localSettings = data?.settings || {}

        // هذه القيم ليست موجودة في جدول restaurant_settings الحالي.
        for (const key of ['tagline', 'publicUrl', 'menuUrl', 'menuQrEnabled', 'slideSeconds', 'bgColor', 'cardColor', 'accentColor', 'textColor']) {
          if (localSettings[key] !== undefined) this.settings[key] = localSettings[key]
        }

        // روابط إضافية غير Facebook وInstagram يمكن حفظها محليًا فقط.
        const customLinks = Array.isArray(data.customSocialLinks)
          ? data.customSocialLinks
          : (Array.isArray(data.socialLinks) ? data.socialLinks : []).filter(link =>
              !['facebook', 'instagram'].includes(String(link.label || '').toLowerCase())
            )

        this.socialLinks = [
          ...defaultSocialLinks(),
          ...customLinks.filter(link =>
            !['facebook', 'instagram'].includes(String(link.label || '').toLowerCase())
          )
        ]
      } catch (error) {
        console.error('تعذر تحميل إعدادات العرض المحلية:', error)
      }
    },

    persistDemo() {
      try {
        const localSettings = {
          tagline: this.settings.tagline,
          publicUrl: this.settings.publicUrl,
          menuUrl: this.settings.menuUrl,
          menuQrEnabled: this.settings.menuQrEnabled,
          slideSeconds: this.settings.slideSeconds,
          bgColor: this.settings.bgColor,
          cardColor: this.settings.cardColor,
          accentColor: this.settings.accentColor,
          textColor: this.settings.textColor
        }

        const customSocialLinks = this.socialLinks.filter(link =>
          !['facebook', 'instagram'].includes(String(link.label || '').toLowerCase())
        )

        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          settings: localSettings,
          customSocialLinks
        }))
      } catch (error) {
        console.error('تعذر حفظ تفضيلات العرض المحلية:', error)
        this.showToast('تعذر حفظ بعض إعدادات العرض في هذا المتصفح.')
      }
    },

    async loadData() {
      this.dbLoading = true
      this.dbError = ''
      this.adminError = ''

      const isAdmin = Boolean(this.adminLoggedIn && this.adminUser)

      try {
        let productsQuery = supabase
          .from('products')
          .select('id,category_id,name,description,price,image_url,active,sort_order')
          .order('sort_order', { ascending: true })

        let categoriesQuery = supabase
          .from('categories')
          .select('id,name,sort_order,active')
          .order('sort_order', { ascending: true })

        let areasQuery = supabase
          .from('delivery_areas')
          .select('id,name,fee,active,sort_order')
          .order('sort_order', { ascending: true })

        if (!isAdmin) {
          productsQuery = productsQuery.eq('active', true)
          categoriesQuery = categoriesQuery.eq('active', true)
          areasQuery = areasQuery.eq('active', true)
        }

        // الصور غير الفعالة مخفية من الواجهة. يمكن إدارة الصور الفعالة من لوحة الإدارة.
        const slidesQuery = supabase
          .from('slides')
          .select('id,title,subtitle,image_url,active,sort_order')
          .eq('active', true)
          .order('sort_order', { ascending: true })

        const settingsQuery = supabase
          .from('restaurant_settings')
          .select('id,restaurant_name,phone,whatsapp,address,opening_hours,currency,cash_on_delivery_enabled,vodafone_cash_number,instapay_handle,facebook_url,instagram_url,public_url,menu_url,menu_qr_enabled')
          .eq('id', true)
          .maybeSingle()

        const [productsResult, categoriesResult, areasResult, slidesResult, settingsResult] =
          await Promise.all([
            productsQuery,
            categoriesQuery,
            areasQuery,
            slidesQuery,
            settingsQuery
          ])

        const results = [
          productsResult,
          categoriesResult,
          areasResult,
          slidesResult,
          settingsResult
        ]

        const failed = results.find(result => result.error)
        if (failed) throw failed.error

        this.categoryRows = categoriesResult.data || []

        const categoryMap = new Map(this.categoryRows.map(category => [category.id, category.name]))

        this.products = (productsResult.data || []).map(row => ({
          id: row.id,
          name: row.name,
          price: Number(row.price) || 0,
          category_id: row.category_id,
          category: categoryMap.get(row.category_id) || 'بدون قسم',
          image: row.image_url || '',
          description: row.description || '',
          // جدول products الحالي لا يحتوي على عمود featured.
          featured: false,
          available: row.active !== false,
          sort_order: Number(row.sort_order) || 0
        }))

        this.slides = (slidesResult.data || []).map(row => ({
          id: row.id,
          image: row.image_url || '',
          caption: row.title || '',
          subtitle: row.subtitle || '',
          active: row.active !== false,
          sort_order: Number(row.sort_order) || 0
        }))

        this.areas = (areasResult.data || []).map(row => ({
          id: row.id,
          name: row.name,
          fee: Number(row.fee) || 0,
          active: row.active !== false,
          sort_order: Number(row.sort_order) || 0
        }))

        const row = settingsResult.data
        if (row) {
          this.settings = {
            ...this.settings,
            name: row.restaurant_name || this.settings.name,
            phone: row.phone || '',
            whatsapp: row.whatsapp || '',
            address: row.address || '',
            hours: row.opening_hours || '',
            currency: row.currency || 'EGP',
            cashOnDeliveryEnabled: row.cash_on_delivery_enabled !== false,
            vodafoneWallet: row.vodafone_cash_number || '',
            instapayAddress: row.instapay_handle || '',
            publicUrl: row.public_url || '',
            menuUrl: row.menu_url || '',
            menuQrEnabled: row.menu_qr_enabled === true
          }

          const customLinks = this.socialLinks.filter(link =>
            !['facebook', 'instagram'].includes(String(link.label || '').toLowerCase())
          )

          this.socialLinks = [
            { id: 'facebook', label: 'Facebook', url: row.facebook_url || '' },
            { id: 'instagram', label: 'Instagram', url: row.instagram_url || '' },
            ...customLinks
          ]
        }

        this.databaseConnected = true

        if (isAdmin) await this.loadOrders()

        this.persistDemo()
      } catch (error) {
        console.error('SUMER Supabase load error:', error)
        this.databaseConnected = false
        this.dbError = 'تعذر تحميل بيانات المطعم من Supabase. راجع إعدادات الاتصال وسياسات القراءة RLS في الجداول.'
        this.showToast('تعذر تحميل بيانات قاعدة البيانات.')
      } finally {
        this.dbLoading = false
      }
    },

    async loadOrders() {
      if (!this.adminLoggedIn || !this.adminUser) {
        this.orders = []
        return
      }

      this.ordersLoading = true
      this.adminError = ''

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            customer_name,
            phone,
            backup_phone,
            area_id,
            area_name,
            street_address,
            building,
            floor,
            apartment,
            payment_method,
            payment_status,
            payment_proof_path,
            payment_reference,
            payment_confirmed_at,
            payment_confirmed_by,
            order_status,
            preparation_started_at,
            preparation_deadline_at,
            preparation_completed_at,
            preparation_minutes,
            delay_notified_at,
            subtotal,
            delivery_fee,
            total,
            notes,
            created_at,
            order_items (
              id,
              product_id,
              product_name,
              unit_price,
              quantity,
              line_total
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        this.orders = (data || []).map(row => {
          const paymentMethod = row.payment_method === 'vodafone_cash'
            ? 'vodafone'
            : row.payment_method

          return {
            dbId: row.id,
            id: String(row.order_number || row.id),
            createdAt: row.created_at ? new Date(row.created_at).toLocaleString('ar-EG') : '',
            createdAtTimestamp: row.created_at ? new Date(row.created_at).getTime() : 0,
            customer: {
              name: row.customer_name || '',
              phone: row.phone || '',
              phone2: row.backup_phone || '',
              areaId: row.area_id || '',
              areaName: row.area_name || '',
              street: row.street_address || '',
              building: row.building || '',
              floor: row.floor || '',
              apartment: row.apartment || ''
            },
            items: (row.order_items || []).map(item => ({
              id: item.id,
              productId: item.product_id,
              name: item.product_name || '',
              price: Number(item.unit_price) || 0,
              quantity: Number(item.quantity) || 0,
              lineTotal: Number(item.line_total) || 0
            })),
            subtotal: Number(row.subtotal) || 0,
            deliveryFee: Number(row.delivery_fee) || 0,
            total: Number(row.total) || 0,
            paymentMethod,
            paymentStatus: this.paymentStatusLabel(row.payment_status, paymentMethod),
            paymentStatusRaw: row.payment_status || '',
            paymentProofPath: row.payment_proof_path || '',
            paymentReference: row.payment_reference || '',
            paymentConfirmedAt: row.payment_confirmed_at || '',
            paymentConfirmedBy: row.payment_confirmed_by || '',
            paymentProofUrl: '',
            status: this.orderStatusLabel(row.order_status),
            preparationStartedAt: row.preparation_started_at || '',
            preparationDeadlineAt: row.preparation_deadline_at || '',
            preparationCompletedAt: row.preparation_completed_at || '',
            preparationMinutes: Number(row.preparation_minutes) || 30,
            delayNotifiedAt: row.delay_notified_at || '',
            notes: row.notes || '',
            whatsappMessages: []
          }
        })

        // Load WhatsApp message receipts for these orders using the admin-only database policy.
        const orderIds = this.orders.map(order => order.dbId)
        if (orderIds.length) {
          const { data: messageRows, error: messageRowsError } = await supabase
            .from('sumer_whatsapp_messages')
            .select('message_id, order_id, message_type, status, provider_timestamp, last_error, created_at')
            .in('order_id', orderIds)
            .order('created_at', { ascending: false })

          if (messageRowsError) {
            console.warn('SUMER WhatsApp status list could not be loaded:', messageRowsError)
          } else {
            const messagesByOrder = new Map()
            for (const row of (messageRows || [])) {
              const current = messagesByOrder.get(row.order_id) || []
              current.push({
                messageId: row.message_id,
                messageType: row.message_type || 'other',
                status: row.status || 'unknown',
                providerTimestamp: row.provider_timestamp || '',
                lastError: row.last_error || null,
                createdAt: row.created_at || ''
              })
              messagesByOrder.set(row.order_id, current)
            }
            this.orders = this.orders.map(order => ({
              ...order,
              whatsappMessages: messagesByOrder.get(order.dbId) || []
            }))
          }
        }
      } catch (error) {
        console.error('SUMER orders load error:', error)
        this.adminError = 'تعذر تحميل الطلبات. تحقق من علاقة order_items وجدول orders وصلاحيات المدير.'
      } finally {
        this.ordersLoading = false
      }
    },

    orderStatusLabel(status) {
      const value = String(status || '').toLowerCase()
      const labels = {
        new: 'جديد',
        pending: 'جديد',
        received: 'جديد',
        preparing: 'قيد التجهيز',
        processing: 'قيد التجهيز',
        out_for_delivery: 'خرج للتوصيل',
        delivering: 'خرج للتوصيل',
        delivered: 'تم التسليم',
        completed: 'تم التسليم',
        cancelled: 'ملغي',
        canceled: 'ملغي'
      }
      return labels[value] || status || 'جديد'
    },

    orderStatusDatabaseValue(status) {
      const values = {
        'جديد': 'new',
        'قيد التجهيز': 'preparing',
        'خرج للتوصيل': 'out_for_delivery',
        'تم التسليم': 'delivered',
        'ملغي': 'cancelled'
      }
      return values[status] || status
    },

    paymentStatusLabel(status, method) {
      if (method === 'cash') return 'الدفع عند الاستلام'

      const value = String(status || '').toLowerCase()
      if (['pending', 'unpaid', 'review', 'under_review', ''].includes(value)) return 'مراجعة مطلوبة'
      if (['paid', 'confirmed', 'success'].includes(value)) return 'تم الدفع'
      if (['rejected', 'failed', 'declined'].includes(value)) return 'مرفوض'

      return status || 'مراجعة مطلوبة'
    },

    paymentLabel(method) {
      return {
        cash: 'الدفع عند الاستلام',
        vodafone: 'فودافون كاش',
        vodafone_cash: 'فودافون كاش',
        instapay: 'إنستاباي'
      }[method] || method
    },

    orderAgeSeconds(order) {
      const createdAt = Number(order?.createdAtTimestamp)
      if (!Number.isFinite(createdAt) || createdAt <= 0) return null
      return Math.max(0, Math.floor((this.timerNow - createdAt) / 1000))
    },

    formatOrderAge(order) {
      const totalSeconds = this.orderAgeSeconds(order)
      if (totalSeconds === null) return 'غير متاح'
      const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
      const seconds = String(totalSeconds % 60).padStart(2, '0')
      return hours + ':' + minutes + ':' + seconds
    },

    whatsappMessageTypeLabel(type) {
      const labels = {
        order_summary: 'ملخص الطلب',
        order_item_image: 'صورة صنف',
        payment_receipt: 'إيصال الدفع',
        test_image: 'صورة اختبار',
        test_text: 'رسالة اختبار',
        other: 'رسالة واتساب'
      }
      return labels[type] || labels.other
    },

    whatsappMessageStatusLabel(status) {
      const labels = {
        accepted: 'تم قبول الإرسال',
        sent: 'تم الإرسال',
        delivered: 'تم التسليم',
        read: 'تمت القراءة',
        failed: 'فشل الإرسال',
        unknown: 'حالة غير معروفة'
      }
      return labels[status] || labels.unknown
    },

    preparationRemaining(order) {
      if (!order?.preparationDeadlineAt) return null
      const deadline = new Date(order.preparationDeadlineAt).getTime()
      if (!Number.isFinite(deadline)) return null
      return Math.floor((deadline - this.timerNow) / 1000)
    },

    formatPreparationRemaining(order) {
      const remaining = this.preparationRemaining(order)
      if (remaining === null) return 'لم يبدأ'
      const totalSeconds = Math.abs(remaining)
      const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
      const seconds = String(totalSeconds % 60).padStart(2, '0')
      return (remaining < 0 ? 'تأخير ' : 'متبقي ') + hours + ':' + minutes + ':' + seconds
    },

    async refreshWhatsAppStatuses() {
      if (!this.adminLoggedIn || !this.adminOpen || this.whatsappStatusRefreshing) return
      const orderIds = this.orders.map(order => order.dbId)
      if (!orderIds.length) return

      this.whatsappStatusRefreshing = true
      try {
        const { data, error } = await supabase
          .from('sumer_whatsapp_messages')
          .select('message_id, order_id, message_type, status, provider_timestamp, last_error, created_at')
          .in('order_id', orderIds)
          .order('created_at', { ascending: false })

        if (error) throw error
        const messagesByOrder = new Map()
        for (const row of (data || [])) {
          const current = messagesByOrder.get(row.order_id) || []
          current.push({
            messageId: row.message_id,
            messageType: row.message_type || 'other',
            status: row.status || 'unknown',
            providerTimestamp: row.provider_timestamp || '',
            lastError: row.last_error || null,
            createdAt: row.created_at || ''
          })
          messagesByOrder.set(row.order_id, current)
        }
        this.orders = this.orders.map(order => ({
          ...order,
          whatsappMessages: messagesByOrder.get(order.dbId) || []
        }))
      } catch (error) {
        console.warn('SUMER WhatsApp status refresh failed:', error)
      } finally {
        this.whatsappStatusRefreshing = false
      }
    },

    async checkDelayedOrders() {
      if (!this.adminLoggedIn || !this.adminOpen) return
      for (const order of this.orders) {
        if (!['جديد', 'قيد التجهيز'].includes(order.status) || this.preparationRemaining(order) === null) continue
        if (
          this.preparationRemaining(order) <= 0 &&
          !order.delayNotifiedAt &&
          !this.delayedNotifiedOrders.includes(order.dbId)
        ) {
          // Prevent repeated alerts after refreshing the admin panel.
          this.delayedNotifiedOrders.push(order.dbId)
          const notifiedAt = new Date().toISOString()
          const { error } = await supabase
            .from('orders')
            .update({ delay_notified_at: notifiedAt })
            .eq('id', order.dbId)

          if (error) {
            console.warn('Could not persist SUMER delay notification state:', error)
          } else {
            order.delayNotifiedAt = notifiedAt
          }

          this.showToast('تنبيه تأخير: الطلب #' + order.id + ' تجاوز وقت التجهيز المحدد.')
          if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
            new window.Notification('طلب سومر متأخر', {
              body: 'الطلب #' + order.id + ' تجاوز وقت التجهيز المحدد.'
            })
          }
        }
      }
    },

    async updateOrderStatus(dbId, status) {
      if (!this.adminLoggedIn) return

      const newStatus = this.orderStatusDatabaseValue(status)
      try {
        const { error } = await supabase
          .from('orders')
          .update({ order_status: newStatus })
          .eq('id', dbId)

        if (error) throw error

        const order = this.orders.find(row => row.dbId === dbId)
        if (order) order.status = status
        this.showToast('تم تحديث حالة الطلب في قاعدة البيانات.')
        await this.loadOrders()
      } catch (error) {
        console.error('SUMER order status error:', error)
        this.adminError = 'تعذر تعديل حالة الطلب. تحقق من صلاحيات تحديث جدول orders.'
        await this.loadOrders()
      }
    },

    async updatePaymentStatus(dbId, status) {
      if (!this.adminLoggedIn || !['pending', 'review', 'paid', 'failed'].includes(status)) return

      const order = this.orders.find(row => row.dbId === dbId)
      if (!order) return

      try {
        if (status === 'paid') {
          // Use the database confirmation function, which independently verifies the signed-in SUMER admin.
          const { error } = await supabase.rpc('confirm_sumer_payment', {
            p_order_number: Number(order.id),
            p_reference: order.paymentReference || null
          })
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('orders')
            .update({
              payment_status: status,
              payment_confirmed_at: null,
              payment_confirmed_by: null
            })
            .eq('id', dbId)

          if (error) throw error
        }

        order.paymentStatusRaw = status
        order.paymentStatus = this.paymentStatusLabel(status, order.paymentMethod)
        order.paymentConfirmedAt = status === 'paid' ? new Date().toISOString() : ''
        order.paymentConfirmedBy = status === 'paid' ? this.adminUser?.id || '' : ''
        this.showToast(status === 'paid' ? 'تم تأكيد الدفع يدويًا وتحديث الطلب.' : 'تم تحديث حالة الدفع.')
      } catch (error) {
        console.error('SUMER payment status error:', error)
        this.adminError = 'تعذر تحديث حالة الدفع. تحقق من صلاحيات المدير وحالة الطلب.'
        await this.loadOrders()
      }
    },

    async preparePaymentProof(order) {
      if (!this.adminLoggedIn || !order?.paymentProofPath) return

      try {
        const { data, error } = await supabase
          .storage
          .from('sumer-payment-proofs')
          .createSignedUrl(order.paymentProofPath, 60)

        if (error) throw error
        order.paymentProofUrl = data.signedUrl
      } catch (error) {
        console.error('SUMER payment proof access error:', error)
        this.adminError = 'تعذر تجهيز رابط الإيصال. تأكد من صلاحيات المدير ومخزن الإيصالات.'
      }
    },

    async deleteOrder(dbId) {
      if (!this.adminLoggedIn) return
      if (!confirm('هل تريد حذف الطلب من قاعدة البيانات؟')) return

      this.adminBusy = true
      this.adminError = ''

      try {
        // حذف العناصر أولًا لتفادي مشكلة المفتاح الأجنبي إن لم يكن ON DELETE CASCADE.
        const { error: itemsError } = await supabase
          .from('order_items')
          .delete()
          .eq('order_id', dbId)

        if (itemsError) throw itemsError

        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', dbId)

        if (error) throw error

        this.orders = this.orders.filter(order => order.dbId !== dbId)
        this.showToast('تم حذف الطلب من قاعدة البيانات.')
      } catch (error) {
        console.error('SUMER delete order error:', error)
        this.adminError = 'تعذر حذف الطلب. تحقق من سياسات الحذف وعلاقة order_items.'
      } finally {
        this.adminBusy = false
      }
    },

    addToCart(product) {
      if (product.available === false) return

      const existing = this.cart.find(item => item.id === product.id)
      if (existing) {
        existing.quantity += 1
      } else {
        this.cart.push({
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          quantity: 1
        })
      }
      this.showToast('تمت إضافة الصنف للسلة')
    },

    changeQuantity(id, amount) {
      const item = this.cart.find(row => row.id === id)
      if (!item) return

      item.quantity += amount
      if (item.quantity <= 0) {
        this.cart = this.cart.filter(row => row.id !== id)
      }
    },

    openCheckout() {
      if (!this.cart.length) {
        this.showToast('السلة فاضية')
        return
      }

      if (!this.activeAreas.length) {
        this.showToast('لا توجد مناطق توصيل متاحة في قاعدة البيانات.')
        return
      }

      if (!this.checkout.areaId || !this.activeAreas.some(area => String(area.id) === String(this.checkout.areaId))) {
        this.checkout.areaId = this.activeAreas[0].id
      }

      this.cartOpen = false
      this.checkoutOpen = true
      this.orderError = ''
    },

    handleProofUpload(event) {
      const file = event.target.files && event.target.files[0]
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
      this.orderError = ''

      if (!file) {
        this.paymentProofFile = null
        this.proofFileName = ''
        return
      }

      if (!allowedTypes.includes(file.type) || file.size > 2 * 1024 * 1024) {
        this.paymentProofFile = null
        this.proofFileName = ''
        event.target.value = ''
        this.orderError = 'ارفع صورة بصيغة JPG أو PNG أو WEBP أو AVIF، وبحجم لا يتجاوز 2 ميجابايت.'
        return
      }

      this.paymentProofFile = file
      this.proofFileName = file.name
    },

    async submitOrder() {
      if (this.sending) return

      if (!this.cart.length) {
        this.orderError = 'السلة فاضية.'
        return
      }

      if (!this.checkout.name || !this.checkout.phone || !this.checkout.street || !this.selectedArea) {
        this.orderError = 'من فضلك أكمل بيانات الطلب المطلوبة.'
        return
      }

      if (this.checkout.paymentMethod === 'cash' && this.settings.cashOnDeliveryEnabled === false) {
        this.orderError = 'الدفع عند الاستلام غير متاح حاليًا.'
        return
      }

      if (this.checkout.paymentMethod !== 'cash' && !this.paymentProofFile) {
        this.orderError = 'لازم ترفع صورة إيصال التحويل قبل تأكيد الطلب.'
        return
      }

      this.sending = true
      this.orderError = ''

      const previousTotal = this.cartTotal

      try {
        const paymentMethod = this.checkout.paymentMethod === 'vodafone'
          ? 'vodafone_cash'
          : this.checkout.paymentMethod

        const requestBody = {
          customer: {
            name: this.checkout.name,
            phone: this.checkout.phone,
            backupPhone: this.checkout.phone2 || '',
            streetAddress: this.checkout.street,
            building: '',
            floor: this.checkout.floor || '',
            apartment: this.checkout.apartment || '',
            notes: this.checkout.notes || '',
            areaId: this.checkout.areaId,
            paymentMethod,
            paymentReference: this.checkout.paymentReference || ''
          },
          items: this.cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
          }))
        }

        const formData = new FormData()
        formData.append('order', JSON.stringify(requestBody))
        if (this.checkout.paymentMethod !== 'cash' && this.paymentProofFile) {
          formData.append('paymentProof', this.paymentProofFile, this.paymentProofFile.name)
        }

        const { data, error } = await supabase.functions.invoke('create-sumer-order', {
          body: formData
        })

        if (error) throw error
        if (!data || data.error) throw new Error(data?.error || 'لم يتم تأكيد الطلب من الخادم.')

        const orderNumber = data.orderNumber || data.order_number || data.id || 'تم التأكيد'
        const confirmedTotal = Number(data.total)

        this.confirmedOrder = {
          id: String(orderNumber),
          total: Number.isFinite(confirmedTotal) ? confirmedTotal : previousTotal,
          status: paymentMethod === 'cash'
            ? 'تم تسجيل الطلب في قاعدة البيانات'
            : 'تم تسجيل الطلب — الدفع قيد مراجعة الإدارة',
          whatsappNotification: String(data.whatsappNotification || '')
        }

        this.cart = []
        this.checkout = this.emptyCheckout()
        this.proofFileName = ''
        this.paymentProofFile = null
        this.checkoutOpen = false

        this.showToast('تم إرسال الطلب إلى قاعدة البيانات.')
      } catch (error) {
        console.error('SUMER order submit error:', error)
        this.orderError = 'تعذر تسجيل الطلب. تحقق من نشر create-sumer-order ومن إعدادات قاعدة البيانات وصلاحياتها.'
      } finally {
        this.sending = false
      }
    },

    async openAdmin() {
      this.adminOpen = true
      this.loginError = ''
      this.adminError = ''

      try {
        const { data } = await supabase.auth.getSession()
        if (data.session?.user) {
          const { data: record, error } = await supabase
            .from('admin_users')
            .select('user_id')
            .eq('user_id', data.session.user.id)
            .maybeSingle()

          if (!error && record) {
            this.adminUser = data.session.user
            this.adminLoggedIn = true
            await this.loadData()
            return
          }
        }
      } catch (error) {
        console.error('Admin session check error:', error)
      }

      this.adminLoggedIn = false
      this.adminUser = null
    },

    async closeAdmin() {
      // Closing an authenticated admin panel must also end the Supabase session.
      // This prevents the panel from reopening without a fresh login after an outside click.
      if (this.adminLoggedIn) {
        await this.logout()
        return
      }

      this.adminOpen = false
      this.loginError = ''
      this.adminError = ''
      this.adminPassword = ''
    },

    async login() {
      if (this.adminBusy) return

      this.adminBusy = true
      this.loginError = ''
      this.adminError = ''

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: this.adminEmail,
          password: this.adminPassword
        })

        if (error) throw error
        if (!data.user) throw new Error('تعذر تحديد حساب المستخدم.')

        const { data: adminRecord, error: adminError } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', data.user.id)
          .maybeSingle()

        if (adminError) throw adminError

        if (!adminRecord) {
          await supabase.auth.signOut()
          throw new Error('الحساب سجل دخوله، لكنه غير مضاف في جدول admin_users.')
        }

        this.adminUser = data.user
        this.adminLoggedIn = true
        this.adminPassword = ''

        await this.loadData()
        this.adminTab = 'orders'
        this.showToast('تم تسجيل دخول الإدارة.')
      } catch (error) {
        console.error('SUMER admin login error:', error)
        this.loginError = error.message || 'فشل تسجيل الدخول. راجع البريد وكلمة المرور وصلاحيات المدير.'
      } finally {
        this.adminBusy = false
      }
    },

    async logout() {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      } catch (error) {
        console.error('SUMER logout error:', error)
      }

      this.adminUser = null
      this.adminLoggedIn = false
      this.adminPassword = ''
      this.adminEmail = ''
      this.orders = []
      this.adminOpen = false
      await this.loadData()
      this.showToast('تم تسجيل الخروج.')
    },

    newProduct() {
      this.editingId = null
      this.productForm = this.emptyProduct()
      this.productFormOpen = true
      this.adminError = ''
    },

    editProduct(product) {
      this.editingId = product.id
      this.productForm = {
        id: product.id,
        name: product.name || '',
        price: Number(product.price) || 0,
        category: product.category === 'بدون قسم' ? '' : product.category,
        image: product.image || '',
        description: product.description || '',
        featured: Boolean(product.featured),
        available: product.available !== false,
        sort_order: Number(product.sort_order) || 0
      }
      this.productFormOpen = true
      this.adminError = ''
    },

    cancelProduct() {
      this.productFormOpen = false
      this.editingId = null
      this.productForm = this.emptyProduct()
    },

    async findOrCreateCategory(name) {
      const categoryName = String(name || '').trim()
      if (!categoryName) return null

      const existing = this.categoryRows.find(category =>
        String(category.name || '').trim().toLowerCase() === categoryName.toLowerCase()
      )

      if (existing) {
        if (existing.active === false) {
          const { error } = await supabase
            .from('categories')
            .update({ active: true })
            .eq('id', existing.id)

          if (error) throw error
        }
        return existing.id
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryName,
          sort_order: this.categoryRows.length + 1,
          active: true
        })
        .select('id,name,sort_order,active')
        .single()

      if (error) throw error
      this.categoryRows.push(data)
      return data.id
    },

    async saveProduct() {
      if (!this.adminLoggedIn) return
      if (!this.productForm.name || !this.productForm.category || Number(this.productForm.price) < 0) {
        this.adminError = 'راجع اسم الصنف والقسم والسعر.'
        return
      }

      this.adminBusy = true
      this.adminError = ''

      try {
        const categoryId = await this.findOrCreateCategory(this.productForm.category)

        const payload = {
          name: String(this.productForm.name).trim(),
          description: String(this.productForm.description || '').trim(),
          price: Number(this.productForm.price) || 0,
          category_id: categoryId,
          image_url: String(this.productForm.image || '').trim(),
          active: this.productForm.available !== false,
          sort_order: Number(this.productForm.sort_order) || this.products.length
        }

        let result
        if (this.editingId) {
          result = await supabase
            .from('products')
            .update(payload)
            .eq('id', this.editingId)
            .select('id')
            .single()
        } else {
          result = await supabase
            .from('products')
            .insert(payload)
            .select('id')
            .single()
        }

        if (result.error) throw result.error

        this.cancelProduct()
        await this.loadData()
        this.showToast('تم حفظ المنتج في قاعدة البيانات.')
      } catch (error) {
        console.error('SUMER save product error:', error)
        this.adminError = 'تعذر حفظ المنتج. تحقق من صلاحيات categories وproducts وسياسات RLS.'
      } finally {
        this.adminBusy = false
      }
    },

    async deleteProduct(id) {
      if (!this.adminLoggedIn) return
      if (!confirm('سيتم إيقاف المنتج عن الظهور للعملاء دون حذف سجلّه نهائيًا. هل تريد المتابعة؟')) return

      this.adminBusy = true
      this.adminError = ''

      try {
        const { error } = await supabase
          .from('products')
          .update({ active: false })
          .eq('id', id)

        if (error) throw error

        this.cart = this.cart.filter(item => item.id !== id)
        await this.loadData()
        this.showToast('تم إيقاف المنتج.')
      } catch (error) {
        console.error('SUMER disable product error:', error)
        this.adminError = 'تعذر إيقاف المنتج. تحقق من صلاحيات تعديل جدول products.'
      } finally {
        this.adminBusy = false
      }
    },

    resetSlideForm() {
      this.slideForm = this.emptySlide()
    },

    editSlide(slide) {
      this.slideForm = { ...slide }
    },

    async saveSlide() {
      if (!this.adminLoggedIn) return
      if (!this.isValidUrl(this.slideForm.image)) {
        this.adminError = 'أدخل رابط صورة صحيح يبدأ بـ https://'
        return
      }

      this.adminBusy = true
      this.adminError = ''

      try {
        const payload = {
          title: String(this.slideForm.caption || '').trim(),
          subtitle: '',
          image_url: String(this.slideForm.image).trim(),
          active: true,
          sort_order: Number(this.slideForm.sort_order) || this.slides.length
        }

        let result
        if (this.slideForm.id) {
          result = await supabase
            .from('slides')
            .update(payload)
            .eq('id', this.slideForm.id)
        } else {
          result = await supabase.from('slides').insert(payload)
        }

        if (result.error) throw result.error

        this.resetSlideForm()
        await this.loadData()
        this.showToast('تم حفظ الصورة في قاعدة البيانات.')
      } catch (error) {
        console.error('SUMER slide save error:', error)
        this.adminError = 'تعذر حفظ الصورة. تحقق من صلاحيات جدول slides.'
      } finally {
        this.adminBusy = false
      }
    },

    async deleteSlide(id) {
      if (!this.adminLoggedIn) return
      if (this.slides.length <= 1) {
        this.showToast('احتفظ بصورة واحدة على الأقل في الواجهة.')
        return
      }
      if (!confirm('سيتم إخفاء الصورة من الواجهة. هل تريد المتابعة؟')) return

      this.adminBusy = true
      this.adminError = ''

      try {
        const { error } = await supabase
          .from('slides')
          .update({ active: false })
          .eq('id', id)

        if (error) throw error
        await this.loadData()
        this.showToast('تم إخفاء الصورة.')
      } catch (error) {
        console.error('SUMER slide delete error:', error)
        this.adminError = 'تعذر إخفاء الصورة. تحقق من صلاحيات جدول slides.'
      } finally {
        this.adminBusy = false
      }
    },

    async moveSlide(index, direction) {
      if (!this.adminLoggedIn) return
      const target = index + direction
      if (target < 0 || target >= this.slides.length) return

      const reordered = [...this.slides]
      const item = reordered[index]
      reordered[index] = reordered[target]
      reordered[target] = item

      this.adminBusy = true
      this.adminError = ''

      try {
        for (let i = 0; i < reordered.length; i++) {
          const { error } = await supabase
            .from('slides')
            .update({ sort_order: i + 1 })
            .eq('id', reordered[i].id)

          if (error) throw error
        }

        this.slideIndex = 0
        await this.loadData()
      } catch (error) {
        console.error('SUMER slide reorder error:', error)
        this.adminError = 'تعذر تغيير ترتيب الصور.'
      } finally {
        this.adminBusy = false
      }
    },

    resetAreaForm() {
      this.areaForm = this.emptyArea()
    },

    editArea(area) {
      this.areaForm = { ...area }
    },

    async saveArea() {
      if (!this.adminLoggedIn) return
      if (!this.areaForm.name || Number(this.areaForm.fee) < 0) {
        this.adminError = 'أدخل اسم المنطقة وسعر توصيل صحيح.'
        return
      }

      this.adminBusy = true
      this.adminError = ''

      try {
        const payload = {
          name: String(this.areaForm.name).trim(),
          fee: Number(this.areaForm.fee) || 0,
          active: Boolean(this.areaForm.active),
          sort_order: Number(this.areaForm.sort_order) || this.areas.length + 1
        }

        let result
        if (this.areaForm.id) {
          result = await supabase
            .from('delivery_areas')
            .update(payload)
            .eq('id', this.areaForm.id)
        } else {
          result = await supabase.from('delivery_areas').insert(payload)
        }

        if (result.error) throw result.error

        this.resetAreaForm()
        await this.loadData()
        this.showToast('تم حفظ منطقة التوصيل.')
      } catch (error) {
        console.error('SUMER save area error:', error)
        this.adminError = 'تعذر حفظ منطقة التوصيل. تحقق من صلاحيات جدول delivery_areas.'
      } finally {
        this.adminBusy = false
      }
    },

    async deleteArea(id) {
      if (!this.adminLoggedIn) return
      if (!confirm('سيتم إيقاف منطقة التوصيل عن استقبال الطلبات الجديدة. هل تريد المتابعة؟')) return

      this.adminBusy = true
      this.adminError = ''

      try {
        const { error } = await supabase
          .from('delivery_areas')
          .update({ active: false })
          .eq('id', id)

        if (error) throw error

        if (String(this.checkout.areaId) === String(id)) this.checkout.areaId = ''
        await this.loadData()
        this.showToast('تم إيقاف منطقة التوصيل.')
      } catch (error) {
        console.error('SUMER disable area error:', error)
        this.adminError = 'تعذر إيقاف منطقة التوصيل. تحقق من صلاحيات جدول delivery_areas.'
      } finally {
        this.adminBusy = false
      }
    },

    async saveSettings() {
      if (!this.adminLoggedIn) return

      this.adminBusy = true
      this.adminError = ''

      try {
        const facebookUrl = this.socialLinks.find(link =>
          String(link.label || '').toLowerCase() === 'facebook'
        )?.url || ''

        const instagramUrl = this.socialLinks.find(link =>
          String(link.label || '').toLowerCase() === 'instagram'
        )?.url || ''

        const payload = {
          id: true,
          restaurant_name: String(this.settings.name || 'سومر').trim(),
          phone: String(this.settings.phone || '').trim(),
          whatsapp: String(this.settings.whatsapp || '').trim(),
          address: String(this.settings.address || '').trim(),
          opening_hours: String(this.settings.hours || '').trim(),
          currency: this.settings.currency || 'EGP',
          cash_on_delivery_enabled: this.settings.cashOnDeliveryEnabled !== false,
          vodafone_cash_number: String(this.settings.vodafoneWallet || '').trim(),
          instapay_handle: String(this.settings.instapayAddress || '').trim(),
          public_url: String(this.settings.publicUrl || '').trim(),
          menu_url: String(this.settings.menuUrl || '').trim(),
          menu_qr_enabled: this.settings.menuQrEnabled === true,
          facebook_url: String(facebookUrl || '').trim(),
          instagram_url: String(instagramUrl || '').trim(),
          updated_at: new Date().toISOString()
        }

        const { error } = await supabase
          .from('restaurant_settings')
          .upsert(payload, { onConflict: 'id' })

        if (error) throw error

        this.persistDemo()
        await this.loadData()
        this.showToast('تم حفظ إعدادات المطعم في Supabase.')
      } catch (error) {
        console.error('SUMER settings save error:', error)
        this.adminError = 'تعذر حفظ الإعدادات. تأكد من صلاحية المدير على restaurant_settings وسياسات RLS.'
      } finally {
        this.adminBusy = false
      }
    },

    addSocialLink() {
      this.socialLinks.push({ id: makeId('l'), label: '', url: '' })
    },

    removeSocialLink(id) {
      const link = this.socialLinks.find(item => item.id === id)
      if (link && ['facebook', 'instagram'].includes(String(link.label || '').toLowerCase())) {
        link.url = ''
      } else {
        this.socialLinks = this.socialLinks.filter(item => item.id !== id)
      }
      this.persistDemo()
    },

    hasSocial(name) {
      return this.socialLinks.some(link =>
        String(link.label || '').toLowerCase() === name.toLowerCase() &&
        this.isValidUrl(link.url)
      )
    },

    copyRestaurantData() {
      const text =
        'اسم المطعم: ' + (this.settings.name || '') + '\n' +
        'الوصف: ' + (this.settings.tagline || '') + '\n' +
        'العنوان: ' + (this.settings.address || '') + '\n' +
        'الهاتف: ' + (this.settings.phone || '') + '\n' +
        'واتساب: ' + (this.settings.whatsapp || '') + '\n' +
        'مواعيد العمل: ' + (this.settings.hours || '')

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(() => this.showToast('تم نسخ بيانات المطعم'))
          .catch(() => this.downloadFile(text, 'sumer-data.txt', 'text/plain;charset=utf-8'))
      } else {
        this.downloadFile(text, 'sumer-data.txt', 'text/plain;charset=utf-8')
      }
    },

    exportOrders() {
      if (!this.orders.length) {
        this.showToast('لا توجد طلبات للتصدير')
        return
      }

      const columns = [
        'رقم الطلب', 'التاريخ', 'اسم العميل', 'الهاتف', 'هاتف بديل',
        'المنطقة', 'العنوان', 'الدفع', 'حالة الدفع', 'حالة الطلب',
        'المنتجات', 'قيمة المنتجات', 'التوصيل', 'الإجمالي', 'ملاحظات'
      ]

      const rows = this.sortedOrders.map(order => [
        order.id,
        order.createdAt,
        order.customer.name,
        order.customer.phone,
        order.customer.phone2,
        order.customer.areaName,
        [order.customer.street, order.customer.floor, order.customer.apartment].filter(Boolean).join(' - '),
        this.paymentLabel(order.paymentMethod),
        order.paymentStatus,
        order.status,
        order.items.map(item => item.name + ' × ' + item.quantity).join('، '),
        order.subtotal,
        order.deliveryFee,
        order.total,
        order.notes
      ])

      const csv = [columns, ...rows].map(row =>
        row.map(value => '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"').join(',')
      ).join('\r\n')

      this.downloadFile('\uFEFF' + csv, 'sumer-orders.csv', 'text/csv;charset=utf-8;')
    },

    downloadFile(content, filename, type) {
      const blob = new Blob([content], { type })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    },

    exportBackup() {
      const backup = {
        products: this.products,
        slides: this.slides,
        settings: this.settings,
        areas: this.areas,
        orders: this.orders,
        exportedAt: new Date().toISOString()
      }

      this.downloadFile(
        JSON.stringify(backup, null, 2),
        'sumer-database-export.json',
        'application/json;charset=utf-8'
      )
      this.showToast('تم تجهيز نسخة البيانات المحمّلة حاليًا.')
    },

    resetDemo() {
      if (!confirm('سيتم إعادة إعدادات العرض المحلية فقط. لن يتم حذف بيانات قاعدة البيانات. هل تريد المتابعة؟')) return

      const defaults = defaultSettings()
      this.settings.tagline = defaults.tagline
      this.settings.publicUrl = ''
      this.settings.slideSeconds = defaults.slideSeconds
      this.settings.bgColor = defaults.bgColor
      this.settings.cardColor = defaults.cardColor
      this.settings.accentColor = defaults.accentColor
      this.settings.textColor = defaults.textColor

      this.persistDemo()
      this.startSlideshow()
      this.showToast('تمت إعادة إعدادات العرض المحلية. بيانات Supabase لم تتغير.')
    },

    startSlideshow() {
      this.stopSlideshow()
      if (this.slides.length < 2) return

      const seconds = Math.min(60, Math.max(2, Number(this.settings.slideSeconds) || 6))
      this.slideTimer = setInterval(() => {
        if (this.slides.length) this.slideIndex = (this.slideIndex + 1) % this.slides.length
      }, seconds * 1000)
    },

    stopSlideshow() {
      if (this.slideTimer) {
        clearInterval(this.slideTimer)
        this.slideTimer = null
      }
    },

    setSlide(index) {
      this.slideIndex = index
      this.startSlideshow()
    },

    changeSlide(direction) {
      if (!this.slides.length) return
      this.slideIndex = (this.slideIndex + direction + this.slides.length) % this.slides.length
      this.startSlideshow()
    },

    onImageError(event) {
      if (event.target.src !== fallbackImage) event.target.src = fallbackImage
    }
  }
}
</script>

<style>
.footer-menu-qr { display: flex; flex-direction: column; align-items: center; gap: 5px; margin-top: 8px; }
.footer-menu-qr img { display: block; width: 72px; height: 72px; padding: 4px; border-radius: 8px; background: #fff; object-fit: contain; }
.footer-menu-qr small { font-size: 0.72rem; opacity: 0.85; text-align: center; }

@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');

:root {
  color-scheme: dark;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  background: #171313;
}

body {
  margin: 0;
  min-width: 320px;
  font-family: 'Cairo', sans-serif;
  background: #171313;
}

button,
input,
textarea,
select {
  font: inherit;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

a {
  color: inherit;
  text-decoration: none;
}

.sumer {
  --bg: #171313;
  --card: #241d1b;
  --accent: #d5ae69;
  --text: #f7f0e8;
  min-height: 100vh;
  overflow: hidden;
  color: var(--text);
  background: var(--bg);
  font-family: 'Cairo', sans-serif;
}

.topbar {
  position: relative;
  z-index: 5;
  min-height: 82px;
  padding: 14px 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  background: #171313;
  border-bottom: 1px solid rgba(213, 174, 105, 0.18);
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  flex-shrink: 0;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 45px;
  height: 45px;
  color: #171313;
  font-family: Georgia, serif;
  font-size: 28px;
  font-weight: bold;
  background: var(--accent);
  border-radius: 50%;
}

.brand strong,
.brand small {
  display: block;
}

.brand strong {
  font-size: 21px;
}

.brand small {
  color: var(--accent);
  font-size: 9px;
  letter-spacing: 2px;
}

.nav-links,
.top-actions {
  display: flex;
  align-items: center;
  gap: 18px;
}

.nav-links a {
  color: #e0d6cd;
  font-size: 13px;
  transition: color 0.2s;
}

.nav-links a:hover,
.footer-links a:hover {
  color: var(--accent);
}

.top-actions {
  gap: 9px;
}

.cart-button,
.whatsapp-top,
.icon-button {
  padding: 9px 13px;
  border: 1px solid rgba(213, 174, 105, 0.45);
  border-radius: 8px;
  color: var(--text);
  background: transparent;
  font-size: 12px;
}

.cart-button span {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  margin-right: 4px;
  border-radius: 50%;
  color: #171313;
  background: var(--accent);
}

.whatsapp-top {
  color: #b7f5c7;
  border-color: rgba(55, 190, 100, 0.45);
}

.icon-button {
  font-size: 18px;
}

.hero {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 550px;
  padding: 65px 24px;
  background-position: center;
  background-size: cover;
  transition: background-image 0.3s;
}

.hero-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(15, 11, 10, 0.45), rgba(15, 11, 10, 0.85) 70%);
}

.hero-content {
  position: relative;
  z-index: 1;
  width: min(760px, 100%);
  text-align: center;
}

.eyebrow {
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
}

.hero h1 {
  margin: 18px 0 12px;
  font-size: clamp(36px, 6vw, 67px);
  font-weight: 900;
  line-height: 1.3;
}

.hero p {
  max-width: 590px;
  margin: 0 auto 29px;
  color: #e7ddd3;
  font-size: 16px;
  line-height: 2.1;
}

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 45px;
  padding: 11px 23px;
  border: 1px solid var(--accent);
  border-radius: 7px;
  color: #1b1511;
  background: var(--accent);
  font-weight: 800;
  font-size: 13px;
  transition: transform 0.2s, filter 0.2s;
}

.primary-button:hover {
  transform: translateY(-1px);
  filter: brightness(1.08);
}

.slide-arrow {
  position: absolute;
  z-index: 2;
  top: 50%;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  transform: translateY(-50%);
}

.slide-arrow.prev {
  right: 22px;
}

.slide-arrow.next {
  left: 22px;
}

.slide-dots {
  position: absolute;
  z-index: 2;
  bottom: 25px;
  display: flex;
  gap: 8px;
}

.slide-dots button {
  width: 9px;
  height: 9px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #c5b7a7;
}

.slide-dots button.active {
  width: 25px;
  border-radius: 8px;
  background: var(--accent);
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 29px 7%;
  border-bottom: 1px solid rgba(213, 174, 105, 0.13);
  background: #1d1715;
}

.features div {
  display: grid;
  grid-template-columns: 40px 1fr;
  align-items: center;
  column-gap: 12px;
  max-width: 270px;
  margin: auto;
}

.features div > span {
  grid-row: span 2;
  display: grid;
  place-items: center;
  width: 39px;
  height: 39px;
  color: var(--accent);
  border: 1px solid rgba(213, 174, 105, 0.5);
  border-radius: 50%;
  font-size: 21px;
}

.features strong {
  font-size: 13px;
}

.features small {
  color: #a99b8e;
  font-size: 11px;
}

.section {
  padding: 75px 6%;
}

.section-heading {
  margin-bottom: 32px;
  text-align: center;
}

.section-heading h2,
.about-copy h2 {
  margin: 8px 0 9px;
  font-size: clamp(27px, 4vw, 39px);
  font-weight: 900;
}

.section-heading h2 em {
  color: var(--accent);
  font-style: normal;
}

.section-heading p {
  margin: 0;
  color: #b5a89c;
  font-size: 13px;
}

.menu-tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
  margin: 0 auto 28px;
  max-width: 1120px;
}

.menu-tools > input {
  width: min(280px, 100%);
}

input,
textarea,
select {
  width: 100%;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid #51433b;
  border-radius: 7px;
  outline: none;
  color: var(--text);
  background: #191513;
  font-size: 13px;
}

input:focus,
textarea:focus,
select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(213, 174, 105, 0.1);
}

input[type="checkbox"] {
  width: 17px;
  min-height: auto;
  accent-color: var(--accent);
}

input[type="color"] {
  height: 40px;
  padding: 4px;
}

textarea {
  resize: vertical;
}

.categories {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}

.categories button {
  padding: 8px 13px;
  border: 1px solid #51433b;
  border-radius: 7px;
  color: #ddd1c5;
  background: transparent;
  font-size: 11px;
}

.categories button.selected {
  color: #171313;
  border-color: var(--accent);
  background: var(--accent);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: auto;
}

.product-card {
  overflow: hidden;
  border: 1px solid rgba(213, 174, 105, 0.17);
  border-radius: 12px;
  background: var(--card);
  transition: transform 0.2s, border-color 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  border-color: rgba(213, 174, 105, 0.55);
}

.product-image {
  position: relative;
  height: 195px;
  overflow: hidden;
  background: #30231e;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 5px 9px;
  border-radius: 5px;
  color: #171313;
  background: var(--accent);
  font-size: 10px;
  font-weight: 800;
}

.product-info {
  padding: 17px;
}

.product-category {
  color: var(--accent);
  font-size: 10px;
}

.product-info h3 {
  margin: 5px 0;
  font-size: 17px;
}

.product-info p {
  min-height: 45px;
  margin: 0 0 15px;
  color: #b6a99d;
  font-size: 11px;
  line-height: 1.9;
}

.product-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.product-bottom strong {
  color: var(--accent);
  font-size: 15px;
}

.product-bottom button {
  padding: 8px 10px;
  border: 1px solid var(--accent);
  border-radius: 6px;
  color: var(--accent);
  background: transparent;
  font-size: 11px;
}

.product-bottom button:hover {
  color: #171313;
  background: var(--accent);
}

.product-bottom button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.about-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 7%;
  padding: 70px 9%;
  background: #211a17;
}

.about-art {
  display: grid;
  place-items: center;
  min-height: 330px;
  padding: 25px;
  border: 1px solid rgba(213, 174, 105, 0.3);
  background:
    radial-gradient(circle at 25% 25%, rgba(213, 174, 105, 0.18), transparent 35%),
    linear-gradient(145deg, #3b2820, #15110f);
}

.about-art-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 13px;
  width: 100%;
  padding: 35px 15px;
  border: 1px solid var(--accent);
  text-align: center;
}

.about-art-inner span {
  color: var(--accent);
  font-family: Georgia, serif;
  font-size: 48px;
  letter-spacing: 7px;
}

.about-art-inner strong {
  font-size: 24px;
}

.about-art-inner small {
  color: #d6b986;
}

.about-copy p {
  color: #bfb0a3;
  font-size: 13px;
  line-height: 2.2;
}

.contact-section {
  background: var(--bg);
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 17px;
  max-width: 1050px;
  margin: auto;
}

.contact-card {
  padding: 25px 15px;
  border: 1px solid rgba(213, 174, 105, 0.2);
  border-radius: 10px;
  background: var(--card);
  text-align: center;
}

.contact-card > span {
  display: block;
  margin-bottom: 9px;
  color: var(--accent);
  font-size: 26px;
}

.contact-card strong {
  font-size: 14px;
}

.contact-card p {
  margin: 8px 0 0;
  color: #bfb0a3;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.footer {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 22px;
  padding: 38px 7%;
  border-top: 1px solid rgba(213, 174, 105, 0.22);
  background: #100d0c;
}

.footer-brand {
  color: var(--accent);
  font-size: 23px;
  font-weight: 900;
}

.footer p {
  max-width: 450px;
  color: #9e9084;
  font-size: 12px;
  line-height: 2;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 13px;
  font-size: 12px;
}

.footer > small {
  color: #7f7369;
  font-size: 11px;
}

.admin-footer-link {
  justify-self: end;
  border: 0;
  color: #8e8176;
  background: transparent;
  font-size: 11px;
}

.overlay {
  position: fixed;
  z-index: 20;
  inset: 0;
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  padding: 0;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(4px);
}

.drawer {
  width: min(480px, 100%);
  height: 100%;
  overflow-y: auto;
  padding: 25px;
  border-left: 1px solid #594534;
  background: var(--bg);
}

.drawer-heading,
.admin-header,
.admin-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 13px;
}

.drawer-heading h2,
.admin-header h2 {
  margin: 0;
  font-size: 22px;
}

.close-button {
  display: grid;
  place-items: center;
  width: 37px;
  height: 37px;
  border: 1px solid #54443a;
  border-radius: 7px;
  color: var(--text);
  background: transparent;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding: 18px 0;
  border-bottom: 1px solid #3c3029;
}

.cart-item strong,
.cart-item small {
  display: block;
}

.cart-item small {
  margin-top: 5px;
  color: #ad9c8e;
  font-size: 11px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-control button {
  width: 28px;
  height: 28px;
  border: 1px solid #62503e;
  border-radius: 5px;
  color: var(--accent);
  background: transparent;
}

.cart-summary {
  margin: 22px 0;
  padding: 15px;
  border-radius: 8px;
  background: var(--card);
}

.cart-summary > div,
.invoice > div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin: 10px 0;
  font-size: 13px;
}

.cart-summary > div strong,
.invoice > div strong {
  color: var(--accent);
}

.total-row {
  padding-top: 12px;
  border-top: 1px solid #67513c;
  font-weight: 900;
}

.full-button {
  width: 100%;
  margin-top: 12px;
}

.modal {
  width: min(650px, 96%);
  max-height: 92vh;
  overflow-y: auto;
  margin: auto;
  padding: 25px;
  border: 1px solid #6a5137;
  border-radius: 12px;
  background: var(--bg);
}

.checkout-modal {
  width: min(720px, 96%);
}

.checkout-modal form > label {
  display: block;
  margin-top: 14px;
}

.checkout-modal label,
.admin-form label,
.admin-inline label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: #d9cbbd;
  font-size: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.payment-details {
  margin-top: 18px;
  padding: 14px;
  border: 1px solid #58432f;
  border-radius: 8px;
  background: var(--card);
}

.payment-details p {
  color: #c8b8a7;
  font-size: 12px;
  line-height: 1.9;
  overflow-wrap: anywhere;
}

.upload-label {
  margin-top: 15px;
}

.hint {
  color: #ad9d8f;
  font-size: 11px;
  line-height: 1.9;
}

.error-message,
.database-error {
  color: #ffb4b4 !important;
}

.invoice {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #554231;
  border-radius: 8px;
  background: var(--card);
}

.invoice h3 {
  margin: 0 0 12px;
}

.invoice > div {
  font-size: 12px;
}

.confirmation {
  max-width: 420px;
  text-align: center;
}

.confirmation-icon {
  display: grid;
  place-items: center;
  width: 55px;
  height: 55px;
  margin: 0 auto 15px;
  border: 1px solid var(--accent);
  border-radius: 50%;
  color: var(--accent);
  font-size: 30px;
}

.confirmation p {
  color: #c9b8a8;
  font-size: 13px;
}

.admin-overlay {
  z-index: 30;
  justify-content: center;
  padding: 18px;
  overflow-y: auto;
}

.admin-panel {
  width: min(1050px, 100%);
  max-height: 100%;
  overflow-y: auto;
  margin: auto;
  padding: 25px;
  border: 1px solid #594534;
  border-radius: 12px;
  background: var(--bg);
}

.admin-header {
  padding-bottom: 20px;
  border-bottom: 1px solid #40332a;
}

.admin-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 15px 0;
}

.admin-tabs button {
  flex-shrink: 0;
  padding: 9px 13px;
  border: 1px solid #4b3d32;
  border-radius: 6px;
  color: #cbbcaf;
  background: transparent;
  font-size: 12px;
}

.admin-tabs button.active {
  color: #1b1511;
  border-color: var(--accent);
  background: var(--accent);
  font-weight: 800;
}

.admin-content {
  padding: 8px 0 20px;
}

.admin-content h3 {
  margin: 12px 0 17px;
  font-size: 18px;
}

.login-box {
  max-width: 390px;
  margin: 35px auto;
}

.login-box h3 {
  font-size: 22px;
}

.login-box p {
  color: #b4a598;
  font-size: 12px;
}

.login-box form {
  display: grid;
  gap: 13px;
}

.login-box label {
  display: grid;
  gap: 7px;
  color: #d9cbbd;
  font-size: 12px;
}

.admin-form {
  display: grid;
  gap: 14px;
  margin: 15px 0 22px;
  padding: 17px;
  border: 1px solid #49392e;
  border-radius: 9px;
  background: #201916;
}

.admin-form h4 {
  margin: 0;
  color: var(--accent);
}

.admin-inline {
  display: flex;
  align-items: end;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.secondary-button,
.danger-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 7px 11px;
  border: 1px solid #5c4937;
  border-radius: 6px;
  color: #e4d6c7;
  background: transparent;
  font-size: 11px;
}

.secondary-button:hover {
  border-color: var(--accent);
}

.danger-button {
  border-color: #794141;
  color: #f1a5a5;
}

.danger-button:hover {
  background: rgba(130, 43, 43, 0.15);
}

.small-button {
  min-height: 35px;
  padding: 7px 12px;
  font-size: 11px;
}

.admin-list-item,
.slide-admin-item {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #403229;
  border-radius: 8px;
  background: #201916;
}

.admin-list-item img,
.slide-admin-item img {
  width: 62px;
  height: 55px;
  flex-shrink: 0;
  border-radius: 6px;
  object-fit: cover;
  background: #3a2b23;
}

.admin-list-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.admin-list-main strong {
  font-size: 12px;
  overflow-wrap: anywhere;
}

.admin-list-main small {
  color: #ad9d8e;
  font-size: 10px;
  overflow-wrap: anywhere;
}

.admin-card {
  margin: 12px 0;
  padding: 17px;
  border: 1px solid #4a382c;
  border-radius: 9px;
  background: #201916;
}

.admin-card p {
  margin: 9px 0;
  color: #c5b4a5;
  font-size: 12px;
  line-height: 1.9;
  overflow-wrap: anywhere;
}

.status-pill {
  display: inline-block;
  padding: 4px 9px;
  border: 1px solid #6a5539;
  border-radius: 20px;
  color: var(--accent);
  font-size: 10px;
}

.status-pill.connected {
  border-color: #326c4a;
  color: #9be1b3;
}

.status-pill.paid {
  border-color: #23864d;
  color: #b8f5c9;
  background: rgba(35, 134, 77, 0.12);
}

.proof-link {
  display: inline-block;
  margin-inline-start: 10px;
  color: var(--accent);
  font-size: 11px;
}

.status-pill.disconnected {
  border-color: #685344;
  color: #d7b9a0;
}

.order-line {
  padding: 6px 0;
  color: #bca995;
  font-size: 11px;
}

.checkbox-row {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.checkbox-row label,
.checkbox-label {
  display: flex;
  flex-direction: row !important;
  align-items: center;
  gap: 8px;
}

.interval-control {
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: 390px;
  margin: 15px 0;
  color: #d9cbbd;
  font-size: 12px;
}

.interval-control input {
  max-width: 100px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.color-grid label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-size: 11px;
}

.social-edit-row {
  display: grid;
  grid-template-columns: 0.7fr 1.7fr auto;
  gap: 8px;
  margin: 8px 0;
}

.data-card {
  padding: 25px;
  border: 1px solid var(--accent);
  border-radius: 10px;
  background: var(--card);
  text-align: center;
}

.data-card .brand-mark {
  margin: auto;
}

.data-card p {
  color: #c5b5a6;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.qr-heading {
  margin-top: 30px !important;
}

.qr-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border: 1px solid #49392e;
  border-radius: 9px;
}

.qr-box img {
  width: 220px;
  max-width: 100%;
  padding: 8px;
  border-radius: 5px;
  background: white;
}

.qr-box p {
  max-width: 100%;
  overflow-wrap: anywhere;
  color: #bfb0a3;
  font-size: 11px;
  text-align: center;
}

.link-button {
  text-decoration: none;
}

.integration-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin: 10px 0;
  padding: 15px;
  border: 1px solid #44352b;
  border-radius: 8px;
  background: #201916;
}

.integration-card strong {
  font-size: 13px;
}

.integration-card p {
  margin: 5px 0 0;
  color: #a99b8e;
  font-size: 11px;
}

.integration-card a {
  color: var(--accent);
  font-size: 11px;
}

.notice {
  margin-top: 17px;
  padding: 14px;
  border-right: 3px solid var(--accent);
  color: #c8b7a6;
  background: #2a211a;
  font-size: 12px;
  line-height: 2;
}

.admin-bottom {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  flex-wrap: wrap;
  padding-top: 18px;
  border-top: 1px solid #40332a;
}

.empty-state {
  padding: 28px 12px;
  color: #ad9d8f;
  text-align: center;
  font-size: 13px;
  line-height: 1.9;
}

.toast {
  position: fixed;
  z-index: 100;
  right: 50%;
  bottom: 25px;
  width: max-content;
  max-width: calc(100% - 30px);
  padding: 13px 20px;
  border: 1px solid var(--accent);
  border-radius: 8px;
  color: var(--text);
  background: #2a211b;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  font-size: 12px;
  transform: translateX(50%);
}

@media (max-width: 950px) {
  .topbar {
    flex-wrap: wrap;
  }

  .nav-links {
    order: 3;
    width: 100%;
    justify-content: center;
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .product-image {
    height: 220px;
  }
}

@media (max-width: 650px) {
  .topbar {
    padding: 12px 4%;
    gap: 12px;
  }

  .brand strong {
    font-size: 17px;
  }

  .nav-links {
    gap: 14px;
    overflow-x: auto;
    justify-content: flex-start;
  }

  .nav-links a {
    flex-shrink: 0;
    font-size: 11px;
  }

  .top-actions {
    gap: 5px;
  }

  .cart-button,
  .whatsapp-top,
  .icon-button {
    padding: 8px;
    font-size: 10px;
  }

  .hero {
    min-height: 430px;
  }

  .hero p {
    font-size: 13px;
  }

  .features {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .features div {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  .section {
    padding: 48px 5%;
  }

  .menu-tools {
    align-items: stretch;
  }

  .menu-tools > input {
    width: 100%;
  }

  .categories {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 5px;
  }

  .categories button {
    flex-shrink: 0;
  }

  .product-grid {
    gap: 11px;
  }

  .product-image {
    height: 140px;
  }

  .product-info {
    padding: 11px;
  }

  .product-info h3 {
    font-size: 14px;
  }

  .product-info p {
    font-size: 10px;
  }

  .product-bottom {
    align-items: flex-start;
    flex-direction: column;
  }

  .product-bottom button {
    width: 100%;
  }

  .about-section {
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 45px 6%;
  }

  .about-art {
    min-height: 240px;
  }

  .contact-grid {
    grid-template-columns: 1fr;
  }

  .footer {
    grid-template-columns: 1fr;
    padding: 30px 6%;
  }

  .admin-footer-link {
    justify-self: start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal {
    padding: 18px;
  }

  .admin-overlay {
    padding: 6px;
  }

  .admin-panel {
    padding: 14px;
  }

  .admin-list-item,
  .slide-admin-item {
    flex-wrap: wrap;
  }

  .admin-list-main {
    min-width: 100px;
  }

  .color-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .social-edit-row {
    grid-template-columns: 1fr;
  }

  .integration-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .interval-control {
    align-items: flex-start;
    flex-direction: column;
  }
}
.preparation-timer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 10px 0 14px;
  padding: 10px 12px;
  border: 1px solid rgba(213, 174, 105, 0.45);
  border-radius: 10px;
  background: rgba(213, 174, 105, 0.08);
  color: var(--text, #f7f0e8);
  font-variant-numeric: tabular-nums;
}
.preparation-timer span {
  direction: ltr;
  font-weight: 800;
  letter-spacing: 0.04em;
}
.preparation-timer.overdue {
  border-color: #e05252;
  background: rgba(224, 82, 82, 0.12);
  color: #ff7777;
}
.preparation-timer b {
  font-weight: 800;
}
.order-age-timer {
  border-color: rgba(116, 174, 216, 0.55);
  background: rgba(116, 174, 216, 0.08);
}
.whatsapp-message-log {
  margin: 12px 0;
  padding: 10px 12px;
  border: 1px solid rgba(213, 174, 105, 0.25);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.12);
}
.whatsapp-message-log > strong {
  display: block;
  margin-bottom: 8px;
}
.whatsapp-message-list {
  display: grid;
  gap: 7px;
}
.whatsapp-message-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.whatsapp-message-row small {
  flex-basis: 100%;
}
.whatsapp-status-delivered,
.whatsapp-status-read {
  border-color: rgba(63, 174, 115, 0.7);
  color: #76d9a4;
}
.whatsapp-status-failed {
  border-color: rgba(224, 82, 82, 0.8);
  color: #ff7777;
}
.whatsapp-status-accepted,
.whatsapp-status-sent {
  border-color: rgba(116, 174, 216, 0.6);
  color: #9bcff5;
}

</style>
