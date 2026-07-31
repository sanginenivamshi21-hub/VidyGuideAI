'use client';

import { useEffect, useState } from 'react';

export function useAnimationsEnabled() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const el = document.documentElement;
    const update = () => {
      setEnabled(el.getAttribute('data-animations') !== 'false');
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(el, { attributes: true, attributeFilter: ['data-animations'] });
    return () => observer.disconnect();
  }, []);

  return enabled;
}
