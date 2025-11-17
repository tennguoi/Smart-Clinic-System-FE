export default function PlaceholderSection({ title }) {
  return (
    <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-500">
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-sm">Chức năng đang được phát triển. Vui lòng quay lại sau.</p>
    </div>
  );
}

