<template>
  <div class="container" ref="container"></div>
</template>

<script>
import { EnergySymbolScene, rand, moveVectors, scaleVectors } from 'webgl-energy-symbol'
import { VECTORS_TREE, VECTORS_FAN, VECTORS_CIRCLE, GRADIENTS, GRADIENTS_BLURRED } from './examples'

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
        outlineScaleRange: { min: 1, max: 1 },
        outlineThicknessRange: { min: 1, max: 1.8 },
        outlineVarianceRange: { min: -15, max: 15 },
        outlineRotationRange: { min: -Math.PI / 40, max: Math.PI / 40 },
        outlineCount: 7
      },
      {
        blurredOutlineColors: GRADIENTS_BLURRED,
        blurredOutlineScaleRange: { min: 1, max: 1 },
        blurredOutlineThicknessRange: { min: 9.24, max: 10.36 },
        blurredOutlineVarianceRange: { min: -15, max: 15 },
        blurredOutlineRotationRange: { min: -Math.PI / 40, max: Math.PI / 40 },
        blurredOutlineCount: 4
      }
    ]

    // moving and scaling depends on current size (30 - columns count)
    const multiplier = window.innerWidth / 30
    const SYMBOLS = [
      moveVectors(scaleVectors(VECTORS_TREE, 0.5 * multiplier), -9 * multiplier, -4 * multiplier),
      moveVectors(scaleVectors(VECTORS_CIRCLE, 3 * multiplier), 0, 0),
      moveVectors(scaleVectors(VECTORS_FAN, 0.5 * multiplier), -9 * multiplier, -4 * multiplier),
    ]

    // noinspection JSCheckFunctionSignatures
    this.energySymbolScene.render(this.$refs.container)
    this.energySymbolScene.showSymbol(SYMBOLS[0], ...OPTIONS)

    if (TRANSFORMING_ENABLED) {
      setInterval(() => {
        this.energySymbolScene.transformSymbol(SYMBOLS[Math.floor(rand(0, 3))])
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
    /*background: url("../assets/tree-bg.png") no-repeat fixed center center;*/
    /*background-size: contain;*/
  }
</style>
