export default function Loading() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="skeleton h-9 w-32 mb-2" />
        <div className="skeleton h-4 w-60" />
      </div>
      <div className="border-b border-white/[0.05] pb-8 mb-8 space-y-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton w-5 h-5 rounded shrink-0" />
            <div>
              <div className="skeleton h-2.5 w-16 mb-1.5" />
              <div className="skeleton h-4 w-40" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-10 w-full" />
      </div>
    </div>
  );
}
