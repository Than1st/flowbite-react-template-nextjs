export default function ChecklistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative -mx-3 -mt-3 flex min-h-0 flex-1 flex-col overflow-hidden sm:-mx-4 sm:-mt-4 xl:mx-0 xl:mt-0 xl:overflow-visible">
      <div
        className="dashboard-page-bg-mobile pointer-events-none absolute inset-0 -z-10 xl:hidden"
        aria-hidden
      />
      <div
        className="dashboard-page-bg-desktop pointer-events-none absolute inset-0 -z-10 hidden xl:block"
        aria-hidden
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}