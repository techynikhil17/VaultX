export default function Loading() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="skeleton h-9 w-32 mb-2" />
        <div className="skeleton h-4 w-80" />
      </div>
      <div className="flex gap-2 mb-5">
        <div className="skeleton h-10 flex-1" />
        <div className="skeleton h-10 w-36" />
        <div className="skeleton h-10 w-28" />
      </div>
      <div className="divide-y divide-white/[0.04]">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="py-4 flex items-center gap-3">
            <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
            <div className="flex-1">
              <div className="skeleton h-4 w-36 mb-2" />
              <div className="skeleton h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
