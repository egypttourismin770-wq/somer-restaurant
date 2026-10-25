<template>
<div id="app">
  <OrdersDashboard v-if="isOrdersDashboard" />
  <HelloWorld v-else />
</div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import OrdersDashboard from './components/OrdersDashboard.vue'

export default {
  name: 'App',
  components: {
    HelloWorld,
    OrdersDashboard
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
