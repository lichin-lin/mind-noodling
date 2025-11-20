interface BaseNodeProps {
  id: string
  variant?: 'solid' | 'outline'
  fill?: string
}

export interface NodeProps {
  id: string
  x: number
  y: number
}

export const BaseNode = ({
  id,
  variant = 'solid',
  fill = '#fff',
}: BaseNodeProps) => {
  if (variant === 'outline') {
    return (
      <rect
        width={144}
        height={48}
        fill={fill}
        stroke="#666"
        strokeDasharray="4, 4"
        rx={4}
        ry={4}
      />
    )
  }

  return (
    <div className="relative flex items-center gap-2 px-3 py-2 pl-3 font-normal text-gray-900 transition-all bg-white border border-gray-300 rounded-lg shadow cursor-pointer w-fit hover:bg-gray-50 min-w-[100px] min-h-10">
      <div className="w-3 h-3 bg-gray-300 rounded-full" />
      <p className="m-0! max-w-[180px] truncate lowercase first-letter:uppercase text-xl">
        {id}
      </p>
    </div>
  )
}

export default BaseNode
