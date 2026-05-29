import AppShell from "@/components/AppShell";

export default function PostLoading() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto animate-pulse">
        <div className="h-14 bg-gray-100 mb-1" />
        <div className="aspect-square bg-gray-200" />
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
    </AppShell>
  );
}
