
<template>
<div class="sumer" :dir="language === 'ar' ? 'rtl' : 'ltr'" :lang="language" :style="themeStyle">
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
      <a href="#home">{{ t("الرئيسية") }}</a>
      <a href="#menu">{{ t("المنيو") }}</a>
      <a href="#about">{{ t("عن المطعم") }}</a>
      <a href="#contact">{{ t("تواصل معنا") }}</a>
    </nav>

    <div class="top-actions">
      <button class="language-toggle" type="button" @click="toggleLanguage" :aria-label="language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'">{{ language === 'ar' ? 'English' : 'العربية' }}</button>
      <a v-if="settings.whatsapp" class="whatsapp-top" :href="whatsappUrl" target="_blank" rel="noopener">{{ t("واتساب") }}</a>
      <button class="cart-button" @click="cartOpen = true">{{ t("🛒 السلة") }} <span>{{ cartCount }}</span></button>
      <a class="orders-dashboard-top-link" :href="ordersDashboardUrl">{{ t("لوحة الأوردرات") }}</a>
      <button class="icon-button" :title="t("إدارة الموقع والإعدادات")" @click="openAdmin">⚙</button>
    </div>
  </header>

  <main>
    <!-- الواجهة الرئيسية -->
    <section id="home" class="hero" :style="heroStyle">
      <div class="hero-shade"></div>

      <button v-if="slides.length > 1" class="slide-arrow prev" :aria-label="t("الصورة السابقة")" @click="changeSlide(-1)">❯</button>

      <div class="hero-content">
        <span class="eyebrow">{{ t("أصالة الشام في كل لقمة") }}</span>
        <h1>{{ t(currentSlide.caption || settings.name || 'سومر') }}</h1>
        <p>{{ t(settings.tagline) }}</p>
        <a href="#menu" class="primary-button">{{ t("اكتشف المنيو") }}</a>
      </div>

      <button v-if="slides.length > 1" class="slide-arrow next" :aria-label="t("الصورة التالية")" @click="changeSlide(1)">❮</button>

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
      <div><span>✦</span><strong>{{ t("نكهة شامية أصيلة") }}</strong><small>{{ t("طعم يفتكرك بالبيت") }}</small></div>
      <div><span>♨</span><strong>{{ t("تحضير باهتمام") }}</strong><small>{{ t("نهتم بكل تفصيلة") }}</small></div>
      <div><span>⌂</span><strong>{{ t("توصيل للمنزل") }}</strong><small>{{ t("اختار منطقتك عند الطلب") }}</small></div>
    </section>

    <!-- المنيو -->
    <section id="menu" class="section menu-section">
      <div class="section-heading">
        <span class="eyebrow">{{ t("اكتشف مذاق الشام") }}</span>
        <h2>{{ t("منيو") }} <em>{{ settings.name || 'سومر' }}</em></h2>
        <p>{{ t("اختار أطباقك المفضلة واطلبها بسهولة.") }}</p>
      </div>

      <div class="menu-tools">
        <input v-model.trim="search" :placeholder="t("ابحث عن أكلة...")" />
        <div class="categories">
          <button
            v-for="category in categories"
            :key="category"
            :class="{ selected: activeCategory === category }"
            @click="activeCategory = category"
          >{{ t(category) }}</button>
        </div>
      </div>

      <div v-if="dbLoading" class="empty-state">{{ t("جاري تحميل بيانات المنيو من قاعدة البيانات...") }}</div>
      <div v-else-if="dbError" class="empty-state database-error">{{ t(dbError) }}</div>

      <div v-else-if="filteredProducts.length" class="product-grid">
        <article v-for="product in filteredProducts" :key="product.id" class="product-card">
          <div class="product-image">
            <img :src="product.image || fallbackImage" :alt="product.name" @error="onImageError" />
            <span v-if="product.featured" class="featured-tag">{{ t("اختيار مميز") }}</span>
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

      <div v-else class="empty-state">{{ t("مفيش أصناف متاحة حاليًا. أضف المنتجات من لوحة الإدارة بعد الاتصال بقاعدة البيانات.") }}</div>
    </section>

    <!-- عن المطعم -->
    <section id="about" class="about-section">
      <div class="about-art">
        <div class="about-art-inner">
          <span>SUMER</span>
          <strong>{{ t("من قلب الشام") }}</strong>
          <small>{{ t("طعم يجمعنا") }}</small>
        </div>
      </div>
      <div class="about-copy">
        <span class="eyebrow">{{ t("حكاية وطعم") }}</span>
        <h2>{{ t("أهلاً بيك في") }} {{ settings.name || 'سومر' }}</h2>
        <p>{{ t(settings.tagline) }}</p>
        <p>{{ t("نسعى لتقديم تجربة طعام مميزة، تجمع بين جودة المكونات وروح المطبخ الشامي.") }}</p>
        <a href="#menu" class="primary-button">{{ t("شوف المنيو") }}</a>
      </div>
    </section>

    <!-- بيانات التواصل -->
    <section id="contact" class="section contact-section">
      <div class="section-heading">
        <span class="eyebrow">{{ t("إحنا هنا لخدمتك") }}</span>
        <h2>{{ t("تواصل معانا") }}</h2>
      </div>

      <div class="contact-grid">
        <div class="contact-card">
          <span>⌖</span><strong>{{ t("العنوان") }}</strong>
          <p>{{ settings.address || 'أضف عنوان المطعم من لوحة الإدارة' }}</p>
        </div>
        <div class="contact-card">
          <span>☎</span><strong>{{ t("رقم الهاتف") }}</strong>
          <p>{{ settings.phone || 'أضف رقم الهاتف من لوحة الإدارة' }}</p>
        </div>
        <div class="contact-card">
          <span>◷</span><strong>{{ t("مواعيد العمل") }}</strong>
          <p>{{ settings.hours || 'أضف مواعيد العمل من لوحة الإدارة' }}</p>
        </div>
      </div>
    </section>
  </main>

  <!-- الفوتر -->
  <footer class="footer">
    <div>
      <a href="#home" class="footer-brand">{{ settings.name || 'سومر' }}</a>
      <p>{{ t(settings.tagline) }}</p>
    </div>

    <div class="footer-links">
      <a v-if="menuQrTarget" class="footer-menu-link" :href="menuQrTarget" target="_blank" rel="noopener">{{ t("افتح المنيو") }}</a>
      <a v-for="link in visibleSocialLinks" :key="link.id" :href="link.url" target="_blank" rel="noopener">{{ link.label }}</a>
      <a v-if="settings.whatsapp" :href="whatsappUrl" target="_blank" rel="noopener">{{ t("واتساب") }}</a>
    </div>

    <small>© {{ new Date().getFullYear() }} {{ settings.name || 'سومر' }} {{ t("— نسخة تجريبية") }}</small>
    <button class="admin-footer-link" @click="openAdmin">{{ t("إدارة الموقع ⚙") }}</button>
  </footer>

  <!-- السلة -->
  <div v-if="cartOpen" class="overlay" @click.self="cartOpen = false">
    <section class="drawer">
      <div class="drawer-heading">
        <h2>{{ t("سلة الطلبات") }}</h2>
        <button class="close-button" @click="cartOpen = false">✕</button>
      </div>

      <div v-if="!cart.length" class="empty-state">{{ t("السلة لسه فاضية.") }}</div>

      <div v-for="item in cart" :key="item.id" class="cart-item">
        <div>
          <strong>{{ item.name }}</strong>
          <small>{{ money(item.price) }} {{ t("للواحد") }}</small>
        </div>
        <div class="quantity-control">
          <button @click="changeQuantity(item.id, 1)">+</button>
          <strong>{{ item.quantity }}</strong>
          <button @click="changeQuantity(item.id, -1)">−</button>
        </div>
      </div>

      <div v-if="cart.length" class="cart-summary">
        <div><span>{{ t("قيمة المنتجات") }}</span><strong>{{ money(cartSubtotal) }}</strong></div>
        <div><span>{{ t("التوصيل") }}</span><strong>{{ money(selectedDeliveryFee) }}</strong></div>
        <div class="total-row"><span>{{ t("الإجمالي") }}</span><strong>{{ money(cartTotal) }}</strong></div>
      </div>

      <button v-if="cart.length" class="primary-button full-button" @click="openCheckout">{{ t("استكمال بيانات الطلب") }}</button>
    </section>
  </div>

  <!-- إتمام الطلب -->
  <div v-if="checkoutOpen" class="overlay" @click.self="checkoutOpen = false">
    <section class="modal checkout-modal">
      <div class="drawer-heading">
        <h2>{{ t("بيانات التوصيل والطلب") }}</h2>
        <button class="close-button" @click="checkoutOpen = false">✕</button>
      </div>

      <form @submit.prevent="submitOrder">
        <div v-if="checkoutStep === 1" class="checkout-step">
          <div class="checkout-step-heading">
            <span class="eyebrow">{{ t("الخطوة 1 من 2") }}</span>
            <strong>{{ t("بيانات العميل والتوصيل") }}</strong>
          </div>

          <div class="form-grid">
            <label>{{ t("الاسم بالكامل *") }}
              <input v-model.trim="checkout.name" required maxlength="100" :placeholder="t("اسم العميل")" />
            </label>
            <label>{{ t("رقم الهاتف الأساسي *") }}
              <input v-model.trim="checkout.phone" required type="tel" maxlength="25" placeholder="01xxxxxxxxx" />
            </label>
            <label>{{ t("رقم هاتف بديل") }}
              <input v-model.trim="checkout.phone2" type="tel" maxlength="25" :placeholder="t("اختياري")" />
            </label>
            <label>{{ t("المنطقة *") }}
              <select v-model="checkout.areaId" required>
                <option disabled value="">{{ t("اختار المنطقة") }}</option>
                <option v-for="area in activeAreas" :key="area.id" :value="area.id">
                  {{ area.name }}
                </option>
              </select>
            </label>
            <label>{{ t("اسم الشارع *") }}
              <input v-model.trim="checkout.street" required maxlength="150" :placeholder="t("اسم الشارع")" />
            </label>
            <label>{{ t("رقم المبنى / العمارة") }}
              <input v-model.trim="checkout.building" maxlength="80" :placeholder="t("رقم المبنى أو العمارة")" />
            </label>
            <label>{{ t("الدور") }}
              <input v-model.trim="checkout.floor" maxlength="20" :placeholder="t("رقم الدور")" />
            </label>
            <label>{{ t("رقم الشقة") }}
              <input v-model.trim="checkout.apartment" maxlength="20" :placeholder="t("رقم الشقة")" />
            </label>
          </div>

          <div v-if="selectedArea" class="delivery-summary-grid">
            <div class="delivery-summary-tile">
              <span>{{ t("المنطقة") }}</span>
              <strong>{{ selectedArea.name }}</strong>
            </div>
            <div class="delivery-summary-tile">
              <span>{{ t("الوقت المتوقع للتوصيل") }}</span>
              <strong>{{ formatDeliveryMinutes(selectedDeliveryMinutes) }}</strong>
            </div>
            <div class="delivery-summary-tile">
              <span>{{ t("رسوم التوصيل") }}</span>
              <strong>{{ money(selectedDeliveryFee) }}</strong>
            </div>
          </div>
          <p v-else class="hint">{{ t("اختار المنطقة علشان يظهر سعر التوصيل والوقت المتوقع قبل تأكيد الطلب.") }}</p>

          <p v-if="orderError" class="hint error-message">{{ t(orderError) }}</p>
          <button class="primary-button full-button" type="button" @click="continueToPayment">
            {{ t("متابعة لمراجعة الإجمالي والدفع") }}
          </button>
        </div>

        <div v-else class="checkout-step">
          <div class="checkout-step-heading">
            <span class="eyebrow">{{ t("الخطوة 2 من 2") }}</span>
            <strong>{{ t("مراجعة الفاتورة وطريقة الدفع") }}</strong>
            <button class="secondary-button small-button" type="button" @click="returnToCustomerDetails">{{ t("تعديل بيانات التوصيل") }}</button>
          </div>

          <div class="invoice">
            <h3>{{ t("ملخص الفاتورة") }}</h3>
            <div v-for="item in cart" :key="item.id">
              <span>{{ item.name }} × {{ item.quantity }} <small>({{ money(item.price) }} {{ t("للواحد)") }}</small></span>
              <strong>{{ money(item.price * item.quantity) }}</strong>
            </div>
            <div><span>{{ t("قيمة الأصناف") }}</span><strong>{{ money(cartSubtotal) }}</strong></div>
            <div><span>{{ t("منطقة التوصيل") }}</span><strong>{{ selectedArea ? selectedArea.name : '—' }}</strong></div>
            <div><span>{{ t("وقت التوصيل المتوقع") }}</span><strong>{{ formatDeliveryMinutes(selectedDeliveryMinutes) }}</strong></div>
            <div><span>{{ t("رسوم التوصيل") }}</span><strong>{{ money(selectedDeliveryFee) }}</strong></div>
            <div class="total-row"><span>{{ t("الإجمالي النهائي") }}</span><strong>{{ money(cartTotal) }}</strong></div>
          </div>

          <section class="payment-method-section">
            <h3>{{ t("اختار طريقة الدفع") }}</h3>
            <div class="payment-method-options">
              <label v-if="settings.cashOnDeliveryEnabled !== false" class="payment-method-option" :class="{ selected: checkout.paymentMethod === 'cash' }">
                <input v-model="checkout.paymentMethod" type="radio" name="paymentMethod" value="cash" required />
                <span class="payment-method-icon">💵</span>
                <span><strong>{{ t("كاش") }}</strong><small>{{ t("الدفع عند الاستلام") }}</small></span>
              </label>
              <label class="payment-method-option" :class="{ selected: checkout.paymentMethod === 'vodafone' }">
                <input v-model="checkout.paymentMethod" type="radio" name="paymentMethod" value="vodafone" required />
                <span class="payment-method-icon">📱</span>
                <span><strong>{{ t("فودافون كاش") }}</strong><small>{{ t("تحويل للمحفظة") }}</small></span>
              </label>
              <label class="payment-method-option" :class="{ selected: checkout.paymentMethod === 'instapay' }">
                <input v-model="checkout.paymentMethod" type="radio" name="paymentMethod" value="instapay" required />
                <span class="payment-method-icon">🏦</span>
                <span><strong>{{ t("إنستاباي") }}</strong><small>{{ t("تحويل إلكتروني") }}</small></span>
              </label>
            </div>
          </section>

          <div v-if="checkout.paymentMethod !== 'cash'" class="payment-details">
            <strong>{{ t("بيانات الدفع") }}</strong>
            <p v-if="checkout.paymentMethod === 'vodafone'">
              {{ t("حوّل المبلغ على محفظة فودافون كاش:") }} <strong>{{ settings.vodafoneWallet || 'لم يضف المطعم رقم المحفظة بعد' }}</strong>
            </p>
            <p v-else>
              {{ t("بيانات التحويل عبر إنستاباي:") }} <strong>{{ settings.instapayAddress || 'لم يضف المطعم بيانات إنستاباي بعد' }}</strong>
            </p>
            <p class="hint">{{ t("راجع الإجمالي النهائي أعلاه وحوّل نفس المبلغ. بعد التحويل، ارفع صورة الإيصال.") }}</p>
            <label class="upload-label">
              {{ t("صورة إيصال التحويل * (مطلوبة)") }}
              <input id="payment-proof-upload" class="payment-proof-input" type="file" accept="image/*" required @change="handleProofUpload" />
              <small class="hint">{{ t("اختار صورة الإيصال من معرض الصور. بعد تأكيد الطلب هتتربط برقم الأوردر وتتبعت للمطعم على واتساب.") }}</small>
            </label>
            <p v-if="proofFileName" class="hint">{{ t("تم اختيار الصورة:") }} {{ proofFileName }}</p>
            <img v-if="paymentProofPreviewUrl" class="payment-proof-selection-preview" :src="paymentProofPreviewUrl" :alt="t("معاينة إيصال التحويل المختار")" />
            <label class="upload-label">{{ t("رقم مرجع التحويل / رقم العملية (لو ظاهر في الإيصال)") }}
              <input v-model.trim="checkout.paymentReference" maxlength="120" :placeholder="t("اكتب رقم مرجع التحويل الظاهر في الإيصال")" />
            </label>
            <p class="hint">{{ t("حالة الدفع هتفضل «مراجعة مطلوبة» لحد ما الإدارة تراجع الإيصال وتؤكد استلام المبلغ.") }}</p>
          </div>

          <label>{{ t("ملاحظات إضافية") }}
            <textarea v-model.trim="checkout.notes" rows="2" maxlength="500" :placeholder="t("أي تفاصيل تساعد في توصيل الطلب")"></textarea>
          </label>

          <p v-if="orderError" class="hint error-message">{{ t(orderError) }}</p>
          <p class="hint">{{ t("قبل تأكيد الطلب، راجع الأصناف والمنطقة ووقت التوصيل والإجمالي وطريقة الدفع.") }}</p>
          <button class="primary-button full-button" type="submit" :disabled="sending">
            {{ sending ? 'جاري إرسال الطلب...' : 'تأكيد الطلب وإرسال الأوردر' }}
          </button>
        </div>
      </form>
    </section>
  </div>

  <!-- تأكيد الطلب -->
  <div v-if="confirmedOrder" class="overlay" @click.self="confirmedOrder = null">
    <section class="modal confirmation">
      <span class="confirmation-icon">✓</span>
      <h2>{{ t("تم إرسال الطلب") }}</h2>
      <p>{{ t("رقم الطلب:") }} <strong>{{ confirmedOrder.id }}</strong></p>
      <p>{{ t("الإجمالي:") }} <strong>{{ money(confirmedOrder.total) }}</strong></p>
      <p>{{ t("الحالة:") }} {{ confirmedOrder.status }}</p>
      <p v-if="confirmedOrder.whatsappNotification === 'not_configured'" class="hint error-message">
        {{ t("تم حفظ الطلب، لكن إشعار واتساب لم يُرسل لأن إعدادات الاتصال غير مكتملة.") }}
      </p>
      <p v-else-if="confirmedOrder.whatsappNotification && confirmedOrder.whatsappNotification.includes('failed')" class="hint error-message">
        {{ t("تم حفظ الطلب، لكن تعذّر إرسال جزء من إشعار واتساب أو صورة الإيصال. راجع سجل الوظيفة قبل إعادة المحاولة.") }}
      </p>
      <p v-else-if="confirmedOrder.whatsappNotification && confirmedOrder.whatsappNotification.startsWith('summary_sent')" class="hint">
        {{ t("تم قبول ملخص الطلب للإرسال عبر واتساب. حالة الصور:") }} {{ confirmedOrder.whatsappNotification.includes('images_sent') ? 'تم قبول إرسال الصور' : 'لم يتم تأكيد إرسال صور الأصناف' }}.
      </p>
      <button class="primary-button full-button" @click="openTrackingFromConfirmation">{{ t("متابعة الأوردر") }}</button>
      <button class="secondary-button full-button" @click="confirmedOrder = null">{{ t("تمام") }}</button>
    </section>
  </div>

  <!-- لوحة الإدارة -->
  <div v-if="adminOpen" class="overlay admin-overlay" @click.self="closeAdmin">
    <section class="admin-panel">
      <div class="admin-header">
        <div>
          <span class="eyebrow">SUMER CONTROL CENTER</span>
          <h2>{{ t("لوحة إدارة المطعم") }}</h2>
        </div>
        <button class="close-button" @click="closeAdmin">✕</button>
      </div>

      <div v-if="!adminLoggedIn" class="login-box">
        <h3>{{ t("تسجيل دخول الإدارة") }}</h3>
        <p>{{ t("استخدم حساب الإدارة الذي أنشأته في Supabase Auth.") }}</p>
        <form @submit.prevent="login">
          <label>{{ t("البريد الإلكتروني") }}
            <input v-model.trim="adminEmail" type="email" autocomplete="off" name="sumer-admin-email" placeholder="admin@example.com" required />
          </label>
          <label>{{ t("كلمة المرور") }}
            <input v-model="adminPassword" type="password" autocomplete="new-password" name="sumer-admin-password" :placeholder="t("كلمة المرور")" required />
          </label>
          <p v-if="loginError" class="error-message">{{ t(loginError) }}</p>
          <button class="primary-button full-button" type="submit" :disabled="adminBusy">
            {{ adminBusy ? 'جاري التحقق...' : 'تسجيل الدخول' }}
          </button>
        </form>
        <p class="hint">{{ t("يلزم إضافة معرّف حساب المدير إلى جدول admin_users. لا توجد كلمة مرور ثابتة داخل هذا الملف.") }}</p>
      </div>

      <template v-else>
        <nav class="admin-tabs">
          <button
            v-for="tab in adminTabs"
            :key="tab.id"
            :class="{ active: adminTab === tab.id }"
            @click="selectAdminTab(tab.id)"
          >{{ t(tab.label) }}</button>
        </nav>

        <p v-if="adminError" class="hint error-message">{{ t(adminError) }}</p>

        <!-- إيصالات الدفع وتحويلات العملاء — لمدير الموقع فقط -->
        <div v-if="adminTab === 'payments'" class="admin-content">
          <div class="admin-title-row">
            <h3>{{ t("إيصالات الدفع ومراجعة التحويلات") }}</h3>
            <button class="secondary-button" type="button" @click="loadOrders" :disabled="ordersLoading">
              {{ ordersLoading ? 'جاري التحديث...' : 'تحديث الإيصالات' }}
            </button>
          </div>
          <p class="hint">{{ t("هذه الشاشة خاصة بمدير الموقع لمراجعة صور التحويل وتأكيد الدفع. الموظفون في لوحة الأوردرات لا تظهر لهم هذه البيانات.") }}</p>
          <div v-if="ordersLoading && !orders.length" class="empty-state">{{ t("جاري تحميل بيانات الدفع...") }}</div>
          <div v-else-if="!paymentOrders.length" class="empty-state">{{ t("لا توجد تحويلات إلكترونية مسجلة حتى الآن.") }}</div>
          <article v-for="order in paymentOrders" :key="order.dbId" class="admin-card">
            <div class="admin-title-row">
              <strong>{{ t("الأوردر #") }}{{ order.id }}</strong>
              <span class="status-pill" :class="{ paid: order.paymentStatusRaw === 'paid' }">{{ order.paymentStatus }}</span>
            </div>
            <p><strong>{{ t("العميل:") }}</strong> {{ order.customer.name }} — {{ order.customer.phone }}</p>
            <p><strong>{{ t("طريقة التحويل:") }}</strong> {{ paymentLabel(order.paymentMethod) }}</p>
            <p><strong>{{ t("الإجمالي المطلوب:") }}</strong> {{ money(order.total) }}</p>
            <p v-if="order.paymentReference"><strong>{{ t("رقم مرجع التحويل:") }}</strong> {{ order.paymentReference }}</p>
            <p><strong>{{ t("وقت الطلب:") }}</strong> {{ order.createdAt }}</p>
            <div v-if="order.paymentProofPath" class="payment-proof-admin">
              <div class="admin-inline">
                <strong>{{ t("إيصال التحويل:") }}</strong>
                <button class="secondary-button small-button" type="button" @click="preparePaymentProof(order)">
                  {{ order.paymentProofUrl ? 'تحديث صورة الإيصال' : 'عرض صورة الإيصال هنا' }}
                </button>
              </div>
              <a v-if="order.paymentProofUrl" class="payment-proof-preview-link" :href="order.paymentProofUrl" target="_blank" rel="noopener">
                <img class="payment-proof-admin-preview" :src="order.paymentProofUrl" :alt="'إيصال التحويل للأوردر ' + order.id" />
              </a>
              <p v-if="order.paymentProofUrl" class="hint">{{ t("اضغط على الصورة لفتحها بالحجم الكامل.") }}</p>
            </div>
            <p v-else class="hint error-message">{{ t("لا توجد صورة إيصال محفوظة لهذا التحويل.") }}</p>
            <div class="admin-inline">
              <label>{{ t("حالة الدفع") }}
                <select :value="order.paymentStatusRaw" @change="updatePaymentStatus(order.dbId, $event.target.value)">
                  <option value="pending">{{ t("مراجعة مطلوبة") }}</option>
                  <option value="review">{{ t("مراجعة مطلوبة") }}</option>
                  <option value="paid">{{ t("تم الدفع") }}</option>
                  <option value="failed">{{ t("مرفوض") }}</option>
                </select>
              </label>
              <button v-if="order.paymentStatusRaw !== 'paid'" class="confirm-payment-button" type="button" @click="updatePaymentStatus(order.dbId, 'paid')">{{ t("✓ تأكيد استلام الدفع") }}</button>
              <span v-else class="payment-confirmed-admin">{{ t("✓ تم تأكيد الدفع") }}</span>
            </div>
          </article>
        </div>

        <!-- إدارة حسابات موظفي الأوردرات — لمدير الموقع فقط -->
        <div v-if="adminTab === 'staff'" class="admin-content">
          <h3>{{ t("حسابات موظفي لوحة الأوردرات") }}</h3>
          <p class="hint">{{ t("أضف رقم الموظف وكلمة مروره. لو الرقم مضاف بالفعل، اكتب نفس الرقم وكلمة مرور جديدة واضغط الزر لتحديثها. الموظف يدخل بالرقم وكلمة المرور فقط، وصلاحيته لوحة متابعة الأوردرات دون التحكم في الموقع أو الاطلاع على إيصالات الدفع.") }}</p>
          <form class="admin-form" @submit.prevent="createStaffAccount">
            <h4>{{ t("إضافة موظف أو تحديث كلمة مروره") }}</h4>
            <label>{{ t("رقم تليفون الموظف *") }}
              <input v-model.trim="staffPhone" type="tel" inputmode="tel" required maxlength="24" autocomplete="off" placeholder="01012345678" />
            </label>
            <label>{{ t("كلمة مرور الموظف (8 أحرف على الأقل) *") }}
              <input v-model="staffPassword" type="password" required minlength="8" maxlength="128" autocomplete="new-password" :placeholder="t("كلمة مرور حساب الموظف")" />
            </label>
            <div class="admin-inline">
              <button class="primary-button" type="submit" :disabled="adminBusy">{{ adminBusy ? 'جاري الحفظ...' : 'حفظ حساب الموظف / تحديث كلمة المرور' }}</button>
            </div>
          </form>
          <div class="admin-title-row">
            <h4>{{ t("الحسابات المفعلة") }}</h4>
            <button class="secondary-button" type="button" @click="loadStaffAccounts" :disabled="staffLoading">{{ staffLoading ? 'جاري التحميل...' : 'تحديث القائمة' }}</button>
          </div>
          <div v-if="staffLoading && !staffAccounts.length" class="empty-state">{{ t("جاري تحميل حسابات الموظفين...") }}</div>
          <div v-else-if="!staffAccounts.length" class="empty-state">{{ t("لسه مفيش حسابات موظفين مفعلة.") }}</div>
          <article v-for="staff in staffAccounts" :key="staff.userId" class="admin-list-item">
            <div class="admin-list-main">
              <strong>{{ staff.phone }}</strong>
              <small>{{ t("صلاحية: لوحة الأوردرات فقط") }}</small>
              <small>{{ t("تاريخ الإضافة:") }} {{ staff.createdAt ? new Date(staff.createdAt).toLocaleDateString('ar-EG') : '—' }}</small>
            </div>
            <button class="danger-button" type="button" @click="removeStaffAccount(staff.userId)">{{ t("إلغاء الصلاحية") }}</button>
          </article>
        </div>

        <!-- سجل واتساب (رسائل الاختبار والطلبات) -->
        <div v-if="adminTab === 'whatsapp'" class="admin-content">
          <div class="admin-title-row">
            <h3>{{ t("سجل رسائل واتساب") }}</h3>
            <button class="secondary-button" @click="loadWhatsAppMessages" :disabled="whatsappLogLoading">
              {{ whatsappLogLoading ? 'جاري التحديث...' : 'تحديث السجل' }}
            </button>
          </div>
          <p class="hint">{{ t("يعرض رسائل الاختبار وإشعارات الطلبات وحالة التسليم التي وصلتنا من 360dialog.") }}</p>
          <div v-if="whatsappLogLoading && !whatsappLogRows.length" class="empty-state">{{ t("جاري تحميل سجل واتساب...") }}</div>
          <div v-else-if="!whatsappLogRows.length" class="empty-state">{{ t("لا توجد رسائل مسجلة بعد. شغّل اختبار واتساب بعد تفعيل الربط بقاعدة البيانات.") }}</div>
          <article v-for="message in whatsappLogRows" :key="message.messageId" class="admin-card whatsapp-log-card">
            <div class="admin-title-row">
              <strong>{{ whatsappMessageTypeLabel(message.messageType) }}</strong>
              <span class="status-pill" :class="'whatsapp-status-' + message.status">
                {{ whatsappMessageStatusLabel(message.status) }}
              </span>
            </div>
            <p><strong>{{ t("الطلب:") }}</strong> {{ message.orderNumber ? '#' + message.orderNumber : 'رسالة اختبار' }}</p>
            <p><strong>{{ t("تاريخ التسجيل:") }}</strong> {{ message.createdAt ? new Date(message.createdAt).toLocaleString('ar-EG') : '—' }}</p>
            <p v-if="message.providerTimestamp"><strong>{{ t("آخر تحديث من واتساب:") }}</strong> {{ new Date(message.providerTimestamp).toLocaleString('ar-EG') }}</p>
            <p v-if="message.lastError" class="hint error-message"><strong>{{ t("تفاصيل الخطأ:") }}</strong> {{ JSON.stringify(message.lastError) }}</p>
            <details class="whatsapp-message-details">
              <summary>{{ t("تفاصيل تقنية") }}</summary>
              <p><strong>Message ID:</strong> <code>{{ message.messageId }}</code></p>
              <p v-if="message.recipient"><strong>{{ t("المستلم:") }}</strong> {{ message.recipient }}</p>
            </details>
          </article>
        </div>

        <!-- إدارة المنتجات -->
        <div v-if="adminTab === 'products'" class="admin-content">
          <div class="admin-title-row">
            <h3>{{ t("إدارة المنيو") }}</h3>
            <button class="primary-button small-button" @click="newProduct">{{ t("+ إضافة صنف") }}</button>
          </div>

          <form v-if="productFormOpen" class="admin-form" @submit.prevent="saveProduct">
            <h4>{{ editingId ? 'تعديل الصنف' : 'إضافة صنف جديد' }}</h4>
            <div class="form-grid">
              <label>{{ t("اسم الصنف *") }}
                <input v-model.trim="productForm.name" required />
              </label>
              <label>{{ t("السعر بالجنيه *") }}
                <input v-model.number="productForm.price" type="number" min="0" step="0.01" required />
              </label>
              <label>{{ t("القسم *") }}
                <input v-model.trim="productForm.category" required :placeholder="t("مشويات، مقبلات...")" />
              </label>
              <label>{{ t("رابط صورة الصنف") }}
                <input v-model.trim="productForm.image" type="url" placeholder="https://..." />
              </label>
            </div>
            <label>{{ t("وصف الصنف") }}
              <textarea v-model.trim="productForm.description" rows="2"></textarea>
            </label>
            <div class="checkbox-row">
              <label><input v-model="productForm.featured" type="checkbox" /> {{ t("صنف مميز") }}</label>
              <label><input v-model="productForm.available" type="checkbox" /> {{ t("متاح للطلب") }}</label>
            </div>
            <p class="hint">{{ t("تفعيل وإيقاف المنتج يُحفظ في عمود active بقاعدة البيانات. علامة «صنف مميز» تحتاج عمودًا إضافيًا إذا أردت مزامنتها بين جميع الأجهزة.") }}</p>
            <div class="admin-inline">
              <button class="primary-button" type="submit" :disabled="adminBusy">{{ adminBusy ? 'جاري الحفظ...' : 'حفظ الصنف' }}</button>
              <button class="secondary-button" type="button" @click="cancelProduct">{{ t("إلغاء") }}</button>
            </div>
          </form>

          <article v-for="product in products" :key="product.id" class="admin-list-item">
            <img :src="product.image || fallbackImage" :alt="product.name" @error="onImageError" />
            <div class="admin-list-main">
              <strong>{{ product.name }}</strong>
              <small>{{ product.category }} · {{ money(product.price) }}</small>
              <small>{{ product.available === false ? 'غير متاح' : 'متاح' }}</small>
            </div>
            <button class="secondary-button" @click="editProduct(product)">{{ t("تعديل") }}</button>
            <button class="danger-button" @click="deleteProduct(product.id)">{{ t("إيقاف") }}</button>
          </article>
        </div>

        <!-- إدارة صور الخلفية -->
        <div v-if="adminTab === 'slides'" class="admin-content">
          <h3>{{ t("صور الواجهة الرئيسية") }}</h3>
          <p class="hint">{{ t("أضف رابط صورة عامًّا يبدأ بـ https:// . الصور الفعالة تُقرأ من جدول slides.") }}</p>

          <form class="admin-form" @submit.prevent="saveSlide">
            <h4>{{ slideForm.id ? 'تعديل صورة' : 'إضافة صورة' }}</h4>
            <label>{{ t("رابط الصورة *") }}
              <input v-model.trim="slideForm.image" type="url" required placeholder="https://..." />
            </label>
            <label>{{ t("العنوان الظاهر على الصورة") }}
              <input v-model.trim="slideForm.caption" :placeholder="t("أهلاً بيك في سومر")" />
            </label>
            <div class="admin-inline">
              <button class="primary-button" type="submit" :disabled="adminBusy">{{ slideForm.id ? 'حفظ التعديلات' : 'إضافة الصورة' }}</button>
              <button class="secondary-button" type="button" @click="resetSlideForm">{{ t("تفريغ الحقول") }}</button>
            </div>
          </form>

          <label class="interval-control">{{ t("مدة عرض كل صورة بالثواني") }}
            <input v-model.number="settings.slideSeconds" type="number" min="2" max="60" />
          </label>
          <button class="secondary-button" @click="persistDemo">{{ t("حفظ مدة العرض على هذا المتصفح") }}</button>

          <article v-for="(slide, index) in slides" :key="slide.id" class="slide-admin-item">
            <img :src="slide.image" :alt="slide.caption" @error="onImageError" />
            <div class="admin-list-main">
              <strong>{{ slide.caption || 'صورة بدون عنوان' }}</strong>
              <small>{{ t("الترتيب:") }} {{ index + 1 }}</small>
            </div>
            <button class="secondary-button" :disabled="index === 0" @click="moveSlide(index, -1)">↑</button>
            <button class="secondary-button" :disabled="index === slides.length - 1" @click="moveSlide(index, 1)">↓</button>
            <button class="secondary-button" @click="editSlide(slide)">{{ t("تعديل") }}</button>
            <button class="danger-button" @click="deleteSlide(slide.id)">{{ t("إخفاء") }}</button>
          </article>
        </div>

        <!-- مناطق التوصيل -->
        <div v-if="adminTab === 'delivery'" class="admin-content">
          <h3>{{ t("مناطق التوصيل والوقت والسعر") }}</h3>
          <p class="hint">{{ t("كل منطقة لها اسم مستقل، ووقت متوقع للتوصيل بالدقائق، ورسوم توصيل بالجنيه. العميل هيشوف البيانات الثلاثة قبل اختيار طريقة الدفع.") }}</p>
          <form class="admin-form" @submit.prevent="saveArea">
            <h4>{{ areaForm.id ? 'تعديل المنطقة' : 'إضافة منطقة' }}</h4>
            <div class="form-grid">
              <label>{{ t("اسم المنطقة *") }}
                <input v-model.trim="areaForm.name" required :placeholder="t("مثال: مدينة نصر")" />
              </label>
              <label>{{ t("الوقت المتوقع للتوصيل (بالدقائق) *") }}
                <input v-model.number="areaForm.deliveryMinutes" type="number" min="5" max="360" step="5" required />
              </label>
              <label>{{ t("رسوم التوصيل بالجنيه *") }}
                <input v-model.number="areaForm.fee" type="number" min="0" step="0.01" required />
              </label>
            </div>
            <label class="checkbox-label"><input v-model="areaForm.active" type="checkbox" /> {{ t("المنطقة متاحة للتوصيل") }}</label>
            <div class="admin-inline">
              <button class="primary-button" type="submit" :disabled="adminBusy">{{ adminBusy ? 'جاري الحفظ...' : 'حفظ المنطقة' }}</button>
              <button class="secondary-button" type="button" @click="resetAreaForm">{{ t("إلغاء") }}</button>
            </div>
          </form>

          <article v-for="area in areas" :key="area.id" class="admin-list-item">
            <div class="admin-list-main">
              <strong>{{ area.name }}</strong>
              <small>{{ t("وقت التوصيل:") }} {{ formatDeliveryMinutes(area.deliveryMinutes) }}</small>
                <small>{{ t("رسوم التوصيل:") }} {{ money(area.fee) }} · {{ area.active ? 'متاحة' : 'متوقفة' }}</small>
            </div>
            <button class="secondary-button" @click="editArea(area)">{{ t("تعديل") }}</button>
            <button class="danger-button" @click="deleteArea(area.id)">{{ t("إيقاف") }}</button>
          </article>
        </div>

        <!-- بيانات المطعم والروابط -->
        <div v-if="adminTab === 'settings'" class="admin-content">
          <h3>{{ t("بيانات المطعم والتصميم") }}</h3>
          <form class="admin-form" @submit.prevent="saveSettings">
            <div class="form-grid">
              <label>{{ t("اسم المطعم") }}
                <input v-model.trim="settings.name" required />
              </label>
              <label>{{ t("رقم الهاتف") }}
                <input v-model.trim="settings.phone" type="tel" />
              </label>
              <label>{{ t("رقم واتساب مع كود الدولة") }}
                <input v-model.trim="settings.whatsapp" placeholder="201xxxxxxxxx" />
              </label>
              <label>{{ t("العنوان") }}
                <input v-model.trim="settings.address" />
              </label>
              <label>{{ t("مواعيد العمل") }}
                <input v-model.trim="settings.hours" />
              </label>
              <label>{{ t("عنوان المحفظة - فودافون كاش") }}
                <input v-model.trim="settings.vodafoneWallet" :placeholder="t("أدخل البيانات الحقيقية")" />
              </label>
              <label>{{ t("بيانات إنستاباي") }}
                <input v-model.trim="settings.instapayAddress" :placeholder="t("أدخل البيانات الحقيقية")" />
              </label>
              <label>{{ t("رابط الموقع المنشور") }}
                <input v-model.trim="settings.publicUrl" type="url" placeholder="https://..." />
              </label>
              <label>{{ t("رابط المنيو المختصر (يظهر للزوار)") }}
                <input v-model.trim="settings.menuUrl" type="url" placeholder="https://.../somer-restaurant/m/" />
              </label>
            </div>

            <label>{{ t("الوصف المختصر") }}
              <textarea v-model.trim="settings.tagline" rows="3"></textarea>
            </label>

            <h4>{{ t("ألوان الهوية — تُحفظ على هذا المتصفح") }}</h4>
            <div class="color-grid">
              <label>{{ t("لون الخلفية") }} <input v-model="settings.bgColor" type="color" /></label>
              <label>{{ t("لون البطاقات") }} <input v-model="settings.cardColor" type="color" /></label>
              <label>{{ t("اللون الذهبي") }} <input v-model="settings.accentColor" type="color" /></label>
              <label>{{ t("لون النص") }} <input v-model="settings.textColor" type="color" /></label>
            </div>

            <p class="hint">{{ t("رابط المنيو المختصر يُستخدم في زر «افتح المنيو» أسفل الموقع. رمز QR مخصص للطباعة والاستخدام خارج الموقع ولن يظهر داخل واجهة الموقع أو لوحة الإدارة.") }}</p>

            <h4>{{ t("روابط التواصل الاجتماعي") }}</h4>
            <div v-for="link in socialLinks" :key="link.id" class="social-edit-row">
              <input v-model="link.label" :aria-label="t("اسم الرابط")" :placeholder="t("اسم الرابط")" />
              <input v-model="link.url" :aria-label="t("عنوان الرابط")" type="url" placeholder="https://..." />
              <button class="danger-button" type="button" @click="removeSocialLink(link.id)">{{ t("حذف") }}</button>
            </div>
            <button class="secondary-button" type="button" @click="addSocialLink">{{ t("+ إضافة رابط تواصل") }}</button>

            <p class="hint">{{ t("اسم المطعم والهاتف وواتساب والعنوان والمواعيد وبيانات الدفع وروابط التواصل ورابط المنيو وخيار QR تُحفظ في قاعدة البيانات وتظهر لكل الزوار. الألوان والوصف المختصر ومدة السلايدر محفوظة محليًا في هذا المتصفح.") }}</p>
            <div class="admin-inline">
              <button class="primary-button" type="submit" :disabled="adminBusy">{{ adminBusy ? 'جاري الحفظ...' : 'حفظ البيانات' }}</button>
            </div>
          </form>
        </div>

        <!-- بطاقة البيانات و QR -->
        <div v-if="adminTab === 'data'" class="admin-content">
          <h3>{{ t("بطاقة بيانات المطعم") }}</h3>
          <div class="data-card">
            <span class="brand-mark">S</span>
            <h2>{{ settings.name || 'سومر' }}</h2>
            <p>{{ t(settings.tagline) }}</p>
            <p>{{ t("العنوان:") }} {{ settings.address || 'غير محدد' }}</p>
            <p>{{ t("الهاتف:") }} {{ settings.phone || 'غير محدد' }}</p>
            <p>{{ t("واتساب:") }} {{ settings.whatsapp || 'غير محدد' }}</p>
            <p>{{ t("مواعيد العمل:") }} {{ settings.hours || 'غير محددة' }}</p>
            <button class="secondary-button" @click="copyRestaurantData">{{ t("نسخ بيانات المطعم") }}</button>
          </div>

          <button class="danger-button" @click="resetDemo">{{ t("إعادة ضبط إعدادات العرض المحلية") }}</button>
          <p class="hint">{{ t("هذا الزر يعيد إعدادات العرض المحلية فقط، ولا يحذف المنتجات أو الطلبات من قاعدة البيانات.") }}</p>
        </div>

        <!-- أدوات الربط -->
        <div v-if="adminTab === 'integrations'" class="admin-content">
          <h3>{{ t("أدوات الربط والاتصال") }}</h3>

          <article class="integration-card">
            <div><strong>WhatsApp</strong><p>{{ t("رابط التواصل المباشر مع المطعم.") }}</p></div>
            <span :class="['status-pill', settings.whatsapp ? 'connected' : 'disconnected']">
              {{ settings.whatsapp ? 'الرقم مُدخل' : 'يحتاج إعداد' }}
            </span>
            <a v-if="settings.whatsapp" :href="whatsappUrl" target="_blank" rel="noopener">{{ t("اختبار الرابط") }}</a>
          </article>

          <article class="integration-card">
            <div><strong>Facebook</strong><p>{{ t("صفحة المطعم الرسمية.") }}</p></div>
            <span class="status-pill" :class="hasSocial('Facebook') ? 'connected' : 'disconnected'">
              {{ hasSocial('Facebook') ? 'الرابط مُدخل' : 'غير مربوط' }}
            </span>
          </article>

          <article class="integration-card">
            <div><strong>Instagram</strong><p>{{ t("حساب المطعم على إنستجرام.") }}</p></div>
            <span class="status-pill" :class="hasSocial('Instagram') ? 'connected' : 'disconnected'">
              {{ hasSocial('Instagram') ? 'الرابط مُدخل' : 'غير مربوط' }}
            </span>
          </article>

          <article class="integration-card">
            <div><strong>{{ t("قاعدة بيانات Supabase") }}</strong><p>{{ t("تحميل المنتجات ومناطق التوصيل والإعدادات وحفظ الطلبات.") }}</p></div>
            <span :class="['status-pill', databaseConnected ? 'connected' : 'disconnected']">
              {{ databaseConnected ? 'اتصال قاعدة البيانات ناجح' : 'الاتصال لم يكتمل' }}
            </span>
          </article>

          <article class="integration-card">
            <div><strong>Meta Business / Ads Manager</strong><p>{{ t("إدارة الحملات الإعلانية وربط الحسابات.") }}</p></div>
            <span class="status-pill disconnected">{{ t("يحتاج إعداد خارجي") }}</span>
          </article>

          <article class="integration-card">
            <div><strong>Meta Pixel / Conversion API</strong><p>{{ t("قياس الزيارات والتحويلات الإعلانية.") }}</p></div>
            <span class="status-pill disconnected">{{ t("غير مربوط") }}</span>
          </article>

          <div class="notice">
            {{ t("نجاح تحميل بيانات Supabase لا يثبت وحده أن سياسات RLS آمنة أو أن جميع عمليات الإدارة تعمل. يلزم إعداد صلاحيات القراءة للزوار وصلاحيات الكتابة للمدير فقط، بالإضافة إلى إعداد وظيفة الطلبات واختبارها.") }}
          </div>
          <button class="secondary-button" @click="loadData">{{ t("اختبار الاتصال وإعادة تحميل البيانات") }}</button>
        </div>

        <div class="admin-bottom">
          <button class="secondary-button" @click="exportBackup">{{ t("تصدير نسخة بيانات JSON") }}</button>
          <button class="secondary-button" @click="closeAdmin">{{ t("معاينة الموقع") }}</button>
          <button class="danger-button" @click="logout">{{ t("تسجيل خروج") }}</button>
        </div>
      </template>
    </section>
  </div>

  <!-- متابعة طلب العميل -->
  <a v-if="!adminOpen" class="orders-dashboard-fab" :href="ordersDashboardUrl">☷ لوحة الأوردرات</a>
  <button v-if="!adminOpen" class="customer-tracking-fab" type="button" @click="openTracking()">◷ متابعة طلبك</button>

  <div v-if="trackingModalOpen" class="overlay tracking-overlay" @click.self="closeTracking">
    <section class="modal tracking-modal" role="dialog" aria-modal="true" aria-label="متابعة طلبك">
      <div class="drawer-heading">
        <div>
          <span class="eyebrow">SUMER ORDER TRACKING</span>
          <h2>متابعة طلبك</h2>
        </div>
        <button class="close-button" type="button" aria-label="إغلاق" @click="closeTracking">✕</button>
      </div>
      <p class="hint">اكتب رقم الأوردر ورقم الموبايل اللي سجلت بيه الطلب علشان تشوف حالته والوقت المتوقع للتجهيز.</p>

      <form class="tracking-form" @submit.prevent="lookupOrderTracking">
        <label>رقم الأوردر *
          <input v-model.trim="trackingForm.orderNumber" inputmode="numeric" autocomplete="off" required maxlength="18" placeholder="رقم الطلب الموجود في رسالة التأكيد" />
        </label>
        <label>رقم موبايل العميل *
          <input v-model.trim="trackingForm.phone" type="tel" autocomplete="tel" required maxlength="25" placeholder="نفس الرقم المستخدم وقت الطلب" />
        </label>
        <p v-if="trackingError" class="error-message tracking-error" role="alert">{{ trackingError }}</p>
        <button class="primary-button full-button" type="submit" :disabled="trackingLoading">
          {{ trackingLoading ? 'جاري جلب حالة الطلب...' : 'عرض حالة الطلب' }}
        </button>
      </form>

      <section v-if="trackingOrder" class="tracking-result" aria-live="polite">
        <div class="admin-title-row">
          <h3>الأوردر #{{ trackingOrder.orderNumber }}</h3>
          <span class="status-pill">{{ trackingStatusLabel }}</span>
        </div>
        <p class="tracking-status-message">{{ trackingStatusMessage }}</p>

        <div v-if="trackingOrder.deliveryMinutes" class="tracking-delivery-estimate">
          <span>الوقت المتوقع للتوصيل حسب منطقتك</span>
          <strong>{{ formatDeliveryMinutes(trackingOrder.deliveryMinutes) }}</strong>
          <small>ده وقت تقديري، وقد يتغير حسب ضغط الطلبات وحالة الطريق.</small>
        </div>

        <div v-if="trackingOrder.paymentMethod !== 'cash'" class="tracking-payment-card">
          <button
            type="button"
            disabled
            class="tracking-payment-button"
            :class="{
              paid: trackingOrder.paymentStatus === 'paid',
              rejected: ['failed', 'rejected', 'declined'].includes(trackingOrder.paymentStatus)
            }"
          >
            {{
              trackingOrder.paymentStatus === 'paid'
                ? '✓ تم الدفع'
                : ['failed', 'rejected', 'declined'].includes(trackingOrder.paymentStatus)
                  ? '⚠ التحويل محتاج مراجعة'
                  : '⌛ في انتظار تأكيد الدفع'
            }}
          </button>
          <p v-if="trackingOrder.paymentStatus === 'paid'" class="tracking-payment-note">المطعم أكد استلام المبلغ بنجاح.</p>
          <p v-else-if="['failed', 'rejected', 'declined'].includes(trackingOrder.paymentStatus)" class="tracking-payment-note">راجع المطعم للتأكد من بيانات التحويل أو صورة الإيصال.</p>
          <p v-else class="tracking-payment-note">تم إرسال الإيصال مع الطلب. هتظهر علامة «تم الدفع» باللون الأخضر بعد ما المطعم يراجع التحويل ويؤكده.</p>
          <p v-if="trackingOrder.paymentReference" class="hint">رقم مرجع التحويل: {{ trackingOrder.paymentReference }}</p>
        </div>

        <div
          v-if="!['ready', 'out_for_delivery', 'delivered', 'cancelled'].includes(trackingOrder.status)"
          class="tracking-countdown"
          :class="{ overdue: trackingSecondsRemaining !== null && trackingSecondsRemaining <= 0 }"
        >
          <span>الوقت المتوقع للتجهيز</span>
          <strong>{{ trackingTimeLabel }}</strong>
          <small>العداد بيتحدّث تلقائيًا، وحالة الطلب بتتراجع كل 15 ثانية.</small>
        </div>

        <ol v-if="trackingOrder.status !== 'cancelled'" class="tracking-steps">
          <li :class="{ active: trackingStage === 0, complete: trackingStage > 0 }">
            <span>1</span><div><strong>وصل للمطعم</strong><small>تم تسجيل الأوردر</small></div>
          </li>
          <li :class="{ active: trackingStage === 1, complete: trackingStage > 1 }">
            <span>2</span><div><strong>قيد التجهيز</strong><small>المطعم بيحضّر طلبك</small></div>
          </li>
          <li :class="{ active: trackingStage === 2, complete: trackingStage > 2 }">
            <span>3</span><div><strong>جاهز للتوصيل</strong><small>الأوردر اتجهز</small></div>
          </li>
          <li :class="{ active: trackingStage === 3, complete: trackingStage > 3 }">
            <span>4</span><div><strong>خرج للتوصيل</strong><small>الأوردر في الطريق</small></div>
          </li>
          <li :class="{ active: trackingStage === 4, complete: trackingStage > 4 }">
            <span>5</span><div><strong>تم التسليم</strong><small>بالهنا والشفا</small></div>
          </li>
        </ol>

        <div class="tracking-items">
          <h4>أصناف طلبك</h4>
          <div v-for="(item, index) in trackingOrder.items" :key="item.id || (item.name + '-' + index)" class="tracking-item-row">
            <span>{{ item.name }}</span><strong>× {{ item.quantity }}</strong>
          </div>
          <p v-if="!trackingOrder.items.length" class="hint">تفاصيل الأصناف غير متاحة لهذا الطلب.</p>
        </div>

        <div class="tracking-actions">
          <small>آخر تحديث: {{ trackingOrder.updatedAt ? new Date(trackingOrder.updatedAt).toLocaleTimeString('ar-EG') : 'تم التحديث الآن' }}</small>
          <button class="secondary-button" type="button" @click="refreshOrderTracking(false)" :disabled="trackingLoading">
            {{ trackingLoading ? 'جاري التحديث...' : 'تحديث الحالة' }}
          </button>
        </div>
      </section>
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

const EN_TRANSLATIONS = {
  "الرئيسية": "Home",
  "المنيو": "Menu",
  "عن المطعم": "About",
  "تواصل معنا": "Contact",
  "واتساب": "WhatsApp",
  "🛒 السلة": "🛒 Cart",
  "لوحة الأوردرات": "Orders dashboard",
  "أصالة الشام في كل لقمة": "The authentic taste of Syria",
  "اكتشف المنيو": "Explore the menu",
  "نكهة شامية أصيلة": "Authentic Syrian flavor",
  "طعم يفتكرك بالبيت": "A taste that feels like home",
  "تحضير باهتمام": "Prepared with care",
  "نهتم بكل تفصيلة": "Every detail matters",
  "توصيل للمنزل": "Home delivery",
  "اختار منطقتك عند الطلب": "Choose your area when ordering",
  "اكتشف مذاق الشام": "Discover the taste of Syria",
  "منيو": "Menu",
  "اختار أطباقك المفضلة واطلبها بسهولة.": "Choose your favorite dishes and order with ease.",
  "جاري تحميل بيانات المنيو من قاعدة البيانات...": "Loading menu from the database...",
  "اختيار مميز": "Featured",
  "مفيش أصناف متاحة حاليًا. أضف المنتجات من لوحة الإدارة بعد الاتصال بقاعدة البيانات.": "No menu items are available yet. Add products from the admin panel after connecting the database.",
  "من قلب الشام": "From the heart of Syria",
  "طعم يجمعنا": "A taste that brings us together",
  "حكاية وطعم": "Our story and flavor",
  "أهلاً بيك في": "Welcome to",
  "سومر": "SUMER",
  "نسعى لتقديم تجربة طعام مميزة، تجمع بين جودة المكونات وروح المطبخ الشامي.": "We aim to deliver a memorable dining experience inspired by the quality and spirit of Syrian cuisine.",
  "شوف المنيو": "View menu",
  "إحنا هنا لخدمتك": "We're here to help",
  "تواصل معانا": "Get in touch",
  "العنوان": "Address",
  "رقم الهاتف": "Phone number",
  "مواعيد العمل": "Opening hours",
  "افتح المنيو": "Open menu",
  "— نسخة تجريبية": "— Demo version",
  "إدارة الموقع ⚙": "Admin settings ⚙",
  "سلة الطلبات": "Your cart",
  "السلة لسه فاضية.": "Your cart is empty.",
  "للواحد": "each",
  "للواحد)": "each)",
  "قيمة المنتجات": "Items subtotal",
  "التوصيل": "Delivery",
  "الإجمالي": "Total",
  "استكمال بيانات الطلب": "Continue to checkout",
  "بيانات التوصيل والطلب": "Delivery and order details",
  "الخطوة 1 من 2": "Step 1 of 2",
  "بيانات العميل والتوصيل": "Customer and delivery details",
  "الاسم بالكامل *": "Full name *",
  "رقم الهاتف الأساسي *": "Primary phone number *",
  "رقم هاتف بديل": "Alternative phone number",
  "المنطقة *": "Area *",
  "اختار المنطقة": "Choose an area",
  "اسم الشارع *": "Street name *",
  "رقم المبنى / العمارة": "Building number",
  "الدور": "Floor",
  "رقم الشقة": "Apartment number",
  "المنطقة": "Area",
  "الوقت المتوقع للتوصيل": "Estimated delivery time",
  "رسوم التوصيل": "Delivery fee",
  "اختار المنطقة علشان يظهر سعر التوصيل والوقت المتوقع قبل تأكيد الطلب.": "Choose an area to see the delivery fee and estimated time before confirming your order.",
  "متابعة لمراجعة الإجمالي والدفع": "Review total and payment",
  "الخطوة 2 من 2": "Step 2 of 2",
  "مراجعة الفاتورة وطريقة الدفع": "Review invoice and payment method",
  "تعديل بيانات التوصيل": "Edit delivery details",
  "ملخص الفاتورة": "Invoice summary",
  "قيمة الأصناف": "Items subtotal",
  "منطقة التوصيل": "Delivery area",
  "وقت التوصيل المتوقع": "Estimated delivery time",
  "الإجمالي النهائي": "Final total",
  "اختار طريقة الدفع": "Choose a payment method",
  "كاش": "Cash",
  "الدفع عند الاستلام": "Cash on delivery",
  "فودافون كاش": "Vodafone Cash",
  "تحويل للمحفظة": "Wallet transfer",
  "إنستاباي": "InstaPay",
  "تحويل إلكتروني": "Electronic transfer",
  "بيانات الدفع": "Payment details",
  "حوّل المبلغ على محفظة فودافون كاش:": "Transfer the amount to the Vodafone Cash wallet:",
  "بيانات التحويل عبر إنستاباي:": "InstaPay transfer details:",
  "راجع الإجمالي النهائي أعلاه وحوّل نفس المبلغ. بعد التحويل، ارفع صورة الإيصال.": "Check the final total above and transfer the same amount. Then upload a photo of the receipt.",
  "صورة إيصال التحويل * (مطلوبة)": "Transfer receipt image * (required)",
  "اختار صورة الإيصال من معرض الصور. بعد تأكيد الطلب هتتربط برقم الأوردر وتتبعت للمطعم على واتساب.": "Choose the receipt image from your gallery. After the order is confirmed, it will be linked to the order number and sent to the restaurant via WhatsApp.",
  "تم اختيار الصورة:": "Selected image:",
  "رقم مرجع التحويل / رقم العملية (لو ظاهر في الإيصال)": "Transfer reference / transaction number (if shown on the receipt)",
  "حالة الدفع هتفضل «مراجعة مطلوبة» لحد ما الإدارة تراجع الإيصال وتؤكد استلام المبلغ.": "Payment will remain “Pending review” until the team checks the receipt and confirms payment.",
  "ملاحظات إضافية": "Additional notes",
  "قبل تأكيد الطلب، راجع الأصناف والمنطقة ووقت التوصيل والإجمالي وطريقة الدفع.": "Before confirming, review the items, delivery area and time, total, and payment method.",
  "تم إرسال الطلب": "Order submitted",
  "رقم الطلب:": "Order number:",
  "الإجمالي:": "Total:",
  "الحالة:": "Status:",
  "تم حفظ الطلب، لكن إشعار واتساب لم يُرسل لأن إعدادات الاتصال غير مكتملة.": "The order was saved, but the WhatsApp notification was not sent because integration settings are incomplete.",
  "تم حفظ الطلب، لكن تعذّر إرسال جزء من إشعار واتساب أو صورة الإيصال. راجع سجل الوظيفة قبل إعادة المحاولة.": "The order was saved, but part of the WhatsApp notification or receipt image could not be sent. Check the function logs before retrying.",
  "تم قبول ملخص الطلب للإرسال عبر واتساب. حالة الصور:": "The order summary was accepted for WhatsApp delivery. Image status:",
  "متابعة الأوردر": "Track order",
  "تمام": "Done",
  "لوحة إدارة المطعم": "Restaurant admin panel",
  "تسجيل دخول الإدارة": "Admin sign in",
  "استخدم حساب الإدارة الذي أنشأته في Supabase Auth.": "Use the administrator account created in Supabase Auth.",
  "البريد الإلكتروني": "Email address",
  "كلمة المرور": "Password",
  "يلزم إضافة معرّف حساب المدير إلى جدول admin_users. لا توجد كلمة مرور ثابتة داخل هذا الملف.": "Add the administrator account ID to the admin_users table. No fixed password is stored in this file.",
  "إيصالات الدفع ومراجعة التحويلات": "Payment receipts and transfer review",
  "هذه الشاشة خاصة بمدير الموقع لمراجعة صور التحويل وتأكيد الدفع. الموظفون في لوحة الأوردرات لا تظهر لهم هذه البيانات.": "This page is for administrators to review transfer receipts and confirm payment. Order dashboard staff cannot view this information.",
  "جاري تحميل بيانات الدفع...": "Loading payment data...",
  "لا توجد تحويلات إلكترونية مسجلة حتى الآن.": "No electronic transfers have been recorded yet.",
  "الأوردر #": "Order #",
  "العميل:": "Customer:",
  "طريقة التحويل:": "Transfer method:",
  "الإجمالي المطلوب:": "Amount due:",
  "رقم مرجع التحويل:": "Transfer reference:",
  "وقت الطلب:": "Order time:",
  "إيصال التحويل:": "Transfer receipt:",
  "اضغط على الصورة لفتحها بالحجم الكامل.": "Click the image to view it at full size.",
  "لا توجد صورة إيصال محفوظة لهذا التحويل.": "No receipt image is saved for this transfer.",
  "حالة الدفع": "Payment status",
  "مراجعة مطلوبة": "Pending review",
  "تم الدفع": "Paid",
  "مرفوض": "Rejected",
  "✓ تأكيد استلام الدفع": "✓ Confirm payment received",
  "✓ تم تأكيد الدفع": "✓ Payment confirmed",
  "حسابات موظفي لوحة الأوردرات": "Order dashboard staff accounts",
  "أضف رقم الموظف وكلمة مروره. لو الرقم مضاف بالفعل، اكتب نفس الرقم وكلمة مرور جديدة واضغط الزر لتحديثها. الموظف يدخل بالرقم وكلمة المرور فقط، وصلاحيته لوحة متابعة الأوردرات دون التحكم في الموقع أو الاطلاع على إيصالات الدفع.": "Add the staff member’s phone number and password. If the number already exists, enter the same number with a new password and save to update it. Staff can sign in with phone and password and can only access the order dashboard, not site controls or payment receipts.",
  "إضافة موظف أو تحديث كلمة مروره": "Add staff member or update password",
  "رقم تليفون الموظف *": "Staff phone number *",
  "كلمة مرور الموظف (8 أحرف على الأقل) *": "Staff password (at least 8 characters) *",
  "الحسابات المفعلة": "Active accounts",
  "جاري تحميل حسابات الموظفين...": "Loading staff accounts...",
  "لسه مفيش حسابات موظفين مفعلة.": "No active staff accounts yet.",
  "صلاحية: لوحة الأوردرات فقط": "Access: order dashboard only",
  "تاريخ الإضافة:": "Created:",
  "إلغاء الصلاحية": "Revoke access",
  "سجل رسائل واتساب": "WhatsApp message log",
  "يعرض رسائل الاختبار وإشعارات الطلبات وحالة التسليم التي وصلتنا من 360dialog.": "Shows test messages, order notifications, and delivery statuses received from 360dialog.",
  "جاري تحميل سجل واتساب...": "Loading WhatsApp log...",
  "لا توجد رسائل مسجلة بعد. شغّل اختبار واتساب بعد تفعيل الربط بقاعدة البيانات.": "No messages recorded yet. Test WhatsApp after enabling the database integration.",
  "الطلب:": "Order:",
  "تاريخ التسجيل:": "Created at:",
  "آخر تحديث من واتساب:": "Last WhatsApp update:",
  "تفاصيل الخطأ:": "Error details:",
  "تفاصيل تقنية": "Technical details",
  "المستلم:": "Recipient:",
  "إدارة المنيو": "Menu management",
  "+ إضافة صنف": "+ Add item",
  "اسم الصنف *": "Item name *",
  "السعر بالجنيه *": "Price in EGP *",
  "القسم *": "Category *",
  "رابط صورة الصنف": "Item image URL",
  "وصف الصنف": "Item description",
  "صنف مميز": "Featured item",
  "متاح للطلب": "Available to order",
  "تفعيل وإيقاف المنتج يُحفظ في عمود active بقاعدة البيانات. علامة «صنف مميز» تحتاج عمودًا إضافيًا إذا أردت مزامنتها بين جميع الأجهزة.": "Product availability is saved in the database’s active column. The “Featured” flag needs an additional database column to sync across devices.",
  "إلغاء": "Cancel",
  "تعديل": "Edit",
  "إيقاف": "Disable",
  "صور الواجهة الرئيسية": "Homepage slides",
  "أضف رابط صورة عامًّا يبدأ بـ https:// . الصور الفعالة تُقرأ من جدول slides.": "Add a public image URL starting with https://. Active images are read from the slides table.",
  "رابط الصورة *": "Image URL *",
  "العنوان الظاهر على الصورة": "Text shown on image",
  "تفريغ الحقول": "Clear fields",
  "مدة عرض كل صورة بالثواني": "Duration per slide (seconds)",
  "حفظ مدة العرض على هذا المتصفح": "Save duration in this browser",
  "الترتيب:": "Order:",
  "إخفاء": "Hide",
  "مناطق التوصيل والوقت والسعر": "Delivery areas, time and fees",
  "كل منطقة لها اسم مستقل، ووقت متوقع للتوصيل بالدقائق، ورسوم توصيل بالجنيه. العميل هيشوف البيانات الثلاثة قبل اختيار طريقة الدفع.": "Each area has its own name, estimated delivery time in minutes, and delivery fee in EGP. Customers see all three before choosing a payment method.",
  "اسم المنطقة *": "Area name *",
  "الوقت المتوقع للتوصيل (بالدقائق) *": "Estimated delivery time (minutes) *",
  "رسوم التوصيل بالجنيه *": "Delivery fee in EGP *",
  "المنطقة متاحة للتوصيل": "Area is available for delivery",
  "وقت التوصيل:": "Delivery time:",
  "رسوم التوصيل:": "Delivery fee:",
  "بيانات المطعم والتصميم": "Restaurant details and design",
  "اسم المطعم": "Restaurant name",
  "رقم واتساب مع كود الدولة": "WhatsApp number with country code",
  "عنوان المحفظة - فودافون كاش": "Vodafone Cash wallet number",
  "بيانات إنستاباي": "InstaPay details",
  "رابط الموقع المنشور": "Published website URL",
  "رابط المنيو المختصر (يظهر للزوار)": "Short menu link (visible to visitors)",
  "الوصف المختصر": "Short description",
  "ألوان الهوية — تُحفظ على هذا المتصفح": "Brand colors — saved in this browser",
  "لون الخلفية": "Background color",
  "لون البطاقات": "Card color",
  "اللون الذهبي": "Gold accent",
  "لون النص": "Text color",
  "رابط المنيو المختصر يُستخدم في زر «افتح المنيو» أسفل الموقع. رمز QR مخصص للطباعة والاستخدام خارج الموقع ولن يظهر داخل واجهة الموقع أو لوحة الإدارة.": "The short menu link is used by the “Open menu” button at the bottom of the site. The QR code is for printing and external use; it does not appear inside the site or admin panel.",
  "روابط التواصل الاجتماعي": "Social media links",
  "حذف": "Delete",
  "+ إضافة رابط تواصل": "+ Add social link",
  "اسم المطعم والهاتف وواتساب والعنوان والمواعيد وبيانات الدفع وروابط التواصل ورابط المنيو وخيار QR تُحفظ في قاعدة البيانات وتظهر لكل الزوار. الألوان والوصف المختصر ومدة السلايدر محفوظة محليًا في هذا المتصفح.": "Restaurant name, phone, WhatsApp, address, hours, payment details, social links, menu link, and QR option are saved in the database and shown to visitors. Colors, short description, and slide duration are saved in this browser only.",
  "بطاقة بيانات المطعم": "Restaurant information card",
  "العنوان:": "Address:",
  "الهاتف:": "Phone:",
  "واتساب:": "WhatsApp:",
  "مواعيد العمل:": "Opening hours:",
  "نسخ بيانات المطعم": "Copy restaurant details",
  "إعادة ضبط إعدادات العرض المحلية": "Reset local display settings",
  "هذا الزر يعيد إعدادات العرض المحلية فقط، ولا يحذف المنتجات أو الطلبات من قاعدة البيانات.": "This only resets local display settings. It does not delete products or orders from the database.",
  "أدوات الربط والاتصال": "Integrations and connections",
  "رابط التواصل المباشر مع المطعم.": "Direct contact link for the restaurant.",
  "اختبار الرابط": "Test link",
  "صفحة المطعم الرسمية.": "Official restaurant page.",
  "حساب المطعم على إنستجرام.": "Restaurant Instagram account.",
  "قاعدة بيانات Supabase": "Supabase database",
  "تحميل المنتجات ومناطق التوصيل والإعدادات وحفظ الطلبات.": "Loads products, delivery areas, settings, and saves orders.",
  "إدارة الحملات الإعلانية وربط الحسابات.": "Manage ad campaigns and connect accounts.",
  "يحتاج إعداد خارجي": "External setup required",
  "قياس الزيارات والتحويلات الإعلانية.": "Measure visits and ad conversions.",
  "غير مربوط": "Not connected",
  "نجاح تحميل بيانات Supabase لا يثبت وحده أن سياسات RLS آمنة أو أن جميع عمليات الإدارة تعمل. يلزم إعداد صلاحيات القراءة للزوار وصلاحيات الكتابة للمدير فقط، بالإضافة إلى إعداد وظيفة الطلبات واختبارها.": "Successfully loading Supabase data does not by itself prove RLS policies are secure or that all admin actions work. Public read access, admin-only write access, and the order function must be configured and tested.",
  "اختبار الاتصال وإعادة تحميل البيانات": "Test connection and reload data",
  "تصدير نسخة بيانات JSON": "Export JSON data backup",
  "معاينة الموقع": "Preview site",
  "تسجيل خروج": "Sign out",
  "الكل": "All",
  "أهلاً بيك في سومر": "Welcome to SUMER",
  "مرحبًا، أريد الاستفسار عن منيو ": "Hello, I’d like to ask about the menu at ",
  "وصل للمطعم": "Received by restaurant",
  "تم تأكيد الطلب": "Order confirmed",
  "قيد التجهيز": "Preparing",
  "جاهز للتوصيل": "Ready for delivery",
  "خرج للتوصيل": "Out for delivery",
  "تم التسليم": "Delivered",
  "تم إلغاء الطلب": "Order cancelled",
  "حالة الطلب غير معروفة": "Unknown order status",
  "طلبك وصل للمطعم وجاري مراجعته وبدء التجهيز.": "Your order has reached the restaurant and is being reviewed.",
  "المطعم أكد استلام الطلب، وبيجهّز لبدء التحضير.": "The restaurant confirmed your order and is getting ready to prepare it.",
  "طلبك قيد التجهيز في المطعم.": "Your order is being prepared.",
  "طلبك اتجهز وبقى جاهز لاستلام المندوب.": "Your order is ready for the courier.",
  "طلبك خرج من المطعم وهو في الطريق إليك.": "Your order is on its way.",
  "تم تسليم طلبك. بالهنا والشفا!": "Your order has been delivered. Enjoy!",
  "تم إلغاء الطلب. تواصل مع المطعم لو محتاج تفاصيل.": "Your order was cancelled. Contact the restaurant for details.",
  "جاري جلب حالة طلبك.": "Retrieving your order status.",
  "وقت التجهيز غير محدد لهذا الطلب": "Preparation time is not specified for this order.",
  "الوقت المتوقع غير متاح": "Estimated time unavailable",
  "الوقت المتوقع انتهى — بنحدّث حالة الطلب": "Estimated time has passed — updating order status",
  "متبقي ": "Remaining "
}

const LANGUAGE_STORAGE_KEY = 'sumer-language-v1'
function getInitialLanguage() {
  try { return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'en' ? 'en' : 'ar' } catch (_) { return 'ar' }
}

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
      language: getInitialLanguage(),

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
      checkoutStep: 1,
      confirmedOrder: null,
      trackingModalOpen: false,
      trackingForm: { orderNumber: '', phone: '' },
      trackingOrder: null,
      trackingLoading: false,
      trackingError: '',
      trackingLastRefreshAt: 0,
      lastOrderPhone: '',
      checkout: this.emptyCheckout(),
      proofFileName: '',
      paymentProofFile: null,
      paymentProofPreviewUrl: '',
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
      adminTab: 'products',
      staffPhone: '',
      staffPassword: '',
      staffAccounts: [],
      staffLoading: false,

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
      whatsappLogRows: [],
      whatsappLogLoading: false,
      toast: '',
      toastTimer: null,

      adminTabs: [
        { id: 'products', label: 'المنيو' },
        { id: 'slides', label: 'الصور' },
        { id: 'delivery', label: 'التوصيل' },
        { id: 'settings', label: 'إعدادات الموقع والدفع' },
        { id: 'payments', label: 'إيصالات الدفع' },
        { id: 'staff', label: 'موظفو الأوردرات' },
        { id: 'data', label: 'بطاقة بيانات المطعم' },
        { id: 'whatsapp', label: 'سجل واتساب' },
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

    selectedDeliveryMinutes() {
      return this.selectedArea ? (Number(this.selectedArea.deliveryMinutes) || 45) : null
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

    ordersDashboardUrl() {
      const base = (process.env.BASE_URL || '/').replace(/\/?$/, '/')
      return base + 'orders/'
    },

    menuQrTarget() {
      const explicitTarget = String(this.settings.menuUrl || '').trim()
      const publicUrl = String(this.settings.publicUrl || '').trim()
      const normalizedPublicUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl
      const currentPageUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : ''
      const target = explicitTarget || (normalizedPublicUrl ? normalizedPublicUrl + '/#menu' : (currentPageUrl ? currentPageUrl + '#menu' : ''))
      return this.isValidUrl(target) ? target : ''
    },

    trackingStatusLabel() {
      const labels = {
        new: 'وصل للمطعم',
        confirmed: 'تم تأكيد الطلب',
        preparing: 'قيد التجهيز',
        ready: 'جاهز للتوصيل',
        out_for_delivery: 'خرج للتوصيل',
        delivered: 'تم التسليم',
        cancelled: 'تم إلغاء الطلب'
      }
      return this.t(labels[this.trackingOrder?.status] || 'حالة الطلب غير معروفة')
    },

    trackingStatusMessage() {
      const messages = {
        new: 'طلبك وصل للمطعم وجاري مراجعته وبدء التجهيز.',
        confirmed: 'المطعم أكد استلام الطلب، وبيجهّز لبدء التحضير.',
        preparing: 'طلبك قيد التجهيز في المطعم.',
        ready: 'طلبك اتجهز وبقى جاهز لاستلام المندوب.',
        out_for_delivery: 'طلبك خرج من المطعم وهو في الطريق إليك.',
        delivered: 'تم تسليم طلبك. بالهنا والشفا!',
        cancelled: 'تم إلغاء الطلب. تواصل مع المطعم لو محتاج تفاصيل.'
      }
      return this.t(messages[this.trackingOrder?.status] || 'جاري جلب حالة طلبك.')
    },

    trackingStage() {
      const stages = {
        new: 0,
        confirmed: 0,
        preparing: 1,
        ready: 2,
        out_for_delivery: 3,
        delivered: 4,
        cancelled: -1
      }
      return this.trackingOrder ? (stages[this.trackingOrder.status] ?? 0) : -1
    },

    trackingSecondsRemaining() {
      if (!this.trackingOrder?.preparationDeadlineAt) return null
      if (['out_for_delivery', 'delivered', 'cancelled'].includes(this.trackingOrder.status)) return null
      const deadline = new Date(this.trackingOrder.preparationDeadlineAt).getTime()
      if (!Number.isFinite(deadline)) return null
      return Math.floor((deadline - this.timerNow) / 1000)
    },

    trackingTimeLabel() {
      if (!this.trackingOrder) return ''
      if (!this.trackingOrder.preparationDeadlineAt) return this.language === 'en' ? 'Preparation time is not specified for this order' : 'وقت التجهيز غير محدد لهذا الطلب'
      const remaining = this.trackingSecondsRemaining
      if (remaining === null) return this.language === 'en' ? 'Estimated time unavailable' : 'الوقت المتوقع غير متاح'
      if (remaining <= 0) return this.language === 'en' ? 'Estimated time has passed — updating order status' : 'الوقت المتوقع انتهى — بنحدّث حالة الطلب'
      const hours = Math.floor(remaining / 3600)
      const minutes = Math.floor((remaining % 3600) / 60)
      const seconds = String(remaining % 60).padStart(2, '0')
      if (this.language === 'en') {
        const parts = []
        if (hours) parts.push(hours + ' hr')
        parts.push(minutes + ' min')
        parts.push(seconds + ' sec')
        return 'Remaining ' + parts.join(' ')
      }
      return 'متبقي ' + (hours ? hours + ' ساعة ' : '') + minutes + ' دقيقة ' + seconds + ' ثانية'
    },

    sortedOrders() {
      return [...this.orders].sort((a, b) => Number(b.createdAtTimestamp || 0) - Number(a.createdAtTimestamp || 0))
    },

    paymentOrders() {
      return this.sortedOrders.filter(order => order.paymentMethod !== 'cash')
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
        ['orders', 'whatsapp'].includes(this.adminTab) &&
        this.timerNow - this.lastWhatsAppStatusRefreshAt >= 10000
      ) {
        this.lastWhatsAppStatusRefreshAt = this.timerNow
        if (this.adminTab === 'orders') this.refreshWhatsAppStatuses()
        else this.loadWhatsAppMessages()
      }

      if (
        this.trackingModalOpen &&
        this.trackingOrder &&
        !this.trackingLoading &&
        this.timerNow - this.trackingLastRefreshAt >= 15000
      ) {
        this.refreshOrderTracking(true)
      }
    }, 1000)
  },

  async mounted() {
    this.applyLanguage()
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
    this.clearPaymentProofPreview()
    if (this.toastTimer) clearTimeout(this.toastTimer)
    if (this.timerInterval) clearInterval(this.timerInterval)
  },

  methods: {
    t(value) {
      const text = value == null ? '' : String(value)
      return this.language === 'en' ? (EN_TRANSLATIONS[text] || text) : text
    },

    toggleLanguage() {
      this.language = this.language === 'ar' ? 'en' : 'ar'
      this.applyLanguage()
    },

    applyLanguage() {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = this.language
        document.documentElement.dir = this.language === 'ar' ? 'rtl' : 'ltr'
      }
      try { window.localStorage.setItem(LANGUAGE_STORAGE_KEY, this.language) } catch (_) {}
    },

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
      return { id: '', name: '', fee: 0, deliveryMinutes: 45, active: true, sort_order: 0 }
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
        building: '',
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
          .select('id,name,fee,delivery_minutes,active,sort_order')
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
          deliveryMinutes: Number(row.delivery_minutes) || 45,
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
            menuQrEnabled: false
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
      if (this.ordersLoading) return
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
            delivery_minutes,
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
            deliveryMinutes: Number(row.delivery_minutes) || 45,
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
        ready: 'جاهز للتوصيل',
        prepared: 'جاهز للتوصيل',
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
        'جاهز للتوصيل': 'ready',
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

    selectAdminTab(tabId) {
      this.adminTab = tabId
      if (tabId === 'whatsapp') this.loadWhatsAppMessages()
      if (tabId === 'payments' && !this.orders.length) this.loadOrders()
      if (tabId === 'staff') this.loadStaffAccounts()
    },

    async loadStaffAccounts() {
      if (!this.adminLoggedIn || !this.adminUser || this.staffLoading) return
      this.staffLoading = true
      try {
        const { data, error } = await supabase.functions.invoke('sumer-orders-dashboard', {
          body: { action: 'list_staff' }
        })
        if (error) throw error
        if (!data?.ok) throw new Error(data?.error || 'تعذر تحميل حسابات الموظفين.')
        this.staffAccounts = Array.isArray(data.staffUsers) ? data.staffUsers : []
      } catch (error) {
        console.error('SUMER staff list error:', error)
        this.adminError = error.message || 'تعذر تحميل حسابات موظفي الأوردرات.'
      } finally {
        this.staffLoading = false
      }
    },

    async createStaffAccount() {
      if (!this.adminLoggedIn || this.adminBusy) return
      this.adminBusy = true
      this.adminError = ''
      try {
        const { data, error } = await supabase.functions.invoke('sumer-orders-dashboard', {
          body: {
            action: 'create_staff',
            phone: this.staffPhone,
            password: this.staffPassword
          }
        })
        if (error) throw error
        if (!data?.ok) throw new Error(data?.error || 'تعذر إنشاء حساب الموظف.')
        this.staffPhone = ''
        this.staffPassword = ''
        this.showToast(data.mode === 'password_reset' ? 'تم تحديث كلمة مرور الموظف. استخدم كلمة المرور الجديدة في لوحة الأوردرات.' : 'تم إنشاء حساب الموظف وتفعيل صلاحية متابعة الأوردرات فقط.')
        await this.loadStaffAccounts()
      } catch (error) {
        console.error('SUMER staff create error:', error)
        this.adminError = error.message || 'تعذر إنشاء حساب الموظف.'
      } finally {
        this.adminBusy = false
      }
    },

    async removeStaffAccount(userId) {
      if (!this.adminLoggedIn || !userId) return
      if (!confirm('سيتم إيقاف صلاحية لوحة الأوردرات لهذا الحساب فقط. لن يُحذف الحساب نفسه. هل تريد المتابعة؟')) return
      this.adminError = ''
      try {
        const { data, error } = await supabase.functions.invoke('sumer-orders-dashboard', {
          body: { action: 'remove_staff', userId }
        })
        if (error) throw error
        if (!data?.ok) throw new Error(data?.error || 'تعذر إيقاف صلاحية الموظف.')
        this.staffAccounts = this.staffAccounts.filter(item => item.userId !== userId)
        this.showToast('تم إيقاف صلاحية لوحة الأوردرات لهذا الموظف.')
      } catch (error) {
        console.error('SUMER staff revoke error:', error)
        this.adminError = error.message || 'تعذر إيقاف صلاحية الموظف.'
      }
    },

    async loadWhatsAppMessages() {
      if (!this.adminLoggedIn || !this.adminUser || this.whatsappLogLoading) return
      this.whatsappLogLoading = true
      try {
        const { data, error } = await supabase
          .from('sumer_whatsapp_messages')
          .select('message_id,order_number,recipient,message_type,status,provider_timestamp,last_error,created_at')
          .order('created_at', { ascending: false })
          .limit(100)
        if (error) throw error
        this.whatsappLogRows = (data || []).map(row => ({
          messageId: row.message_id,
          orderNumber: row.order_number,
          recipient: row.recipient || '',
          messageType: row.message_type || 'other',
          status: row.status || 'unknown',
          providerTimestamp: row.provider_timestamp || '',
          lastError: row.last_error || null,
          createdAt: row.created_at || ''
        }))
      } catch (error) {
        console.error('SUMER WhatsApp log load error:', error)
        this.adminError = 'تعذر تحميل سجل واتساب. تحقق من صلاحيات المدير وجدول رسائل واتساب.'
      } finally {
        this.whatsappLogLoading = false
      }
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
          .createSignedUrl(order.paymentProofPath, 600)

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
      this.checkoutStep = 1
      if (!this.activeAreas.some(area => String(area.id) === String(this.checkout.areaId))) {
        this.checkout.areaId = ''
      }
      this.orderError = ''
    },

    continueToPayment() {
      this.orderError = ''
      if (!this.cart.length) {
        this.orderError = 'السلة فاضية. ارجع للمنيو واختار الأصناف الأول.'
        return
      }
      if (!this.checkout.name || !this.checkout.phone || !this.checkout.street) {
        this.orderError = 'من فضلك اكتب الاسم ورقم الموبايل واسم الشارع قبل المتابعة.'
        return
      }
      if (!this.selectedArea) {
        this.orderError = 'اختار منطقة التوصيل علشان نحسب السعر والوقت بشكل صحيح.'
        return
      }
      if (this.settings.cashOnDeliveryEnabled === false && this.checkout.paymentMethod === 'cash') {
        this.checkout.paymentMethod = 'vodafone'
      }
      this.checkoutStep = 2
    },

    returnToCustomerDetails() {
      this.checkoutStep = 1
      this.orderError = ''
    },

    formatDeliveryMinutes(value) {
      const minutes = Math.max(5, Math.round(Number(value) || 45))
      if (minutes < 60) return minutes + ' دقيقة'
      const hours = Math.floor(minutes / 60)
      const remainder = minutes % 60
      const hourLabel = hours === 1 ? 'ساعة' : 'ساعات'
      return hours + ' ' + hourLabel + (remainder ? ' و ' + remainder + ' دقيقة' : '')
    },

    clearPaymentProofPreview() {
      if (this.paymentProofPreviewUrl && typeof URL !== 'undefined') {
        URL.revokeObjectURL(this.paymentProofPreviewUrl)
      }
      this.paymentProofPreviewUrl = ''
    },

    handleProofUpload(event) {
      const file = event.target.files && event.target.files[0]
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
      this.orderError = ''
      this.clearPaymentProofPreview()

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
      this.paymentProofPreviewUrl = URL.createObjectURL(file)
    },

    async submitOrder() {
      if (this.sending) return

      if (this.checkoutStep !== 2) {
        this.orderError = 'راجع بيانات العميل والتوصيل أولًا.'
        return
      }

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
            building: this.checkout.building || '',
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

        this.lastOrderPhone = this.checkout.phone
        this.trackingForm.orderNumber = String(orderNumber).replace(/^#/, '').trim()
        this.trackingForm.phone = this.checkout.phone
        this.trackingOrder = null

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
        this.clearPaymentProofPreview()
        this.checkoutStep = 1
        this.checkoutOpen = false

        this.showToast('تم إرسال الطلب إلى قاعدة البيانات.')
      } catch (error) {
        console.error('SUMER order submit error:', error)
        this.orderError = 'تعذر تسجيل الطلب. تحقق من نشر create-sumer-order ومن إعدادات قاعدة البيانات وصلاحياتها.'
      } finally {
        this.sending = false
      }
    },

    openTracking(orderNumber = '') {
      if (orderNumber) {
        this.trackingForm.orderNumber = String(orderNumber).replace(/^#/, '').trim()
        this.trackingOrder = null
      }
      if (!this.trackingForm.phone && this.lastOrderPhone) {
        this.trackingForm.phone = this.lastOrderPhone
      }
      this.trackingError = ''
      this.trackingModalOpen = true
    },

    openTrackingFromConfirmation() {
      const orderNumber = this.confirmedOrder?.id || this.trackingForm.orderNumber
      this.confirmedOrder = null
      this.openTracking(orderNumber)
    },

    closeTracking() {
      this.trackingModalOpen = false
      this.trackingError = ''
    },

    async lookupOrderTracking() {
      if (this.trackingLoading) return
      const orderNumber = String(this.trackingForm.orderNumber || '').trim()
      const phone = String(this.trackingForm.phone || '').trim()
      if (!/^\d{1,18}$/.test(orderNumber) || !phone) {
        this.trackingOrder = null
        this.trackingError = 'اكتب رقم الأوردر ورقم الموبايل المسجلين وقت الطلب.'
        return
      }

      this.trackingLoading = true
      this.trackingError = ''
      try {
        const { data, error } = await supabase.functions.invoke('track-sumer-order', {
          body: { orderNumber, phone }
        })
        if (error || !data?.ok || !data?.order) {
          this.trackingOrder = null
          this.trackingError = 'مش لاقيين طلب مطابق للبيانات دي. راجع رقم الأوردر ورقم الموبايل وجرب تاني.'
          return
        }
        this.trackingOrder = data.order
        this.trackingLastRefreshAt = Date.now()
      } catch (error) {
        console.error('SUMER order tracking error:', error)
        this.trackingOrder = null
        this.trackingError = 'حصلت مشكلة أثناء متابعة الطلب. جرّب تاني بعد لحظات.'
      } finally {
        this.trackingLoading = false
      }
    },

    async refreshOrderTracking(silent = false) {
      if (!this.trackingOrder || this.trackingLoading) return
      this.trackingLoading = true
      try {
        const { data, error } = await supabase.functions.invoke('track-sumer-order', {
          body: {
            orderNumber: this.trackingForm.orderNumber,
            phone: this.trackingForm.phone
          }
        })
        if (error || !data?.ok || !data?.order) {
          if (!silent) this.trackingError = 'تعذر تحديث الحالة الآن. بيانات الطلب الحالية ما زالت ظاهرة.'
          return
        }
        this.trackingOrder = data.order
        this.trackingLastRefreshAt = Date.now()
        this.trackingError = ''
      } catch (error) {
        console.error('SUMER order tracking refresh error:', error)
        if (!silent) this.trackingError = 'تعذر تحديث الحالة الآن. حاول مرة أخرى.'
      } finally {
        this.trackingLoading = false
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
        this.adminTab = 'products'
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
      if (!this.areaForm.name || Number(this.areaForm.fee) < 0 || Number(this.areaForm.deliveryMinutes) < 5 || Number(this.areaForm.deliveryMinutes) > 360) {
        this.adminError = 'أدخل اسم المنطقة وسعر توصيل صحيح ووقت توصيل من 5 إلى 360 دقيقة.'
        return
      }

      this.adminBusy = true
      this.adminError = ''

      try {
        const payload = {
          name: String(this.areaForm.name).trim(),
          fee: Number(this.areaForm.fee) || 0,
          delivery_minutes: Math.min(360, Math.max(5, Math.round(Number(this.areaForm.deliveryMinutes) || 45))),
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
          menu_qr_enabled: false,
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
.icon-button,
.language-toggle {
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

.language-toggle {
  min-width: 66px;
  padding: 9px 12px;
  border: 1px solid var(--accent);
  border-radius: 8px;
  color: var(--accent);
  background: rgba(213, 174, 105, 0.08);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.language-toggle:hover {
  color: #171313;
  background: var(--accent);
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

.footer-menu-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 13px;
  border: 1px solid rgba(213, 174, 105, 0.6);
  border-radius: 20px;
  color: var(--accent, #d5ae69);
  font-weight: 800;
  transition: background 0.2s, color 0.2s;
}

.footer-menu-link:hover {
  color: #171313;
  background: var(--accent, #d5ae69);
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

.orders-dashboard-top-link {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 35px; padding: 7px 11px; border: 1px solid rgba(213,174,105,.6);
  border-radius: 8px; color: #f3dfbb; background: rgba(213,174,105,.08);
  text-decoration: none; font-size: 12px; font-weight: 800; white-space: nowrap;
}
.orders-dashboard-fab {
  position: fixed; z-index: 12; left: 12px;
  bottom: max(12px, env(safe-area-inset-bottom));
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; padding: 9px 14px; border: 1px solid rgba(213,174,105,.62);
  border-radius: 28px; color: #f4e5ca; background: #211b20;
  box-shadow: 0 8px 28px rgba(0,0,0,.35); text-decoration: none;
  font-size: 12px; font-weight: 900; white-space: nowrap;
}

.checkout-step { display: grid; gap: 16px; }
.checkout-step-heading {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  justify-content: space-between; margin-bottom: 3px;
}
.checkout-step-heading > strong { font-size: 16px; }
.delivery-summary-grid {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin: 8px 0 4px;
}
.delivery-summary-tile {
  display: flex; flex-direction: column; gap: 7px; padding: 13px 11px;
  border: 1px solid rgba(213, 174, 105, 0.35); border-radius: 10px;
  background: rgba(213, 174, 105, 0.06); min-width: 0;
}
.delivery-summary-tile span { color: #bca995; font-size: 11px; }
.delivery-summary-tile strong { font-size: 13px; overflow-wrap: anywhere; }
.payment-method-section { margin: 4px 0 12px; }
.payment-method-section h3 { margin: 0 0 12px; }
.payment-method-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.payment-method-option {
  display: flex !important; flex-direction: row !important; align-items: center; gap: 8px;
  padding: 12px 10px; border: 1px solid #594534; border-radius: 10px;
  background: var(--card, #241d1b); cursor: pointer; min-width: 0;
}
.payment-method-option.selected { border-color: #d5ae69; box-shadow: 0 0 0 1px rgba(213,174,105,.2); }
.payment-method-option input { flex: 0 0 auto; accent-color: #d5ae69; }
.payment-method-option > span:last-child { display: grid; gap: 4px; min-width: 0; }
.payment-method-option strong { font-size: 12px; }
.payment-method-option small { font-size: 10px; color: #bca995; }
.payment-method-icon { font-size: 18px; }
@media (max-width: 520px) {
  .delivery-summary-grid, .payment-method-options { grid-template-columns: 1fr; }
  .delivery-summary-tile { flex-direction: row; justify-content: space-between; align-items: center; }
  .payment-method-option { min-height: 54px; }
}

.payment-proof-input {
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 10px;
  border: 1px dashed #7f6245;
  border-radius: 9px;
  color: var(--text, #f7f0e8);
  background: var(--card, #241d1b);
}

.payment-proof-selection-preview {
  display: block;
  max-width: min(100%, 320px);
  max-height: 260px;
  margin-top: 10px;
  object-fit: contain;
  border: 1px solid rgba(213, 174, 105, 0.4);
  border-radius: 10px;
  background: #fff;
}

.payment-proof-admin {
  margin: 8px 0 14px;
  padding: 10px;
  border: 1px solid rgba(213, 174, 105, 0.25);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.12);
}

.payment-proof-preview-link { display: inline-block; max-width: 100%; }
.payment-proof-admin-preview {
  display: block;
  max-width: min(100%, 440px);
  max-height: 380px;
  margin-top: 10px;
  object-fit: contain;
  border: 1px solid rgba(213, 174, 105, 0.4);
  border-radius: 10px;
  background: #fff;
}

.confirm-payment-button,
.payment-confirmed-admin,
.tracking-payment-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 38px;
  padding: 9px 13px;
  border: 1px solid #147c43;
  border-radius: 9px;
  color: #fff;
  background: #138747;
  font-weight: 800;
  font-size: 12px;
}

.confirm-payment-button { cursor: pointer; }
.payment-confirmed-admin { background: #176c3d; }
.tracking-payment-card {
  display: grid;
  justify-items: start;
  gap: 7px;
  margin: 12px 0 18px;
  padding: 14px;
  border: 1px solid rgba(213, 174, 105, 0.28);
  border-radius: 12px;
  background: rgba(213, 174, 105, 0.06);
}
.tracking-payment-button {
  opacity: 1;
  cursor: default;
  border-color: #9a6b28;
  background: #8a6226;
  color: #fff;
}
.tracking-payment-button:disabled { opacity: 1; }
.tracking-payment-button.paid {
  border-color: #147c43;
  background: #138747;
}
.tracking-payment-button.rejected {
  border-color: #aa3e3e;
  background: #8c3030;
}
.tracking-payment-note { margin: 0; font-size: 12px; line-height: 1.8; }
.tracking-delivery-estimate {
  display: grid; gap: 6px; margin: 12px 0 16px; padding: 13px 15px;
  border: 1px solid rgba(213, 174, 105, 0.38); border-radius: 11px;
  background: rgba(213, 174, 105, 0.06);
}
.tracking-delivery-estimate span { font-size: 12px; color: #bca995; }
.tracking-delivery-estimate strong { font-size: 18px; color: var(--accent, #d5ae69); }
.tracking-delivery-estimate small { font-size: 10px; color: #ad9c8e; line-height: 1.7; }

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
.whatsapp-log-card {
  overflow-wrap: anywhere;
}
.whatsapp-message-details {
  margin-top: 8px;
  font-size: 12px;
}
.whatsapp-message-details summary {
  cursor: pointer;
  color: var(--accent, #d5ae69);
}
.whatsapp-message-details code {
  word-break: break-all;
}


/* Customer order tracking */
.customer-tracking-fab {
  position: fixed; z-index: 12; right: 22px;
  bottom: max(20px, env(safe-area-inset-bottom));
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 48px; padding: 11px 18px;
  border: 1px solid rgba(213, 174, 105, 0.7); border-radius: 28px;
  color: #171313; background: var(--accent, #d5ae69);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
  font-weight: 900; font-size: 13px;
}
.tracking-overlay {
  z-index: 35; align-items: center; justify-content: center;
  padding: 16px; overflow-y: auto;
}
.tracking-modal {
  width: min(560px, 100%); max-height: calc(100vh - 32px);
  overflow-y: auto; margin: auto;
  border: 1px solid rgba(213, 174, 105, 0.42); border-radius: 16px;
  padding: 22px; background: var(--bg, #171313); color: var(--text, #f7f0e8);
}
.tracking-form { display: grid; gap: 13px; }
.tracking-form label { display: grid; gap: 6px; font-size: 13px; font-weight: 700; }
.tracking-form input {
  min-width: 0; width: 100%; min-height: 43px;
  border: 1px solid #594534; border-radius: 9px; padding: 9px 12px;
  color: var(--text, #f7f0e8); background: var(--card, #241d1b);
}
.tracking-error { margin: 0; }
.tracking-result { margin-top: 20px; padding-top: 18px; border-top: 1px solid rgba(213, 174, 105, 0.25); }
.tracking-result h3 { margin: 0; }
.tracking-status-message { margin: 8px 0 14px; line-height: 1.8; }
.tracking-countdown {
  display: grid; gap: 6px; padding: 16px; margin: 12px 0 18px;
  border: 1px solid rgba(213, 174, 105, 0.55); border-radius: 12px;
  background: rgba(213, 174, 105, 0.08); text-align: center;
}
.tracking-countdown > span { font-size: 12px; opacity: 0.86; }
.tracking-countdown > strong {
  color: var(--accent, #d5ae69); font-size: clamp(18px, 4vw, 24px);
  font-variant-numeric: tabular-nums;
}
.tracking-countdown > small { opacity: 0.7; font-size: 11px; }
.tracking-countdown.overdue { border-color: #e05252; background: rgba(224, 82, 82, 0.1); }
.tracking-countdown.overdue > strong { color: #ff8585; }
.tracking-steps { display: grid; gap: 0; list-style: none; margin: 15px 0 22px; padding: 0; }
.tracking-steps li { display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 7px 0; color: #95877c; }
.tracking-steps li > span {
  display: grid; flex: 0 0 31px; place-items: center; width: 31px; height: 31px;
  border: 1px solid #685344; border-radius: 50%; font-weight: 800;
}
.tracking-steps li strong, .tracking-steps li small { display: block; }
.tracking-steps li small { font-size: 11px; opacity: 0.75; }
.tracking-steps li.active, .tracking-steps li.complete { color: var(--text, #f7f0e8); }
.tracking-steps li.active > span, .tracking-steps li.complete > span {
  border-color: var(--accent, #d5ae69); color: #171313; background: var(--accent, #d5ae69);
}
.tracking-items { padding: 13px; border: 1px solid rgba(213, 174, 105, 0.25); border-radius: 10px; background: var(--card, #241d1b); }
.tracking-items h4 { margin: 0 0 10px; }
.tracking-item-row { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px solid rgba(213, 174, 105, 0.12); }
.tracking-item-row:last-of-type { border-bottom: 0; }
.tracking-actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
.tracking-actions small { color: #ad9c8e; font-size: 11px; }
@media (max-width: 520px) {
  .customer-tracking-fab { right: 12px; bottom: max(12px, env(safe-area-inset-bottom)); min-height: 44px; padding: 9px 12px; font-size: 12px; }
  .orders-dashboard-fab { left: 12px; bottom: max(12px, env(safe-area-inset-bottom)); min-height: 44px; padding: 9px 12px; font-size: 11px; }
  .orders-dashboard-top-link { padding: 7px 8px; font-size: 11px; }
  .tracking-modal { padding: 16px; }
}
</style>
