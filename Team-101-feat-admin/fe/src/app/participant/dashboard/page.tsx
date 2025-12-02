export default function DashboardPage() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600 mb-8">Manage participants and view analytics</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">0</div>
              <p className="text-gray-700 font-medium">Total Participants</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="text-4xl font-bold text-green-600 mb-2">0</div>
              <p className="text-gray-700 font-medium">Active Profiles</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="text-4xl font-bold text-purple-600 mb-2">0</div>
              <p className="text-gray-700 font-medium">QR Scans Today</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
