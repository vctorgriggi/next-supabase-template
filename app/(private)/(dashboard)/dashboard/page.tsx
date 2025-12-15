import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { BugAntIcon, FireIcon, MoonIcon } from '@heroicons/react/24/outline';

import { cn } from '@/lib/utils';

const stats = [
  {
    id: 1,
    name: 'Coffees consumed',
    stat: '128',
    change: '+12',
    changeType: 'increase',
    icon: FireIcon,
  },
  {
    id: 2,
    name: 'Hours of sleep lost',
    stat: '42',
    change: '+6',
    changeType: 'increase',
    icon: MoonIcon,
  },
  {
    id: 3,
    name: 'Bugs avoided (probably)',
    stat: '3',
    change: '-1',
    changeType: 'decrease',
    icon: BugAntIcon,
  },
];

export default function Dashboard() {
  return (
    <div>
      <h3 className="text-foreground text-base font-semibold">Last 30 days</h3>

      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.id}
            className="bg-background inset-ring-foreground/10 relative overflow-hidden rounded-lg px-4 pt-5 pb-12 shadow-sm inset-ring sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <item.icon aria-hidden="true" className="size-6 text-white" />
              </div>
              <p className="text-foreground/60 ml-16 truncate text-sm font-medium">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-foreground text-2xl font-semibold">
                {item.stat}
              </p>
              <p
                className={cn(
                  item.changeType === 'increase'
                    ? 'text-green-600'
                    : 'text-red-600',
                  'ml-2 flex items-baseline text-sm font-semibold',
                )}
              >
                {item.changeType === 'increase' ? (
                  <ArrowUpIcon
                    aria-hidden="true"
                    className="size-5 shrink-0 self-center text-green-500"
                  />
                ) : (
                  <ArrowDownIcon
                    aria-hidden="true"
                    className="size-5 shrink-0 self-center text-red-500"
                  />
                )}

                <span className="sr-only">
                  {' '}
                  {item.changeType === 'increase'
                    ? 'Increased'
                    : 'Decreased'}{' '}
                  by{' '}
                </span>
                {item.change}
              </p>
              <div className="absolute inset-x-0 bottom-0 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View all<span className="sr-only"> {item.name} stats</span>
                  </a>
                </div>
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
