export default function Loading() {
  return (
    <div className="border border-white/[0.07] rounded-2xl p-8 bg-[#0b0b20]">
      <div className="flex items-center gap-2 mb-6">
        <div className="skeleton w-8 h-8 rounded-lg" />
        <div className="skeleton h-4 w-16" />
      </div>
      <div className="skeleton h-7 w-48 mb-1" />
      <div className="skeleton h-4 w-72 mb-7" />
      <div className="space-y-4">
        <div>
          <div className="skeleton h-2.5 w-10 mb-2" />
          <div className="skeleton h-11 w-full" />
        </div>
        <div>
          <div className="skeleton h-2.5 w-28 mb-2" />
          <div className="skeleton h-11 w-full" />
        </div>
        <div className="skeleton h-12 w-full mt-2" />
      </div>
    </div>
  );
}
