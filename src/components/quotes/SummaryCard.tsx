export const SummaryCard = ({ summary }: { summary: string }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Resumen de la conversacion</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <p className='text-sm text-gray-600 mt-1'>{summary}</p>
        </div>
      </div>
    </div>
  )
}