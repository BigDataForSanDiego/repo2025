import HomelessHeatmap from './components/HomelessHeatmap';
import { Suspense } from 'react';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-gray-900">
      <Suspense fallback={<div className="flex items-center justify-center h-screen">
        <div className="text-white text-2xl">Loading Vulnerability Atlas...</div>
      </div>}>
        <HomelessHeatmap />
      </Suspense>
    </main>
  );
}
