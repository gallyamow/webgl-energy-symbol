<template>
  <HelloWorld/>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',

  components: {
    HelloWorld
  },
}
</script>

<style>
  html, body {
    height: 100%;
    padding: 0;
    margin: 0;
  }

  body {
    background: radial-gradient(at center, #04221D, #041411);
    overflow: hidden;
  }
</style>
