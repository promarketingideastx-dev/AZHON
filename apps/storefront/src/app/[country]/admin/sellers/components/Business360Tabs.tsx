import Link from 'next/link';

type Tab = {
  id: string;
  label: string;
};

export function Business360Tabs({
  currentTab,
  country,
  profileId,
  tabs
}: {
  currentTab: string;
  country: string;
  profileId: string;
  tabs: Tab[];
}) {
  return (
    <div className="flex overflow-x-auto border-b border-neutral-200 mb-6 pb-px custom-scrollbar">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`/${country}/admin/sellers/${profileId}?tab=${tab.id}`}
          className={`whitespace-nowrap py-3 px-5 text-sm font-bold border-b-2 transition-colors ${
            currentTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
