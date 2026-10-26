<template>
  <main class="menu-catalog" dir="rtl">
    <header class="catalog-header">
      <a class="catalog-brand" href="./" aria-label="العودة للموقع الرئيسي">
        <span class="catalog-mark">S</span>
        <span>
          <strong>{{ restaurantName }}</strong>
          <small>SYRIAN RESTAURANT</small>
        </span>
      </a>
      <a class="catalog-home-link" href="./">الموقع الرئيسي</a>
    </header>

    <section class="catalog-hero">
      <span class="catalog-eyebrow">SUMER · MENU</span>
      <h1>منيو {{ restaurantName }}</h1>
      <p>تصفّح الأصناف والصور والأسعار براحتك.</p>
      <span class="catalog-view-only">قائمة للعرض فقط — لا يوجد طلب أو دفع من هذه الصفحة</span>
    </section>

    <section class="catalog-content" aria-label="قائمة الطعام">
      <div class="catalog-controls">
        <label class="catalog-search">
          <span aria-hidden="true">⌕</span>
          <input v-model.trim="search" type="search" placeholder="ابحث عن أكلة أو مشروب..." aria-label="ابحث في المنيو" />
        </label>
        <div class="catalog-categories" aria-label="فلترة حسب القسم">
          <button
            v-for="category in categories"
            :key="category.id"
            type="button"
            :class="{ active: selectedCategory === category.id }"
            @click="selectedCategory = category.id"
          >{{ category.name }}</button>
        </div>
      </div>

      <div v-if="loading" class="catalog-state">
        <span class="catalog-loader"></span>
        <p>جاري تحميل المنيو...</p>
      </div>
      <div v-else-if="error" class="catalog-state catalog-error">
        <strong>تعذر تحميل المنيو حاليًا</strong>
        <p>{{ error }}</p>
        <button type="button" @click="loadMenu">إعادة المحاولة</button>
      </div>
      <div v-else-if="filteredProducts.length" class="catalog-grid">
        <article v-for="product in filteredProducts" :key="product.id" class="catalog-card">
          <div class="catalog-image-wrap">
            <img :src="product.image || fallbackImage" :alt="product.name" loading="lazy" @error="onImageError" />
            <span class="catalog-category-label">{{ product.category }}</span>
          </div>
          <div class="catalog-card-body">
            <h2>{{ product.name }}</h2>
            <p v-if="product.description">{{ product.description }}</p>
            <div class="catalog-price-row">
              <strong>{{ money(product.price) }}</strong>
              <span>للعرض فقط</span>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="catalog-state">
        <strong>مفيش أصناف مطابقة</strong>
        <p>جرّب كلمة بحث مختلفة أو اختار قسم تاني من المنيو.</p>
        <button type="button" @click="clearFilters">عرض كل الأصناف</button>
      </div>
    </section>

    <footer class="catalog-footer">
      <strong>{{ restaurantName }} · من قلب الشام</strong>
      <span v-if="phone">للاستفسار: {{ phone }}</span>
      <span v-if="address">{{ address }}</span>
      <small>منيو للتصفح فقط — لا يتم إنشاء طلبات من هذه الصفحة.</small>
      <a href="./">العودة للموقع الرئيسي</a>
    </footer>
  </main>
</template>

<script>
import { supabase } from '../supabase'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80'

export default {
  name: 'MenuCatalog',
  data() {
    return {
      loading: true,
      error: '',
      products: [],
      categoryRows: [],
      search: '',
      selectedCategory: 'all',
      restaurantName: 'سومر',
      currency: 'EGP',
      phone: '',
      address: '',
      fallbackImage: FALLBACK_IMAGE
    }
  },
  computed: {
    categories() {
      return [
        { id: 'all', name: 'الكل' },
        ...this.categoryRows.map(category => ({ id: category.id, name: category.name }))
      ]
    },
    filteredProducts() {
      const term = this.search.toLocaleLowerCase('ar')
      return this.products.filter(product => {
        const categoryMatches = this.selectedCategory === 'all' || product.categoryId === this.selectedCategory
        const textMatches = !term ||
          String(product.name || '').toLocaleLowerCase('ar').includes(term) ||
          String(product.description || '').toLocaleLowerCase('ar').includes(term) ||
          String(product.category || '').toLocaleLowerCase('ar').includes(term)
        return categoryMatches && textMatches
      })
    }
  },
  mounted() {
    document.title = 'المنيو | ' + this.restaurantName + ' SUMER'
    this.loadMenu()
  },
  methods: {
    async loadMenu() {
      this.loading = true
      this.error = ''
      try {
        const [productsResult, categoriesResult, settingsResult] = await Promise.all([
          supabase
            .from('products')
            .select('id,category_id,name,description,price,image_url,active,sort_order')
            .eq('active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('categories')
            .select('id,name,sort_order,active')
            .eq('active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('restaurant_settings')
            .select('restaurant_name,phone,address,currency')
            .eq('id', true)
            .maybeSingle()
        ])

        const failed = [productsResult, categoriesResult, settingsResult].find(result => result.error)
        if (failed) throw failed.error

        this.categoryRows = categoriesResult.data || []
        const categoryMap = new Map(this.categoryRows.map(category => [category.id, category.name]))
        this.products = (productsResult.data || []).map(row => ({
          id: row.id,
          categoryId: row.category_id,
          category: categoryMap.get(row.category_id) || 'بدون قسم',
          name: row.name || 'صنف',
          description: row.description || '',
          price: Number(row.price) || 0,
          image: row.image_url || ''
        }))

        const settings = settingsResult.data
        if (settings) {
          this.restaurantName = settings.restaurant_name || 'سومر'
          this.phone = settings.phone || ''
          this.address = settings.address || ''
          this.currency = settings.currency || 'EGP'
        }
        document.title = 'المنيو | ' + this.restaurantName + ' SUMER'
      } catch (error) {
        console.error('Sumer public menu load failed:', error)
        this.error = 'راجع اتصال الإنترنت وحاول مرة أخرى.'
      } finally {
        this.loading = false
      }
    },
    money(value) {
      try {
        return new Intl.NumberFormat('ar-EG', {
          style: 'currency',
          currency: this.currency || 'EGP',
          maximumFractionDigits: 2
        }).format(Number(value) || 0)
      } catch (_) {
        return (Number(value) || 0) + ' ج.م'
      }
    },
    onImageError(event) {
      if (event.target.src !== FALLBACK_IMAGE) event.target.src = FALLBACK_IMAGE
    },
    clearFilters() {
      this.search = ''
      this.selectedCategory = 'all'
    }
  }
}
</script>

<style scoped>
.menu-catalog {
  min-height: 100vh;
  color: #f8f1e8;
  background:
    radial-gradient(circle at 84% 0, rgba(151, 91, 47, .22), transparent 34rem),
    linear-gradient(160deg, #171313 0%, #211917 62%, #171313 100%);
  font-family: Arial, "Noto Sans Arabic", Tahoma, sans-serif;
}
.catalog-header {
  max-width: 1240px;
  margin: 0 auto;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid rgba(213, 174, 105, .22);
}
.catalog-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  text-decoration: none;
  color: inherit;
}
.catalog-mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: #d5ae69;
  color: #211711;
  font-size: 25px;
  font-weight: 900;
}
.catalog-brand strong, .catalog-brand small { display: block; }
.catalog-brand strong { font-size: 19px; }
.catalog-brand small { margin-top: 3px; color: #baa995; font-size: 10px; letter-spacing: .15em; }
.catalog-home-link {
  padding: 9px 13px;
  border: 1px solid rgba(213, 174, 105, .5);
  border-radius: 9px;
  color: #f1d6a5;
  text-decoration: none;
  font-size: 12px;
  font-weight: 800;
}
.catalog-hero {
  max-width: 1050px;
  margin: 0 auto;
  padding: 55px 24px 36px;
  text-align: center;
}
.catalog-eyebrow { color: #d5ae69; font-size: 11px; font-weight: 900; letter-spacing: .16em; }
.catalog-hero h1 { margin: 12px 0 10px; font-size: clamp(30px, 5vw, 48px); }
.catalog-hero p { color: #c6b8a9; margin: 0; line-height: 1.8; }
.catalog-view-only {
  display: inline-block;
  margin-top: 17px;
  padding: 8px 13px;
  border: 1px solid rgba(213, 174, 105, .27);
  border-radius: 30px;
  color: #d9c7b0;
  background: rgba(213, 174, 105, .07);
  font-size: 11px;
}
.catalog-content { max-width: 1240px; min-height: 45vh; margin: 0 auto; padding: 0 24px 55px; }
.catalog-controls { display: grid; gap: 15px; margin-bottom: 24px; }
.catalog-search {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 520px;
  width: 100%;
  min-height: 48px;
  margin: 0 auto;
  padding: 0 14px;
  border: 1px solid #554234;
  border-radius: 12px;
  background: #211a18;
  color: #d5ae69;
}
.catalog-search span { font-size: 23px; }
.catalog-search input {
  width: 100%;
  border: 0;
  outline: 0;
  color: #f8f1e8;
  background: transparent;
  font: inherit;
  font-size: 13px;
}
.catalog-categories { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.catalog-categories button {
  min-height: 36px;
  padding: 8px 14px;
  border: 1px solid #514034;
  border-radius: 20px;
  color: #d8c6b3;
  background: #211a18;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.catalog-categories button.active {
  color: #211711;
  border-color: #d5ae69;
  background: #d5ae69;
  font-weight: 900;
}
.catalog-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 19px; }
.catalog-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(213, 174, 105, .23);
  border-radius: 16px;
  background: rgba(36, 29, 27, .9);
  box-shadow: 0 14px 35px rgba(0,0,0,.14);
}
.catalog-image-wrap { position: relative; height: 225px; overflow: hidden; background: #2b211c; }
.catalog-image-wrap img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .35s ease; }
.catalog-card:hover .catalog-image-wrap img { transform: scale(1.035); }
.catalog-category-label {
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 6px 10px;
  border: 1px solid rgba(213, 174, 105, .4);
  border-radius: 30px;
  color: #f9ebd4;
  background: rgba(22, 16, 13, .84);
  font-size: 10px;
}
.catalog-card-body { padding: 16px 17px 18px; }
.catalog-card h2 { margin: 0 0 8px; font-size: 17px; }
.catalog-card p { min-height: 38px; margin: 0 0 15px; color: #bfae9e; font-size: 12px; line-height: 1.8; }
.catalog-price-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 12px; border-top: 1px solid rgba(213,174,105,.17); }
.catalog-price-row strong { color: #e8c37e; font-size: 16px; }
.catalog-price-row span { color: #897a6c; font-size: 10px; }
.catalog-state { padding: 48px 15px; text-align: center; color: #bfae9e; }
.catalog-state strong { display: block; color: #f6e8d7; font-size: 16px; }
.catalog-state p { font-size: 12px; line-height: 1.8; }
.catalog-state button {
  margin-top: 10px; padding: 9px 14px; border: 1px solid #d5ae69;
  border-radius: 8px; color: #211711; background: #d5ae69; font-weight: 800; cursor: pointer;
}
.catalog-error { color: #ffb6a6; }
.catalog-loader {
  display: inline-block; width: 28px; height: 28px; border: 3px solid #594435;
  border-top-color: #d5ae69; border-radius: 50%; animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.catalog-footer {
  display: grid;
  justify-items: center;
  gap: 9px;
  padding: 29px 20px 34px;
  border-top: 1px solid rgba(213, 174, 105, .17);
  color: #b6a28f;
  text-align: center;
  font-size: 12px;
}
.catalog-footer strong { color: #efdcbf; font-size: 14px; }
.catalog-footer small { font-size: 10px; }
.catalog-footer a { margin-top: 4px; color: #d5ae69; text-decoration: none; font-weight: 800; }
@media (max-width: 900px) { .catalog-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .catalog-image-wrap { height: 210px; } }
@media (max-width: 600px) {
  .catalog-header { padding: 13px 15px; }
  .catalog-brand strong { font-size: 16px; }
  .catalog-hero { padding: 39px 17px 27px; }
  .catalog-content { padding: 0 14px 36px; }
  .catalog-grid { gap: 11px; }
  .catalog-image-wrap { height: 145px; }
  .catalog-card-body { padding: 12px 11px 13px; }
  .catalog-card h2 { font-size: 14px; }
  .catalog-card p { min-height: 0; font-size: 10px; }
  .catalog-price-row { align-items: flex-start; flex-direction: column; gap: 5px; }
  .catalog-price-row strong { font-size: 14px; }
  .catalog-categories { justify-content: flex-start; flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; }
  .catalog-categories button { flex: 0 0 auto; }
}
</style>
