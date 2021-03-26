<template>
  <div class="container" ref="container">
  </div>
</template>

<script>
import { EnergySymbolScene, rand, readSymbolPoints } from 'webgl-energy-symbol'
import {
  SYMBOL_INFO_TREE,
  SYMBOL_INFO_RING,
  SYMBOL_INFO_FAN,
  SYMBOL_INFO_MICRO,
  GRADIENTS,
  GRADIENTS_BLURRED
} from './symbols'

const TRANSFORMING_ENABLED = false

/**
 * @type {FigureOptions}
 */
const OPTIONS_FIGURE = {
  massRange: { min: 2, max: 15 },
  varianceRange: { min: -10, max: 10 },
}

/**
 * @type {OutlineOptions}
 */
const OPTIONS_OUTLINE = {
  colors: GRADIENTS,
  varianceRange: { min: -10, max: 10 }, // TODO: не работает
  scaleRange: { min: 0.98, max: 1.01 },
  thicknessRange: { min: 1, max: 1.8 },
  rotationRange: { min: -Math.PI / 150, max: Math.PI / 150 },
}

/**
 * @type {OutlineOptions}
 */
const OPTIONS_BLURRED_OUTLINE = {
  colors: GRADIENTS_BLURRED,
  varianceRange: { min: -10, max: 10 },
  scaleRange: { min: 0.98, max: 1.01 },
  thicknessRange: { min: 9.24, max: 15.36 },
  rotationRange: { min: -Math.PI / 150, max: Math.PI / 150 },
}

/**
 * @type {SpringOptions}
 */
const OPTIONS_SPRING = {
  strengthRange: { min: 0.01, max: 0.02 },
  dragRange: { min: 0, max: 0 },
  restRange: { min: 0, max: 1 },
}

// moving and scaling depends on current size (30 - columns count)
const SYMBOLS_ORIGIN_POINTS = [
  readSymbolPoints(SYMBOL_INFO_TREE)['originPoints'],
  readSymbolPoints(SYMBOL_INFO_RING)['originPoints'],
  readSymbolPoints(SYMBOL_INFO_FAN)['originPoints'],
  readSymbolPoints(SYMBOL_INFO_MICRO)['originPoints']
]
const SYMBOLS_VARIANCE_POINTS = [
  readSymbolPoints(SYMBOL_INFO_TREE)['variancePoints'],
  readSymbolPoints(SYMBOL_INFO_RING)['variancePoints'],
  readSymbolPoints(SYMBOL_INFO_FAN)['variancePoints'],
  readSymbolPoints(SYMBOL_INFO_MICRO)['variancePoints']
]

export default {
  created () {
    /**
     * @type {EnergySymbolScene}
     */
    this.energySymbolScene = (new EnergySymbolScene(window.innerWidth, window.innerHeight, 3, false, false))
  },

  mounted () {
    // noinspection JSCheckFunctionSignatures
    this.energySymbolScene.render(this.$refs.container)

    const originPoints = SYMBOLS_ORIGIN_POINTS[0]
    const variancePoints = SYMBOLS_VARIANCE_POINTS[0]

    this.energySymbolScene.showSymbol(
      originPoints,
      variancePoints,
      OPTIONS_FIGURE,
      OPTIONS_SPRING,
      6,
      OPTIONS_OUTLINE,
      4,
      OPTIONS_BLURRED_OUTLINE
    )

    if (TRANSFORMING_ENABLED) {
      setInterval(() => {
        this.transformToRand()
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
    transformToRand () {
      const randSymbolIndex = Math.floor(rand(0, SYMBOLS_ORIGIN_POINTS.length))
      const originPoints = SYMBOLS_ORIGIN_POINTS[randSymbolIndex]
      const variancePoints = SYMBOLS_VARIANCE_POINTS[randSymbolIndex]

      this.energySymbolScene.transformSymbol(originPoints, variancePoints, OPTIONS_FIGURE.varianceRange)
    },

    onReady () {
      console.log('Are you ready? I\'m ready!')
    },

    onWindowResize () {
      this.energySymbolScene.resize(window.innerWidth, window.innerHeight)
    },

    onWheel () {
      this.transformToRand()
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
