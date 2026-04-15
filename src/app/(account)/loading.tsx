export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-100 rounded w-32 mb-8" />
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded" />)}
      </div>
    </div>
  );
}
