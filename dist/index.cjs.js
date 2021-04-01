'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Two = _interopDefault(require('two.js'));
var Physics = _interopDefault(require('physics'));

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function readSymbolPoints(symbolDescription) {
  return {
    originPoints: symbolDescription.map(function (v) {
      return {
        x: v.x,
        y: v.y
      };
    }),
    variancePoints: symbolDescription.map(function (v) {
      return {
        x: v.sx,
        y: v.sy
      };
    })
  };
}
function scaleVectors(vectors, multiplier) {
  return vectors.map(function (v) {
    return {
      x: v.x * multiplier,
      y: v.y * multiplier
    };
  });
}
function moveVectors(vectors, stepX, stepY) {
  return vectors.map(function (v) {
    return {
      x: v.x + stepX,
      y: v.y + stepY
    };
  });
}
function buildCircleVectors(n) {
  var res = [];

  for (var i = 0; i < n; i++) {
    var step = i / n;
    var t = step * Math.PI * 2;
    var x = rand(1.1, 1.3) * Math.cos(t);
    var y = rand(1.1, 1.3) * Math.sin(t);
    res.push({
      x: x,
      y: y
    });
  }

  return res;
}

var EnergySymbolScene = /*#__PURE__*/function () {
  /**
   * @param {number} sceneWidth
   * @param {number} sceneHeight
   * @param {number} mouseDiameter
   * @param {boolean} debugMode
   * @param noSpring
   */
  function EnergySymbolScene(sceneWidth, sceneHeight, mouseDiameter) {
    var debugMode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    var noSpring = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    _classCallCheck(this, EnergySymbolScene);

    this.debugMode = debugMode;
    this.noSpring = noSpring;
    this.rendered = false;
    this.eventTarget = new EventTarget();
    this.sceneWidth = sceneWidth;
    this.sceneHeight = sceneHeight;
    this.mouse = null;
    this.mouseDiameter = mouseDiameter * (sceneWidth / 100);
    this.touched = {};
    this.physics = new Physics();
    this.symbol = null;
    this.transformingSymbol = null;
    this.transformingSymbolVariance = null;
    this.transformingStep = 0;
    this.canvas = document.createElement('canvas');
    this.canvas.width = sceneWidth;
    this.canvas.height = sceneHeight;
    this.two = new Two({
      type: Two.Types['webgl'],
      fullscreen: false,
      fitted: true,
      width: sceneWidth,
      height: sceneHeight,
      domElement: this.canvas
    });
    this.foreground = this.two.makeGroup();
    this.background = this.two.makeGroup();
  }
  /**
   * @param {HTMLElement} container
   */


  _createClass(EnergySymbolScene, [{
    key: "render",
    value: function render(container) {
      this.container = container;
      this.resize(this.sceneWidth, this.sceneHeight); // using our canvas

      this.two.appendTo(this.container);
      this.eventTarget.dispatchEvent(new CustomEvent('ready'));
      this.container.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);
      this.two.bind('resize', this.resize.bind(this)).bind('update', this.onTwosUpdate.bind(this)).play();
      this.mouse = this.physics.makeParticle(20, 0, 0);
      this.mouse.shape = this.two.makeCircle(this.mouse.position.x, this.mouse.position.y, this.mouseDiameter);
      this.mouse.position = this.mouse.shape.position;
      this.mouse.shape.noStroke().fill = this.debugMode ? 'yellow' : 'transparent';
      this.background.add(this.mouse.shape);
      this.physics.onUpdate(this.onPhysicsUpdate.bind(this));
      this.physics.play(); // todo: throttle + move  update loop?

      this.repairTouchedTimer = setInterval(this.repairTouched.bind(this), 100);
      this.rendered = true;
      return this;
    }
    /**
     * @param {Coords[]} originPoints
     * @param {Coords[]} variancePoints
     * @param {FigureOptions} figureOptions
     * @param {SpringOptions} springOptions
     * @param {OutlineOptions[]} outlineOptions
     */

  }, {
    key: "showSymbol",
    value: function showSymbol(originPoints, variancePoints, figureOptions, springOptions, outlineOptions) {
      var bunches = this.buildFigureBunches(originPoints, variancePoints, figureOptions.massRange, figureOptions.varianceRange, springOptions.strengthRange, springOptions.dragRange, springOptions.restRange);

      var outlines = _toConsumableArray(this.buildOutlines(bunches, outlineOptions));

      this.symbol = {
        bunches: bunches,
        outlines: outlines
      };
      this.renderSymbol();
    }
    /**
     * @param {Coords[]} originPoints
     * @param {Coords[]} variancePoints
     * @param {Range} varianceRange
     */

  }, {
    key: "transformSymbol",
    value: function transformSymbol(originPoints, variancePoints, varianceRange) {
      if (originPoints.length !== this.symbol.bunches.length) {
        throw Error('Both symbols must have the same number of points');
      }

      this.transformingSymbol = originPoints;
      this.transformingSymbolVariance = variancePoints;
      this.transformingStep = 0;
    }
    /**
     * @param {number} width
     * @param {number} height
     * @return {EnergySymbolScene}
     */

  }, {
    key: "resize",
    value: function resize(width, height) {
      console.log('todo handle resize', {
        width: width,
        height: height
      }); // TODO: throttle

      this.sceneWidth = width;
      this.sceneHeight = height; // this.container.width = this.sceneWidth
      // this.container.height = this.sceneHeight
      // this.canvas.width = this.sceneWidth
      // this.canvas.height = this.sceneHeight
      //
      // this.foreground.translation.set(this.sceneWidth / 2, this.sceneHeight / 2)
      // this.background.translation.set(this.sceneWidth / 2, this.sceneHeight / 2)

      if (this.rendered) ;

      return this;
    }
  }, {
    key: "getEventsTarget",
    value: function getEventsTarget() {
      return this.eventTarget;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      clearInterval(this.repairTouchedTimer);
      this.container.removeEventListener('mousemove', this.onDocumentMouseMove.bind(this), false); // TODO: destroy
    }
    /**
     * @private
     */

  }, {
    key: "renderSymbol",
    value: function renderSymbol() {
      var _this = this;

      this.symbol.bunches.map(function (bunch) {
        _this.foreground.add(bunch.origin.shape);

        _this.foreground.add(bunch.variance.shape);
      });
      this.symbol.outlines.map(function (outline) {
        _this.foreground.add(outline);
      });
    }
  }, {
    key: "applyTransforming",
    value: function applyTransforming(transformingSymbol, transformingSymbolVariance, step) {
      var s, d;

      for (var i = 0; i < this.symbol.bunches.length; i++) {
        s = this.symbol.bunches[i].origin.position;
        d = transformingSymbol[i];

        if (!s.equals(d)) {
          s.lerp(d, step);
        }

        s = this.symbol.bunches[i].variance.position;
        d = transformingSymbolVariance[i];
        s.lerp(d, step);
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

  }, {
    key: "buildFigureBunches",
    value: function buildFigureBunches(originPoints, variancePoints, massRange, varianceRange, springStrengthRange, sprintDragRange, sprintRestRange) {
      var res = [];
      var mass, coords;

      for (var i = 0; i < originPoints.length; i++) {
        mass = rand(massRange.min, massRange.max);
        coords = originPoints[i];
        var origin = this.buildParticle(mass, coords.x, coords.y, 'red');
        mass = rand(massRange.min, massRange.max);
        coords = variancePoints[i];
        var variance = this.buildParticle(mass, coords.x, coords.y, 'green');
        var springStrength = rand(springStrengthRange.min, springStrengthRange.max);
        var sprintDrag = rand(sprintDragRange.min, sprintDragRange.max);
        var sprintRest = rand(sprintRestRange.min, sprintRestRange.max);
        var spring = null;

        if (!this.noSpring) {
          spring = this.physics.makeSpring(variance, origin, springStrength, sprintDrag, sprintRest);
        }

        res.push({
          origin: origin,
          variance: variance,
          spring: spring
        });
      }

      return res;
    }
    /**
     * @private
     */

  }, {
    key: "buildOutlines",
    value: function buildOutlines(bunches, outlineOptions) {
      var res = [];

      for (var i = 0; i < outlineOptions.length; i++) {
        // выбираем случайно из origin и variance
        var randPoints = bunches.map(function (b) {
          return b.origin.position; // return b.variance.position
          // return (rand(-1, 1) > 0) ? b.origin.position : b.variance.position
        });
        var options = outlineOptions[i];
        var randScale = rand(options.scaleRange.min, options.scaleRange.max);
        var thickness = rand(options.thicknessRange.min, options.thicknessRange.max);
        var rotationShift = rand(options.rotationRange.min, options.rotationRange.max);
        var translation = new Two.Vector(rand(options.translationRange.min, options.translationRange.max), rand(options.translationRange.min, options.translationRange.max));
        var outline = this.buildOutline(randPoints, options.color, thickness, randScale, rotationShift, translation);
        res.push(outline);
      }

      return res;
    }
    /**
     * @private
     */

  }, {
    key: "buildOutline",
    value: function buildOutline(coords, color, lineWidth, scale, rotation, translation) {
      var closed = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : true;
      var curved = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : true;
      var line = new Two.Path(coords, closed, curved, false);
      line.stroke = color;
      line.linewidth = lineWidth;
      line.scale = scale; // лучше не стоит

      line.translation = new Two.Vector(rand(-10, 10), rand(-10, 10));
      line.rotation = rotation;
      line.fill = 'transparent';
      line.curved = true;
      return line;
    }
    /**
     * @private
     */

  }, {
    key: "buildLineGradient",
    value: function buildLineGradient(color1, color2, length) {
      var w = length * this.two.width / 2;
      var h = length * this.two.height / 2;
      return this.two.makeLinearGradient(rand(0, w), rand(0, h), rand(0, w) + rand(0, w), rand(0, h) + rand(0, h), new Two.Stop(0, color1, 1), new Two.Stop(1, color2, 1));
    }
    /**
     * @private
     */

  }, {
    key: "buildParticle",
    value: function buildParticle(mass, x, y, color) {
      var p = this.physics.makeParticle(mass, x, y);
      p.shape = this.two.makeCircle(p.position.x, p.position.y, mass);
      p.position = p.shape.position;
      p.shape.noStroke().fill = this.debugMode ? color : 'transparent';
      return p;
    }
  }, {
    key: "repairTouched",
    value: function repairTouched() {
      // при трансформации не нужно возвращать
      if (this.transformingSymbol) {
        this.touched = {};
        return;
      }

      for (var _i = 0, _Object$keys = Object.keys(this.touched); _i < _Object$keys.length; _i++) {
        var i = _Object$keys[_i];
        var origin = this.symbol.bunches[i].origin;
        var variance = this.symbol.bunches[i].variance;
        var b = origin;
        var c = variance;
        b.position.lerp(this.touched[i].originPosition, this.touched[i].step);
        c.position.lerp(this.touched[i].variancePosition, this.touched[i].step);
        this.touched[i].step += 0.1;

        if (this.touched[i].step >= 1) {
          delete this.touched[i];
        }
      }
    }
    /**
     * @private
     */

  }, {
    key: "onDocumentMouseMove",
    value: function onDocumentMouseMove(event) {
      event.preventDefault();
      this.mouse.position.x = event.clientX; // - this.background.translation.x

      this.mouse.position.y = event.clientY; // - this.background.translation.y
    }
    /**
     * @private
     */

  }, {
    key: "onTwosUpdate",
    value: function onTwosUpdate(frameCount, timeDelta) {
      this.physics.update();

      if (this.transformingSymbol) {
        if (this.transformingStep >= 1) {
          this.transformingSymbol = null;
          this.transformingSymbolVariance = null;
          this.transformingStep = 0;
          return;
        }

        this.transformingStep += 0.1;
        this.applyTransforming(this.transformingSymbol, this.transformingSymbolVariance, this.transformingStep);
      } // this.foreground.rotation += 0.001 * frameCount

    }
    /**
     * @private
     */

  }, {
    key: "onPhysicsUpdate",
    value: function onPhysicsUpdate() {
      if (!this.symbol) {
        return;
      }

      for (var i = 0; i < this.symbol.bunches.length; i++) {
        var origin = this.symbol.bunches[i].origin;
        var variance = this.symbol.bunches[i].variance;
        var a = this.mouse;
        var b = origin;
        var c = variance; // const tmp = { position: rotateCoords(two.width / 2, two.height / 2, b.position.x, b.position.y, foreground.rotation) }

        var distance = a.distanceTo(b);

        if (distance <= this.mouseDiameter) {
          if (!this.touched[i]) {
            this.touched[i] = {
              originPosition: origin.position.clone(),
              variancePosition: variance.position.clone(),
              step: 0
            };
          }

          var jump = this.mouseDiameter / 2;
          var t = Math.atan2(b.position.y - a.position.y, b.position.x - a.position.x);
          b.position.x += jump * Math.cos(t);
          b.position.y += jump * Math.sin(t);
          c.position.x += jump * Math.cos(t);
          c.position.y += jump * Math.sin(t);
        }
      }
    }
  }]);

  return EnergySymbolScene;
}();

exports.EnergySymbolScene = EnergySymbolScene;
exports.buildCircleVectors = buildCircleVectors;
exports.moveVectors = moveVectors;
exports.rand = rand;
exports.readSymbolPoints = readSymbolPoints;
exports.scaleVectors = scaleVectors;
