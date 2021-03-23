<template>
  <div class="hello">
    <Preloader
      v-if="loading"
      style="position:absolute;  left: 50%; top: 50%; transform: translate(-50%, -50%);"
    />
    <div class="container" ref="container" v-show="!loading"></div>
  </div>
</template>

<script>
import { EnergySymbolScene } from 'webgl-energy-symbol'
import Preloader from './Preloader.vue'
import { VECTORS_TREE, GRADIENTS, GRADIENTS_BLURRED } from './examples'

export default {
  components: { Preloader },

  data () {
    return {
      loading: false
    }
  },

  created () {
    /**
     * @type {EnergySymbolScene}
     */
    this.energySymbolScene = (new EnergySymbolScene(800, 600, 50, false))
    // this.energySymbolScene.addSymbol('circle',
    //   VECTORS_CIRCLE,
    //   { min: 0.4, max: 0.6 },
    //   { min: 0.98, max: 1.01 },
    //   {
    //     springStrength: 0.3,
    //     sprintDrag: 0.001,
    //     sprintRest: 0
    //   }
    // )
    this.energySymbolScene.addSymbol('tree',
      VECTORS_TREE,
      { min: 0.4, max: 0.6 },
      { min: 0.9, max: 1.1 },
      {
        springStrength: 0.3,
        sprintDrag: 0.001,
        sprintRest: 1
      },
      {
        outlineColors: GRADIENTS,
        outlineScaleRange: { min: 1, max: 1.1 },
        outlineThicknessRange: { min: 1, max: 1.4 },
        outlineRotationRange: { min: 0, max: Math.PI / 20 },
        outlineCount: 7
      },
      {
        blurredOutlineColors: GRADIENTS_BLURRED,
        blurredOutlineScaleRange: { min: 1, max: 1 },
        blurredOutlineThicknessRange: { min: 8.24, max: 9.36 },
        blurredOutlineRotationRange: { min: 0, max: Math.PI / 20 },
        blurredOutlineCount: 3
      }
    )
    // this.energySymbolScene.addSymbol('fan',
    //   VECTORS_FAN,
    //   { min: 0.4, max: 0.6 },
    //   { min: 0.98, max: 1.01 },
    //   {
    //     springStrength: 0.3,
    //     sprintDrag: 0.001,
    //     sprintRest: 0
    //   }
    // )
  },

  mounted () {
    // noinspection JSCheckFunctionSignatures
    this.energySymbolScene.render(this.$refs.container)
    this.energySymbolScene.showSymbol('tree')

    const eventTarget = this.energySymbolScene.getEventsTarget()
    eventTarget.addEventListener('ready', this.onReady)

    window.addEventListener('resize', this.onWindowResize)
  },

  destroyed () {
    this.energySymbolScene.destroy()

    window.removeEventListener('resize', this.onWindowResize)
  },

  methods: {
    onReady () {
      console.log('Are you ready? I\'m ready!')
      this.loading = false
    },

    onWindowResize () {
      this.energySymbolScene.resize(window.innerWidth, window.innerHeight)
    },
  }
}
</script>

<style scoped>
  .container {
    width: 800px;
    height: 600px;
    background: black;
  }
</style>
