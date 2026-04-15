export default function Loading() {
  return (
    <div className="container-wide py-12">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-32 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-24 mb-8" />
        <div className="flex gap-3 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-100 rounded-full w-16" />)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] bg-gray-100 rounded mb-3" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
