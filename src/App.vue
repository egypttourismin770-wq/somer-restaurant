
<template>
<div id="app">
  <HelloWorld />
</div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
name: 'App',
components: {
  HelloWorld
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

