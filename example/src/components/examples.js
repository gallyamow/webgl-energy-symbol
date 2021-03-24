import { buildCircleVectors } from 'webgl-energy-symbol/src/utils'

export const VECTORS_CIRCLE = buildCircleVectors(31)

export const VECTORS_FAN = [
  { x: 21.5, y: 5.5 },
  { x: 23.1, y: 4.2 },
  { x: 24.3, y: 1.1 },
  { x: 28, y: -2 }, // 26.5,0
  { x: 30, y: 0 },
  { x: 26.2, y: 4 },
  { x: 24.2, y: 6.2 },
  { x: 23.7, y: 8 },
  { x: 23.8, y: 9.5 },
  { x: 25, y: 11 },
  { x: 25.5, y: 13 },
  { x: 26.1, y: 16 },
  { x: 26.9, y: 18 },
  { x: 24, y: 18 },
  { x: 23, y: 14 },
  { x: 22, y: 11.2 },
  { x: 21.1, y: 10 },
  { x: 20, y: 8.2 },
  { x: 18.7, y: 8 },
  { x: 17.7, y: 7.9 },
  { x: 14.5, y: 7.5 },
  { x: 11, y: 6 },
  { x: 7, y: 5 },
  { x: 4, y: 4 },
  { x: 0, y: 3 },
  { x: 1.5, y: 1.2 },
  { x: 4.8, y: 1.8 },
  { x: 8, y: 3 },
  { x: 11.8, y: 3.5 },
  { x: 15, y: 4.2 },
  { x: 20.1, y: 6 },
]

export const VECTORS_TREE = [
  { x: 21, y: 1 },
  { x: 23, y: 2 },
  { x: 24, y: 3.5 },
  { x: 25, y: 5 },
  { x: 26.3, y: 6.5 },
  { x: 26.5, y: 8 },
  { x: 26.1, y: 9.2 },
  { x: 26.5, y: 10.5 },
  { x: 27, y: 12.2 },
  { x: 26.2, y: 14.2 },
  { x: 24.8, y: 15.8 },
  { x: 23.2, y: 15.5 },
  { x: 22.1, y: 15.8 },
  { x: 20.9, y: 15.9 },
  { x: 19.2, y: 16 },
  { x: 17.5, y: 15.5 },
  { x: 16.2, y: 14.2 },
  { x: 15, y: 14 },
  { x: 13.8, y: 14 },
  { x: 12.1, y: 13.1 },
  { x: 11.7, y: 12.1 },
  { x: 11.9, y: 11 },
  { x: 12.3, y: 10 },
  { x: 12.5, y: 9 },
  { x: 12.4, y: 7.7 },
  { x: 13.1, y: 6.1 },
  { x: 14.1, y: 4.9 },
  { x: 15.2, y: 3.8 },
  { x: 16.9, y: 2.9 },
  { x: 18.2, y: 2.2 },
  { x: 19.8, y: 1.2 },
]
//, -20.2, -9), 40)

export const COLORS = [
  '#00E391', '#00E391',
  '#00E391', '#28FFD8',
  '#28FFD8', '#28cbff',
  '#126879', '#042824',
]

export const GRADIENTS = [
  { color1: COLORS[0], color2: COLORS[1], width: 0.8 },
  { color1: COLORS[2], color2: COLORS[3], width: 0.8 },
  { color1: COLORS[3], color2: COLORS[4], width: 0.8 },
  { color1: COLORS[5], color2: COLORS[6], width: 0.8 }
]

export const GRADIENTS_BLURRED = [
  { color1: '#00E39133', color2: '#00E39122', width: 0.6 },
  { color1: '#00E39133', color2: '#28FFD822', width: 0.6 },
]
