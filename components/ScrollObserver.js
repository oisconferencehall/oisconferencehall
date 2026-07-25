'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const selector = '.reveal, .reveal-up, .reveal-fade, .reveal-scale, .reveal-left, .reveal-right, [data-reveal]';

    const handleObserve = () => {
      const elements = document.querySelectorAll(selector);
      if (!elements.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.06, rootMargin: '0px 0px -30px 0px' }
      );

      elements.forEach((el) => {
        if (!el.classList.contains('visible')) {
          observer.observe(el);
        }
      });

      return observer;
    };

    let observerInstance;
    const timer = setTimeout(() => {
      observerInstance = handleObserve();
    }, 120);

    return () => {
      clearTimeout(timer);
      if (observerInstance && typeof observerInstance.disconnect === 'function') {
        observerInstance.disconnect();
      }
    };
  }, [pathname]);

  return null;
}
