<template>
<div id="app">
  <OrdersDashboard v-if="isOrdersDashboard" />
  <HelloWorld v-else />
</div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

export default {
  name: 'App',
  components: {
    // Separate page bundles: the public site and delivery dashboard are loaded independently.
    HelloWorld: defineAsyncComponent(() => import(/* webpackChunkName: "site-control" */ './components/HelloWorld.vue')),
    OrdersDashboard: defineAsyncComponent(() => import(/* webpackChunkName: "orders-dashboard" */ './components/OrdersDashboard.vue'))
  },
  computed: {
    isOrdersDashboard() {
      const params = new URLSearchParams(window.location.search)
      return params.get('panel') === 'orders' || /\/orders\/?$/.test(window.location.pathname)
    }
  }
}
</script>

<style>
html {
  scroll-behavior: smooth;
  background: #171313;
}

body {
  margin: 0;
  min-width: 320px;
}

* {
  box-sizing: border-box;
}

button,
input,
textarea,
select {
  font-family: inherit;
}
</style>
