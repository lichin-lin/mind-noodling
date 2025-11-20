export const BaseNode = ({ id }: { id: string }) => {
  return (
    <div className="relative flex items-center gap-2 px-3 py-1.5 pl-2 text-sm font-normal text-gray-900 transition-all bg-white border border-gray-300 rounded-lg shadow cursor-pointer w-fit hover:bg-gray-50">
      <div className="w-2 h-2 bg-gray-300 rounded-full" />
      <p className="m-0! max-w-[180px] truncate lowercase first-letter:uppercase text-sm">
        {id}
      </p>
    </div>
  )
}

export default BaseNode
