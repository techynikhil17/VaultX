export default function Loading() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="skeleton h-9 w-44 mb-2" />
        <div className="skeleton h-4 w-96" />
      </div>
      <div className="border border-white/[0.07] rounded-2xl p-6">
        <div className="skeleton h-3 w-32 mb-3" />
        <div className="flex gap-2">
          <div className="skeleton h-11 flex-1" />
          <div className="skeleton h-11 w-24" />
        </div>
      </div>
    </div>
  );
}
