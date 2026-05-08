export default function Loading() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="skeleton h-9 w-44 mb-2" />
        <div className="skeleton h-4 w-72" />
      </div>
      <div className="divide-y divide-white/[0.04]">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3.5">
            <div className="skeleton w-8 h-8 rounded-xl shrink-0" />
            <div className="flex-1">
              <div className="skeleton h-4 w-40 mb-1.5" />
              <div className="skeleton h-3 w-24" />
            </div>
            <div className="skeleton h-3 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
