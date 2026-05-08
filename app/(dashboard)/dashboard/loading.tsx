export default function Loading() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <div className="skeleton h-9 w-48 mb-2" />
        <div className="skeleton h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/[0.05] mb-10">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <div className="skeleton h-3 w-16 mb-3" />
            <div className="skeleton h-12 w-20" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 w-full" />)}
      </div>
    </div>
  );
}
