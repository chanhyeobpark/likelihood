export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-100 rounded w-32 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-lg border" />)}
      </div>
      <div className="h-64 bg-white rounded-lg border" />
    </div>
  );
}
