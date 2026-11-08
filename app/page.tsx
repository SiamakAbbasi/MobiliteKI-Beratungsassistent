import Dashboard from "@/components/dashboard";

const dashboardViews = new Set([
  "overview",
  "discoveries",
  "news",
  "collected",
  "sources",
  "settings",
]);

export default async function Page({ searchParams }: PageProps<"/">) {
  const requestedView = (await searchParams).view;
  const view =
    typeof requestedView === "string" && dashboardViews.has(requestedView)
      ? requestedView
      : "overview";

  return <Dashboard key={view} initialPage={view} />;
}
