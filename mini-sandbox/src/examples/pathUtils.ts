export const generateRoundedVerticalPath = (
  from: { x: number; y: number },
  to: { x: number; y: number }
) => {
  const startX = from.x
  const startY = from.y
  const endX = to.x
  const endY = to.y

  const deltaX = endX - startX
  const absDeltaX = Math.abs(deltaX)
  const isStraight = absDeltaX < 10

  if (isStraight) {
    return `M ${startX},${startY} L ${endX},${endY}`
  }

  const cornerRadius = 12
  const verticalSplit = (startY + endY) / 2

  const verticalDown = verticalSplit - cornerRadius
  const verticalUp = verticalSplit + cornerRadius

  const directionX = deltaX > 0 ? 1 : -1
  const horizontalLength = absDeltaX - cornerRadius * 2

  return `
    M ${startX},${startY}
    L ${startX},${verticalDown}
    A ${cornerRadius},${cornerRadius} 0 0 ${directionX > 0 ? 0 : 1} ${
    startX + directionX * cornerRadius
  },${verticalSplit}
    L ${
      startX + directionX * (cornerRadius + horizontalLength)
    },${verticalSplit}
    A ${cornerRadius},${cornerRadius} 0 0 ${
    directionX > 0 ? 1 : 0
  } ${endX},${verticalUp}
    L ${endX},${endY}
  `
    .trim()
    .replace(/\s+/g, ' ')
}
