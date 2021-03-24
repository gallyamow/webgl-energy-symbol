<template>
  <div class="container" ref="container"></div>
</template>

<script>
import { EnergySymbolScene, rand, moveVectors, scaleVectors } from 'webgl-energy-symbol'
import { VECTORS_TREE, VECTORS_FAN, VECTORS_RING, VECTORS_MICRO, GRADIENTS, GRADIENTS_BLURRED } from './examples'

const TRANSFORMING_ENABLED = true

export default {
  created () {
    /**
     * @type {EnergySymbolScene}
     */
    this.energySymbolScene = (new EnergySymbolScene(window.innerWidth, window.innerHeight, 2, false))
  },

  mounted () {
    const OPTIONS = [
      { min: 5, max: 8 },
      { min: -15, max: 15 },
      {
        springStrength: 0.6,
        sprintDrag: 0,
        sprintRest: 2
      },
      {
        outlineColors: GRADIENTS,
        outlineScaleRange: { min: 0.995, max: 1.005 },
        outlineThicknessRange: { min: 1, max: 1.8 },
        outlineVarianceRange: { min: -5, max: 5 },
        outlineRotationRange: { min: -Math.PI / 100, max: Math.PI / 100 },
        outlineCount: 7
      },
      {
        blurredOutlineColors: GRADIENTS_BLURRED,
        blurredOutlineScaleRange: { min: 0.995, max: 1.005 },
        blurredOutlineThicknessRange: { min: 9.24, max: 10.36 },
        blurredOutlineVarianceRange: { min: -10, max: 10 },
        blurredOutlineRotationRange: { min: -Math.PI / 100, max: Math.PI / 100 },
        blurredOutlineCount: 4
      }
    ]

    // moving and scaling depends on current size (30 - columns count)
    const multiplier = 1 //window.innerWidth / 30
    const SYMBOLS = [
      moveVectors(scaleVectors(VECTORS_TREE, multiplier), -500, -400),
      moveVectors(scaleVectors(VECTORS_RING, multiplier), -500, -400),
      moveVectors(scaleVectors(VECTORS_MICRO, multiplier), -500, -400),
      moveVectors(scaleVectors(VECTORS_FAN, 0.5 * multiplier), -9 * multiplier, -4 * multiplier),
    ]

    // noinspection JSCheckFunctionSignatures
    this.energySymbolScene.render(this.$refs.container)
    this.energySymbolScene.showSymbol(SYMBOLS[0], ...OPTIONS)

    if (TRANSFORMING_ENABLED) {
      setInterval(() => {
        this.energySymbolScene.transformSymbol(SYMBOLS[Math.floor(rand(0, SYMBOLS.length))])
      }, 2000)
    }

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
    },

    onWindowResize () {
      this.energySymbolScene.resize(window.innerWidth, window.innerHeight)
    },
  }
}
</script>

<style scoped>
  .container {
    overflow: hidden;
    height: 100%;
    background: url("../assets/tree-bg.png") no-repeat fixed 85% 99%;
    /*background-size: contain;*/
  }
</style>
