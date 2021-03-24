<template>
  <div class="container" ref="container"></div>
</template>

<script>
import { EnergySymbolScene, rand } from 'webgl-energy-symbol'
import { VECTORS_TREE, VECTORS_FAN, VECTORS_CIRCLE, GRADIENTS, GRADIENTS_BLURRED } from './examples'

export default {
  created () {
    /**
     * @type {EnergySymbolScene}
     */
    this.energySymbolScene = (new EnergySymbolScene(1920, 1080, 50, false))
  },

  mounted () {
    const SYMBOLS = [
      [
        VECTORS_TREE,
        { min: 5, max: 8 },
        { min: -15, max: 15 },
        {
          springStrength: 0.6,
          sprintDrag: 0,
          sprintRest: 1
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
          blurredOutlineThicknessRange: { min: 8.24, max: 9.36 },
          blurredOutlineVarianceRange: { min: -15, max: 15 },
          blurredOutlineRotationRange: { min: -Math.PI / 40, max: Math.PI / 40 },
          blurredOutlineCount: 4
        }
      ],
      [
        VECTORS_CIRCLE,
        { min: 0.4, max: 0.6 },
        { min: 0.98, max: 1.01 },
        {
          springStrength: 0.3,
          sprintDrag: 0.001,
          sprintRest: 0
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
          blurredOutlineThicknessRange: { min: 8.24, max: 9.36 },
          blurredOutlineVarianceRange: { min: -15, max: 15 },
          blurredOutlineRotationRange: { min: -Math.PI / 40, max: Math.PI / 40 },
          blurredOutlineCount: 4
        }
      ],
      [
        VECTORS_FAN,
        { min: 0.4, max: 0.6 },
        { min: 0.98, max: 1.01 },
        {
          springStrength: 0.3,
          sprintDrag: 0.001,
          sprintRest: 0
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
          blurredOutlineThicknessRange: { min: 8.24, max: 9.36 },
          blurredOutlineVarianceRange: { min: -15, max: 15 },
          blurredOutlineRotationRange: { min: -Math.PI / 40, max: Math.PI / 40 },
          blurredOutlineCount: 4
        }
      ]
    ]

    // noinspection JSCheckFunctionSignatures
    this.energySymbolScene.render(this.$refs.container)
    this.energySymbolScene.showSymbol(...SYMBOLS[0])

    setInterval(() => {
      this.energySymbolScene.transformSymbol(SYMBOLS[Math.floor(rand(0, 3))][0])
    }, 2000)

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
    background: url("../assets/tree-bg.png");
    background-position: 68% 90%;
    background-repeat: no-repeat;
  }
</style>
