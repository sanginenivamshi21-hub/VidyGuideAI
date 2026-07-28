'use client';

import dynamic from 'next/dynamic';

const SoftAurora = dynamic(() => import('./SoftAurora'), { ssr: false });

export default function SoftAuroraWrapper({ speed, scale, brightness }: { speed?: number; scale?: number; brightness?: number }) {
  return <SoftAurora speed={speed} scale={scale} brightness={brightness} />;
}
