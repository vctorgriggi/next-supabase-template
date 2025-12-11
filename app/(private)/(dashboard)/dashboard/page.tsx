const stats = [
  { name: 'Coffees consumed', stat: '128' },
  { name: 'Tabs open', stat: '47' },
  { name: 'Bugs avoided (probably)', stat: '3' },
];

export default function Dashboard() {
  return (
    <div>
      <h3 className="text-foreground text-base font-semibold">Last 30 days</h3>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm sm:p-6 dark:bg-gray-800/75 dark:inset-ring dark:inset-ring-white/10"
          >
            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              {item.name}
            </dt>
            <dd className="text-foreground mt-1 text-3xl font-semibold tracking-tight">
              {item.stat}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
