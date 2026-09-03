export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getSeverityBadgeClass = (severity) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return 'bg-rose-100 text-rose-800 border border-rose-300';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 border border-orange-300';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-800 border border-amber-300';
    case 'LOW':
      return 'bg-sky-100 text-sky-800 border border-sky-300';
    default:
      return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
  }
};
