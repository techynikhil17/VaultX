export default function Loading() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <div className="skeleton h-9 w-40 mb-2" />
        <div className="skeleton h-4 w-80" />
      </div>
      <div className="pb-10 border-b border-white/[0.05]">
        <div className="skeleton h-12 w-full mb-5" />
        <div className="skeleton h-24 w-full" />
      </div>
      <div className="py-10">
        <div className="skeleton h-3 w-16 mb-6" />
        <div className="skeleton h-6 w-full mb-3" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-5 w-full" />)}
        </div>
      </div>
    </div>
  );
}
