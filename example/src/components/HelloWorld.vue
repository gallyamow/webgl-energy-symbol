<template>
  <div class="container" ref="container">
  </div>
</template>

<script>
import { EnergySymbolScene, rand, readSymbolPoints, scaleVectors, moveVectors } from 'webgl-energy-symbol'
import {
  SYMBOL_INFO_TREE,
  SYMBOL_INFO_RING,
  SYMBOL_INFO_FAN,
  SYMBOL_INFO_MICRO
} from './symbols'

const TRANSFORMING_ENABLED = true

/**
 * @type {FigureOptions}
 */
const OPTIONS_FIGURE = {
  massRange: { min: 10, max: 10 },
  varianceRange: { min: -10, max: 10 },
}

const OPTIONS_OUTLINE = [
  {
    color: '#09FFF0',
    thicknessRange: { min: 1, max: 1 },
    translationRange: { min: -2, max: 2 },
    scaleRange: { min: 1, max: 1 },
    rotationRange: { min: -Math.PI / 300, max: Math.PI / 300 },
  },
  {
    color: '#26FFD815',
    thicknessRange: { min: 30, max: 30 },
    translationRange: { min: -2, max: 2 },
    scaleRange: { min: 1, max: 1 },
    rotationRange: { min: -Math.PI / 300, max: Math.PI / 300 },
  },
  {
    color: '#0BF0FF',
    thicknessRange: { min: 2, max: 2 },
    translationRange: { min: -2, max: 2 },
    scaleRange: { min: 1, max: 1 },
    rotationRange: { min: -Math.PI / 300, max: Math.PI / 300 },
  },
  {
    color: '#0BF0FF',
    thicknessRange: { min: 1, max: 1 },
    translationRange: { min: -2, max: 2 },
    scaleRange: { min: 1, max: 1 },
    rotationRange: { min: -Math.PI / 300, max: Math.PI / 300 },
  },
  {
    color: '#28CBFF',
    thicknessRange: { min: 2, max: 2 },
    translationRange: { min: -2, max: 2 },
    scaleRange: { min: 1, max: 1 },
    rotationRange: { min: -Math.PI / 300, max: Math.PI / 300 },
  },
  {
    color: '#00F0FF',
    thicknessRange: { min: 2, max: 2 },
    translationRange: { min: -2, max: 2 },
    scaleRange: { min: 1, max: 1 },
    rotationRange: { min: -Math.PI / 300, max: Math.PI / 300 },
  },
  {
    color: '#26D8FF0D',
    thicknessRange: { min: 25, max: 25 },
    translationRange: { min: -2, max: 2 },
    scaleRange: { min: 1, max: 1 },
    rotationRange: { min: -Math.PI / 300, max: Math.PI / 300 },
  },
  {
    color: '#26FFD826',
    thicknessRange: { min: 15, max: 15 },
    translationRange: { min: -2, max: 2 },
    scaleRange: { min: 1, max: 1 },
    rotationRange: { min: -Math.PI / 300, max: Math.PI / 300 },
  },
  {
    color: '#0C8A73',
    thicknessRange: { min: 2, max: 2 },
    translationRange: { min: -2, max: 2 },
    scaleRange: { min: 1, max: 1 },
    rotationRange: { min: -Math.PI / 300, max: Math.PI / 300 },
  },
  {
    color: '#00C2FF0D',
    thicknessRange: { min: 25, max: 25 },
    translationRange: { min: -2, max: 2 },
    scaleRange: { min: 1, max: 1 },
    rotationRange: { min: -Math.PI / 300, max: Math.PI / 300 },
  },
  {
    color: '#4FD5FF',
    thicknessRange: { min: 1, max: 1 },
    translationRange: { min: -2, max: 2 },
    scaleRange: { min: 1, max: 1 },
    rotationRange: { min: -Math.PI / 300, max: Math.PI / 300 },
  },
]

/**
 * @type {SpringOptions}
 */
const OPTIONS_SPRING = {
  strengthRange: { min: 0.1, max: 0.3 },
  dragRange: { min: 0, max: 0 },
  restRange: { min: 1, max: 2 },
}

// moving and scaling depends on current size (30 - columns count)
const SYMBOLS_ORIGIN_POINTS = [
  moveVectors(scaleVectors(readSymbolPoints(SYMBOL_INFO_MICRO)['originPoints'], 1), 100, 0),
  moveVectors(scaleVectors(readSymbolPoints(SYMBOL_INFO_TREE)['originPoints'], 0.7), 1000, 100),
  moveVectors(scaleVectors(readSymbolPoints(SYMBOL_INFO_RING)['originPoints'], 0.8), 100, 100),
  moveVectors(scaleVectors(readSymbolPoints(SYMBOL_INFO_FAN)['originPoints'], 0.8), 1000, 100)
]
const SYMBOLS_VARIANCE_POINTS = [
  moveVectors(scaleVectors(readSymbolPoints(SYMBOL_INFO_MICRO)['variancePoints'], 1), 100, 0),
  moveVectors(scaleVectors(readSymbolPoints(SYMBOL_INFO_TREE)['variancePoints'], 0.7), 1000, 100),
  moveVectors(scaleVectors(readSymbolPoints(SYMBOL_INFO_RING)['variancePoints'], 0.8), 100, 100),
  moveVectors(scaleVectors(readSymbolPoints(SYMBOL_INFO_FAN)['variancePoints'], 0.8), 1000, 100)
]

export default {
  created () {
    /**
     * @type {EnergySymbolScene}
     */
    this.energySymbolScene = (new EnergySymbolScene(window.innerWidth, window.innerHeight, 3, false, false, false))
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
      OPTIONS_OUTLINE,
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
