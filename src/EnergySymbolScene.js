import Two from 'two.js'
import Physics from 'physics'
import { buildVectorsVariance, rand } from './utils'

export default class EnergySymbolScene {
  /**
   * @param {number} sceneWidth
   * @param {number} sceneHeight
   * @param {number} mouseDiameter
   * @param {boolean} debugMode
   * @param noSpring
   */
  constructor (sceneWidth, sceneHeight, mouseDiameter, debugMode = true, noSpring = false) {
    this.debugMode = debugMode
    this.noSpring = noSpring
    this.rendered = false
    this.eventTarget = new EventTarget()
    this.sceneWidth = sceneWidth
    this.sceneHeight = sceneHeight
    this.mouse = null
    this.mouseDiameter = mouseDiameter * (sceneWidth / 100)
    this.touched = {}
    this.physics = new Physics()
    this.symbol = null
    this.transformingSymbol = null
    this.transformingSymbolVariance = null
    this.transformingStep = 0

    this.canvas = document.createElement('canvas')
    this.canvas.width = sceneWidth
    this.canvas.height = sceneHeight

    this.two = new Two({
      type: Two.Types['webgl'],
      fullscreen: false,
      fitted: true,
      width: sceneWidth,
      height: sceneHeight,
      domElement: this.canvas
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
    // using our canvas
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
    this.physics.play()

    // todo: throttle + move  update loop?
    this.repairTouchedTimer = setInterval(this.repairTouched.bind(this), 100)

    this.rendered = true

    return this
  }

  /**
   * @param {Coords[]} originPoints
   * @param {Coords[]} variancePoints
   * @param {FigureOptions} figureOptions
   * @param {SpringOptions} springOptions
   * @param {number} outlineCount
   * @param {OutlineOptions} outlineOptions
   * @param {number} blurredOutlineCount
   * @param {OutlineOptions} blurredOutlineOptions
   */
  showSymbol (
    originPoints,
    variancePoints,
    figureOptions,
    springOptions,
    outlineCount,
    outlineOptions,
    blurredOutlineCount,
    blurredOutlineOptions
  ) {
    const bunches = this.buildFigureBunches(
      originPoints,
      variancePoints,
      figureOptions.massRange,
      figureOptions.varianceRange,
      springOptions.strengthRange,
      springOptions.dragRange,
      springOptions.restRange
    )

    const outlines = [
      ...this.buildOutlines(
        outlineCount,
        bunches,
        outlineOptions.colors,
        outlineOptions.varianceRange,
        outlineOptions.scaleRange,
        outlineOptions.thicknessRange,
        outlineOptions.rotationRange
      ),
      ...this.buildOutlines(
        blurredOutlineCount,
        bunches,
        blurredOutlineOptions.colors,
        blurredOutlineOptions.varianceRange,
        blurredOutlineOptions.scaleRange,
        blurredOutlineOptions.thicknessRange,
        blurredOutlineOptions.rotationRange
      ),
    ]

    this.symbol = {
      bunches,
      outlines
    }

    this.renderSymbol()
  }

  /**
   * @param {Coords[]} originPoints
   * @param {Coords[]} variancePoints
   * @param {Range} varianceRange
   */
  transformSymbol (originPoints, variancePoints, varianceRange) {
    if (originPoints.length !== this.symbol.bunches.length) {
      throw Error('Both symbols must have the same number of points')
    }

    this.transformingSymbol = originPoints
    this.transformingSymbolVariance = variancePoints
    this.transformingStep = 0
  }

  /**
   * @param {number} width
   * @param {number} height
   * @return {EnergySymbolScene}
   */
  resize (width, height) {
    // TODO: throttle
    this.sceneWidth = width
    this.sceneHeight = height

    this.container.width = this.sceneWidth
    this.container.height = this.sceneHeight

    this.canvas.width = this.sceneWidth
    this.canvas.height = this.sceneHeight

    this.foreground.translation.set(this.sceneWidth / 2, this.sceneHeight / 2)
    this.background.translation.set(this.sceneWidth / 2, this.sceneHeight / 2)

    if (this.rendered) {
      this.two.update()
    }

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
   * @private
   */
  renderSymbol () {
    this.symbol.bunches.map(bunch => {
      this.foreground.add(bunch.origin.shape)
      this.foreground.add(bunch.variance.shape)
    })

    this.symbol.outlines.map(outline => {
      this.foreground.add(outline)
    })
  }

  applyTransforming (transformingSymbol, transformingSymbolVariance, step) {
    let s, d

    for (let i = 0; i < this.symbol.bunches.length; i++) {
      s = this.symbol.bunches[i].origin.position
      d = transformingSymbol[i]

      if (!s.equals(d)) {
        s.lerp(d, step)
      }

      s = this.symbol.bunches[i].variance.position
      d = transformingSymbolVariance[i]
      s.lerp(d, step)
    }
  }

  /**
   * @param {Coords[]} originPoints
   * @param {Coords[]} variancePoints
   * @param {Range} massRange
   * @param {Range} varianceRange
   * @param {Range} springStrengthRange
   * @param {Range} sprintDragRange
   * @param {Range} sprintRestRange
   * @return {ParticleBunch[]}
   *
   * @private
   */
  buildFigureBunches (originPoints, variancePoints, massRange, varianceRange, springStrengthRange, sprintDragRange, sprintRestRange) {
    const res = []

    // const varianceVectors = buildVectorsVariance(originPoints, varianceRange)

    let mass, coords

    for (let i = 0; i < originPoints.length; i++) {
      mass = rand(massRange.min, massRange.max)
      coords = originPoints[i]
      const origin = this.buildParticle(mass, coords.x, coords.y, 'red')

      mass = rand(massRange.min, massRange.max)
      coords = variancePoints[i]
      const variance = this.buildParticle(mass, coords.x, coords.y, 'green')

      const springStrength = rand(springStrengthRange.min, springStrengthRange.max)
      const sprintDrag = rand(sprintDragRange.min, sprintDragRange.max)
      const sprintRest = rand(sprintRestRange.min, sprintRestRange.max)
      const spring = this.noSpring ? null : this.physics.makeSpring(variance, origin, springStrength, sprintDrag, sprintRest)

      res.push({ origin, variance, spring })
    }

    return res
  }

  /**
   * @private
   */
  buildOutlines (count, bunches, colorsInfo, varianceRange, scaleRange, thicknessRange, rotationRange) {
    const res = []

    // TODO: rm varianceRange

    for (let i = 0; i < count; i++) {
      // выбираем случайно из origin и variance
      const randPoints = bunches.map(b => {
        return (rand(-1, 1) > 0) ? b.origin.position : b.variance.position
      })

      let randColor = colorsInfo[Math.floor(rand(0, colorsInfo.length))]

      if (!(randColor instanceof String)) {
        // it's a gradient config
        randColor = this.buildLineGradient(randColor.color1, randColor.color2, randColor.width)
      }

      const randScale = rand(scaleRange.min, scaleRange.max)
      const thickness = rand(thicknessRange.min, thicknessRange.max)
      const rotationShift = rand(rotationRange.min, rotationRange.max)

      const outline = this.buildOutline(randPoints, randColor, thickness, randScale, rotationShift)
      res.push(outline)
    }

    return res
  }

  /**
   * @private
   */
  buildOutline (coords, color, lineWidth, scale, rotation, closed = true, curved = true) {
    const line = new Two.Path(coords, closed, curved, false)

    line.stroke = color
    line.linewidth = lineWidth
    line.scale = scale // лучше не стоит
    line.rotation = rotation
    line.fill = 'transparent'
    line.curved = true

    return line
  }

  /**
   * @private
   */
  buildLineGradient (color1, color2, length) {
    const w = length * this.two.width / 2
    const h = length * this.two.height / 2

    return this.two.makeLinearGradient(
      rand(0, w),
      rand(0, h),
      rand(0, w) + rand(0, w),
      rand(0, h) + rand(0, h),
      new Two.Stop(0, color1, 1),
      new Two.Stop(1, color2, 1)
    )
  }

  /**
   * @private
   */
  buildParticle (mass, x, y, color) {
    const p = this.physics.makeParticle(mass, x, y)
    p.shape = this.two.makeCircle(p.position.x, p.position.y, 10)
    p.position = p.shape.position
    p.shape.noStroke().fill = this.debugMode ? color : 'transparent'

    return p
  }

  repairTouched () {
    // при трансформации не нуно возвращать
    if (this.transformingSymbol) {
      this.touched = {}
      return
    }

    for (let i of Object.keys(this.touched)) {
      const origin = this.symbol.bunches[i].origin
      const variance = this.symbol.bunches[i].variance

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

    if (this.transformingSymbol) {
      if (this.transformingStep >= 1) {
        this.transformingSymbol = null
        this.transformingSymbolVariance = null
        this.transformingStep = 0
        return
      }
      this.transformingStep += 0.1
      this.applyTransforming(this.transformingSymbol, this.transformingSymbolVariance, this.transformingStep)
    }

    // this.foreground.rotation += 0.001 * frameCount
  }

  /**
   * @private
   */
  onPhysicsUpdate () {
    if (!this.symbol) {
      return
    }

    for (let i = 0; i < this.symbol.bunches.length; i++) {
      const origin = this.symbol.bunches[i].origin
      const variance = this.symbol.bunches[i].variance

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

/**
 * @typedef FigureOptions
 * @type {Object}
 * @property {Range} massRange
 * @property {Range} varianceRange
 */

/**
 * @typedef SpringOptions
 * @type {Object}
 * @property {Range} strengthRange
 * @property {Range} dragRange
 * @property {Range} restRange
 */

/**
 * @typedef OutlineOptions
 * @type {Object}
 * @property {Range} colors
 * @property {Range} varianceRange
 * @property {Range} scaleRange
 * @property {Range} thicknessRange
 * @property {Range} rotationRange
 */
