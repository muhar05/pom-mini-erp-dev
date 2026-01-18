export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="text-3xl font-bold text-red-600 mb-2">Akses Ditolak</div>
      <div className="text-gray-600 text-lg mb-4">
        Anda tidak memiliki akses ke halaman Dashboard.
      </div>
      <div className="text-gray-400">
        Silakan hubungi administrator jika Anda membutuhkan akses ke fitur ini.
      </div>
    </div>
  );
}
