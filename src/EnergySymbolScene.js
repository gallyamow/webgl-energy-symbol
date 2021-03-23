import Two from 'two.js'
import Physics from 'physics'
import { buildVectorsVariance, rand } from './utils'

export default class EnergySymbolScene {
  /**
   * @param {number} sceneWidth
   * @param {number} sceneHeight
   * @param {boolean} debugMode
   */
  constructor (sceneWidth, sceneHeight, mouseDiameter, debugMode = true) {
    this.debugMode = debugMode
    this.eventTarget = new EventTarget()
    this.mouse = { x: 0, y: 0 }
    this.figures = {}
    this.sceneWidth = sceneWidth
    this.sceneHeight = sceneHeight
    this.mouseDiameter = mouseDiameter
    this.showedSymbol = null
    this.touched = {}

    this.physics = new Physics()

    // const canvas = document.createElement('canvas');
    // canvas.width = sceneHeight
    // canvas.width = sceneHeight

    this.two = new Two({
      type: Two.Types['webgl'],
      fullscreen: false,
      fitted: true,
      width: sceneWidth,
      height: sceneHeight,
      // domElement: canvas
    })
    this.foreground = this.two.makeGroup()
    this.background = this.two.makeGroup()
  }

  /**
   * @param {HTMLElement} container
   */
  render (container) {
    this.container = container

    this.resize(this.sceneWidth, this.sceneHeight)
    this.two.appendTo(this.container)

    this.eventTarget.dispatchEvent(new CustomEvent('ready'))
    this.container.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false)

    this.two
      .bind('resize', this.resize.bind(this))
      .bind('update', this.onTwosUpdate.bind(this))
      .play()

    this.mouse = this.physics.makeParticle(20, 0, 0)
    this.mouse.shape = this.two.makeCircle(this.mouse.position.x, this.mouse.position.y, this.mouseDiameter)
    this.mouse.position = this.mouse.shape.position
    this.mouse.shape.noStroke().fill = this.debugMode ? 'yellow' : 'transparent'
    this.background.add(this.mouse.shape)

    this.physics.onUpdate(this.onPhysicsUpdate.bind(this))

    this.repairTouchedTimer = setInterval(this.repairTouched.bind(this), 100)

    return this
  }

  /**
   * @param {string} symbolKey
   * @param {Coords[]} symbolVectors
   * @param {Range} massRange
   * @param {Range} varianceRange
   * @param springStrength
   * @param sprintDrag
   * @param sprintRest
   * @param outlineColors
   * @param outlineScaleRange
   * @param outlineThicknessRange
   * @param outlineRotationRange
   * @param outlineCount
   * @param blurredOutlineColors
   * @param blurredOutlineScaleRange
   * @param blurredOutlineThicknessRange
   * @param blurredOutlineRotationRange
   * @param blurredOutlineCount
   * @param outlineVarianceRange
   * @param blurredOutlineVarianceRange
   */
  addSymbol (
    symbolKey,
    symbolVectors,
    massRange,
    varianceRange,
    { springStrength, sprintDrag, sprintRest },
    { outlineColors, outlineVarianceRange, outlineScaleRange, outlineThicknessRange, outlineRotationRange, outlineCount },
    { blurredOutlineColors, blurredOutlineVarianceRange, blurredOutlineScaleRange, blurredOutlineThicknessRange, blurredOutlineRotationRange, blurredOutlineCount },
  ) {
    const bunches = this.buildFigureBunches(symbolVectors, massRange, varianceRange, springStrength, sprintDrag, sprintRest)

    const outlines = [
      ...this.buildOutlines(bunches, outlineColors, outlineVarianceRange, outlineScaleRange, outlineThicknessRange, outlineRotationRange, outlineCount),
      ...this.buildOutlines(bunches, blurredOutlineColors, blurredOutlineVarianceRange, blurredOutlineScaleRange, blurredOutlineThicknessRange, blurredOutlineRotationRange, blurredOutlineCount)
    ]

    this.figures[symbolKey] = {
      bunches,
      outlines
    }
  }

  /**
   * @param {string} symbolKey
   */
  showSymbol (symbolKey) {
    /**
     * @var {Figure}
     */
    const figure = this.figures[symbolKey]
    if (figure === undefined) {
      throw Error(`Undefined symbol key '${symbolKey}'`)
    }

    figure.bunches.map(bunch => {
      this.foreground.add(bunch.origin.shape)
      this.foreground.add(bunch.variance.shape)
    })

    figure.outlines.map(outline => {
      this.foreground.add(outline)
    })

    this.physics.play()

    this.showedSymbol = figure
  }

  /**
   * @param {string} symbolKey
   * @param {number} state
   */
  transformSymbol (symbolKey, state) {

  }

  /**
   * @param {number} width
   * @param {number} height
   * @return {EnergySymbolScene}
   *
   */
  resize (width, height) {
    this.sceneWidth = width
    this.sceneHeight = height

    this.foreground.translation.set(this.sceneWidth / 2, this.sceneHeight / 2)
    this.background.translation.set(this.sceneWidth / 2, this.sceneHeight / 2)

    return this
  }

  getEventsTarget () {
    return this.eventTarget
  }

  destroy () {
    clearInterval(this.repairTouchedTimer)
    this.container.removeEventListener('mousemove', this.onDocumentMouseMove.bind(this), false)
    // TODO: destroy
  }

  /**
   * @param {Coords[]} symbolVectors
   * @param {Range} massRange
   * @param {Range} varianceRange
   * @param {number} springStrength
   * @param {number} sprintDrag
   * @param {number} sprintRest
   * @return {ParticleBunch[]}
   *
   * @private
   */
  buildFigureBunches (symbolVectors, massRange, varianceRange, springStrength, sprintDrag, sprintRest) {
    const res = []

    const varianceVectors = buildVectorsVariance(symbolVectors, varianceRange)

    let mass, coords

    for (let i = 0; i < symbolVectors.length; i++) {
      mass = rand(massRange.min, massRange.max)
      coords = symbolVectors[i]
      const origin = this.buildParticle(mass, coords.x, coords.y, 'red')

      mass = rand(massRange.min, massRange.max)
      coords = varianceVectors[i]
      const variance = this.buildParticle(mass, coords.x, coords.y, 'green')

      const spring = this.physics.makeSpring(variance, origin, springStrength, sprintDrag, sprintRest)
      // const spring = null

      res.push({ origin, variance, spring })
    }

    return res
  }

  /**
   * @private
   */
  buildOutlines (bunches, colorsInfo, varianceRange, scaleRange, thicknessRange, rotationRange, count) {
    const points = bunches.map(p => p.origin.position)

    const res = []

    for (let i = 0; i < count; i++) {
      // const fixedPoints = points.map(v => {
      //   // todo: поискать готовое свойство path
      //   const cl = v.clone()
      //   cl.add(rand(varianceRange.min, varianceRange.max), rand(varianceRange.min, varianceRange.max))
      //   return cl
      // })
      //
      // fixedPoints.map((vv, kk) => {
      //   this.physics.makeSpring(vv, bunches[kk].origin, 0.5, 0, 0)
      // })

      let randColor = colorsInfo[Math.floor(rand(0, colorsInfo.length))]

      if (!(randColor instanceof String)) {
        // it's a gradient config
        randColor = this.buildLineGradient(randColor.color1, randColor.color2, randColor.width)
      }

      const randScale = rand(scaleRange.min, scaleRange.max)
      const thickness = rand(thicknessRange.min, thicknessRange.max)
      const rotationShift = rand(rotationRange.min, rotationRange.max)

      const outline = this.buildOutline(points, randColor, thickness, randScale, rotationShift)
      res.push(outline)
    }

    return res
  }

  /**
   * @private
   */
  buildOutline (coords, color, lineWidth, scale, rotation, closed = true, curved = true) {
    const line = new Two.Path(coords, closed, curved)

    line.stroke = color
    line.linewidth = lineWidth
    line.scale = scale // лучше не стоит
    line.rotation = rotation
    line.fill = 'transparent'
    line.curved = true
    line.miter = 0

    return line
  }

  /**
   * @private
   */
  buildLineGradient (color1, color2, length) {
    return this.two.makeLinearGradient(
      0,
      0,
      length,
      length,
      new Two.Stop(0, color1, 1),
      new Two.Stop(1, color2, 1)
    )
  }

  /**
   * @private
   */
  buildParticle (mass, x, y, color) {
    const p = this.physics.makeParticle(mass, x, y)
    p.shape = this.two.makeCircle(p.position.x, p.position.y, 5)
    p.position = p.shape.position
    p.shape.noStroke().fill = this.debugMode ? color : 'transparent'

    return p
  }

  repairTouched () {
    for (let i of Object.keys(this.touched)) {
      const origin = this.showedSymbol.bunches[i].origin
      const variance = this.showedSymbol.bunches[i].variance

      const b = origin
      const c = variance

      b.position.lerp(this.touched[i].originPosition, this.touched[i].step)
      c.position.lerp(this.touched[i].variancePosition, this.touched[i].step)

      this.touched[i].step += 0.1

      if (this.touched[i].step >= 1) {
        delete this.touched[i]
      }
    }
  }

  /**
   * @private
   */
  onDocumentMouseMove (event) {
    event.preventDefault()

    this.mouse.position.x = event.clientX - this.background.translation.x
    this.mouse.position.y = event.clientY - this.background.translation.y
  }

  /**
   * @private
   */
  onTwosUpdate (frameCount, timeDelta) {
    this.physics.update()
    // this.foreground.rotation += 0.001 * frameCount
  }

  /**
   * @private
   */
  onPhysicsUpdate () {
    if (!this.showedSymbol) {
      return
    }

    for (let i = 0; i < this.showedSymbol.bunches.length; i++) {
      const origin = this.showedSymbol.bunches[i].origin
      const variance = this.showedSymbol.bunches[i].variance

      const a = this.mouse
      const b = origin
      const c = variance

      // const tmp = { position: rotateCoords(two.width / 2, two.height / 2, b.position.x, b.position.y, foreground.rotation) }
      const distance = a.distanceTo(b)

      if (distance <= this.mouseDiameter) {
        if (!this.touched[i]) {
          this.touched[i] = {
            originPosition: { ...origin.position },
            variancePosition: { ...variance.position },
            step: 0
          }
        }

        const jump = (this.mouseDiameter / 2)
        const t = Math.atan2(b.position.y - a.position.y, b.position.x - a.position.x)

        b.position.x += jump * Math.cos(t)
        b.position.y += jump * Math.sin(t)
        c.position.x += jump * Math.cos(t)
        c.position.y += jump * Math.sin(t)
      }
    }
  }
}

/**
 * @typedef Coords
 * @type {Object}
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef Range
 * @type {Object}
 * @property {number} min
 * @property {number} max
 */

/**
 * @typedef ParticleBunch
 * @type {Object}
 * @property {Particle} origin
 * @property {Particle} variance
 * @property {Spring} spring
 */

/**
 * @typedef Figure
 * @type {Object}
 * @property {ParticleBunch} bunches
 * @property {*} outlines
 */
