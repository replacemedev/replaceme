export default function AdminIdentityLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-16 bg-slate-100 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-48 bg-slate-100 rounded-2xl" />
        <div className="h-48 bg-slate-100 rounded-2xl" />
      </div>
      <div className="h-96 bg-slate-100 rounded-2xl" />
    </div>
  );
}
