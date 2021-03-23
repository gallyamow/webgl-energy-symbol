export function rand (min, max) {
  return Math.random() * (max - min) + min
}

export function scaleVectors (vectors, multiplier) {
  return vectors.map(v => ({ x: v.x * multiplier, y: v.y * multiplier }))
}

export function moveVectors (vectors, stepX, stepY) {
  return vectors.map(v => ({ x: v.x + stepX, y: v.y + stepY }))
}

export function buildCircleVectors (n) {
  const res = []

  for (let i = 0; i < n; i++) {
    const step = i / n
    const t = step * Math.PI * 2

    const x = rand(1.1, 1.3) * Math.cos(t)
    const y = rand(1.1, 1.3) * Math.sin(t)

    res.push({ x, y })
  }

  return res
}

/**
 * @param {Coords[]} coords
 * @param {Range} varianceRange
 * @return {[]}
 */
export function buildVectorsVariance (coords, varianceRange) {
  const res = []

  for (let i = 0; i < coords.length; i++) {
    const { x, y } = coords[i]
    const variance = rand(varianceRange.min, varianceRange.max)
    const vx = variance * x
    const vy = variance * y
    res.push({ x: vx, y: vy })
  }

  return res
}
