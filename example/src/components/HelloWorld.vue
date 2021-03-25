<template>
  <div class="container" ref="container">
  </div>
</template>

<script>
import { EnergySymbolScene, rand, moveVectors, scaleVectors } from 'webgl-energy-symbol'
import { VECTORS_TREE, VECTORS_FAN, VECTORS_RING, VECTORS_MICRO, GRADIENTS, GRADIENTS_BLURRED } from './symbols'

const TRANSFORMING_ENABLED = false

/**
 * @type {FigureOptions}
 */
const OPTIONS_FIGURE = {
  massRange: { min: 5.5, max: 8 },
  varianceRange: { min: -10, max: 10 },
}

/**
 * @type {OutlineOptions}
 */
const OPTIONS_OUTLINE = {
  colors: GRADIENTS,
  varianceRange: { min: -5, max: 5 },
  scaleRange: { min: 0.995, max: 1.005 },
  thicknessRange: { min: 1, max: 1.8 },
  rotationRange: { min: -Math.PI / 100, max: Math.PI / 100 },
}

/**
 * @type {OutlineOptions}
 */
const OPTIONS_BLURRED_OUTLINE = {
  colors: GRADIENTS_BLURRED,
  varianceRange: { min: -10, max: 10 },
  scaleRange: { min: 0.995, max: 1.005 },
  thicknessRange: { min: 9.24, max: 10.36 },
  rotationRange: { min: -Math.PI / 100, max: Math.PI / 100 },
}

/**
 * @type {SpringOptions}
 */
const OPTIONS_SPRING = {
  strengthRange: { min: 0.5, max: 0.7 },
  dragRange: { min: 0, max: 0 },
  restRange: { min: 2, max: 4 },
}

// moving and scaling depends on current size (30 - columns count)
const multiplier = 1 //window.innerWidth / 30
const SYMBOLS = [
  moveVectors(scaleVectors(VECTORS_TREE, multiplier), -500, -400),
  moveVectors(scaleVectors(VECTORS_RING, multiplier), -500, -400),
  moveVectors(scaleVectors(VECTORS_MICRO, multiplier), -500, -400),
  moveVectors(scaleVectors(VECTORS_FAN, multiplier), -500, -400),
]

export default {
  created () {
    /**
     * @type {EnergySymbolScene}
     */
    this.energySymbolScene = (new EnergySymbolScene(window.innerWidth, window.innerHeight, 3, false))
  },

  mounted () {
    // noinspection JSCheckFunctionSignatures
    this.energySymbolScene.render(this.$refs.container)

    this.energySymbolScene.showSymbol(
      SYMBOLS[0],
      OPTIONS_FIGURE,
      OPTIONS_SPRING,
      9,
      OPTIONS_OUTLINE,
      4,
      OPTIONS_BLURRED_OUTLINE
    )

    if (TRANSFORMING_ENABLED) {
      setInterval(() => {
        const randSymbol = SYMBOLS[Math.floor(rand(0, SYMBOLS.length))]
        this.energySymbolScene.transformSymbol(randSymbol, OPTIONS_FIGURE.varianceRange)
      }, 2000)
    }

    const eventTarget = this.energySymbolScene.getEventsTarget()
    eventTarget.addEventListener('ready', this.onReady)

    window.addEventListener('resize', this.onWindowResize)
    window.addEventListener('wheel', this.onWheel)
  },

  destroyed () {
    this.energySymbolScene.destroy()

    window.removeEventListener('resize', this.onWindowResize)
    window.removeEventListener('wheel', this.onWheel)
  },

  methods: {
    onReady () {
      console.log('Are you ready? I\'m ready!')
    },

    onWindowResize () {
      this.energySymbolScene.resize(window.innerWidth, window.innerHeight)
    },

    onWheel () {
      const randSymbol = SYMBOLS[Math.floor(rand(0, SYMBOLS.length))]
      this.energySymbolScene.transformSymbol(randSymbol, OPTIONS_FIGURE.varianceRange)
    }
  }
}
</script>

<style scoped>
  .container {
    overflow: hidden;
    height: 100%;
    /*background: url("../assets/tree-bg.png") no-repeat fixed 85% 99%;*/
    /*background-size: contain;*/
  }
</style>
