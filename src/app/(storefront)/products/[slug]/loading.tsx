export default function Loading() {
  return (
    <div className="container-wide py-8">
      <div className="h-3 bg-gray-100 rounded w-48 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 animate-pulse">
        <div className="aspect-[3/4] bg-gray-100 rounded" />
        <div className="space-y-4">
          <div className="h-6 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-6 bg-gray-100 rounded w-32 mt-4" />
          <div className="h-px bg-gray-100 my-6" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="flex gap-2">
              {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-100" />)}
            </div>
          </div>
          <div className="space-y-3 mt-4">
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="flex gap-2">
              {[1,2,3,4].map(i => <div key={i} className="w-12 h-10 bg-gray-100" />)}
            </div>
          </div>
          <div className="h-12 bg-gray-100 rounded mt-6" />
        </div>
      </div>
    </div>
  );
}
