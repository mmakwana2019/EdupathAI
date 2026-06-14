export default function ResourceCard({ resource }) {
  const open = () => window.open(resource.url, "_blank");
  return (
    <div onClick={open} className="cursor-pointer bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="font-medium text-gray-800 text-sm">{resource.title}</div>
      <div className="text-xs text-gray-400 mt-1">{resource.topic_name}</div>
      <div className="text-xs text-indigo-600 mt-1">{resource.type} · {resource.duration_min} min</div>
    </div>
  );
}