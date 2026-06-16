import AppShell from "@/components/AppShell";

export default function EditProfileLoading() {
  return (
    <AppShell>
      <div className="max-w-lg mx-auto animate-pulse">
        <div className="h-14 bg-gray-100 dark:bg-slate-700 border-b border-gray-100" />
        <div className="px-4 py-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-slate-700 rounded-full" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-24" />
              <div className="h-12 bg-gray-100 dark:bg-slate-700 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
