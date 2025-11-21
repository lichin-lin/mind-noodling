import { motion } from 'motion/react'

interface EdgeProps {
  x1: number
  y1: number
  x2: number
  y2: number
  delay?: number
  stroke?: string
  strokeWidth?: number
  curved?: boolean
  pathData?: string
}

export function Edge({
  x1,
  y1,
  x2,
  y2,
  delay = 0.2,
  stroke = '#666',
  strokeWidth = 1.5,
  curved = false,
  pathData,
}: EdgeProps) {
  if (curved && pathData) {
    return (
      <motion.path
        d={pathData}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay }}
      />
    )
  }

  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={stroke}
      strokeWidth={strokeWidth}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    />
  )
}

export default Edge
