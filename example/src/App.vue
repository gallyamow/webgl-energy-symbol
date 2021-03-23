<template>
  <div id="app">
    <HelloWorld/>
  </div>
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
  body {
    background: grey;
    overflow: hidden;
    padding: 0;
    margin: 0;
  }
</style>
