interface StatsProps {
  stats: {
    total: number;
    applied: number;
    inProcess: number;
    offered: number;
    rejected: number;
  };
}

export default function Stats({ stats }: StatsProps) {
  const statCards = [
    { label: 'Total', value: stats.total, icon: '📊', color: 'bg-blue-900' },
    { label: 'Applied', value: stats.applied, icon: '📝', color: 'bg-yellow-900' },
    { label: 'Interviewing', value: stats.inProcess, icon: '💬', color: 'bg-purple-900' },
    { label: 'Offers', value: stats.offered, icon: '🎉', color: 'bg-green-900' },
    { label: 'Rejected', value: stats.rejected, icon: '❌', color: 'bg-red-900' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {statCards.map((card) => (
        <div key={card.label} className={`${card.color} rounded-lg shadow p-4 text-white`}>
          <div className="text-2xl mb-2">{card.icon}</div>
          <p className="text-gray-300 text-sm">{card.label}</p>
          <p className="text-2xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
