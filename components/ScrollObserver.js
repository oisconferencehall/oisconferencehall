'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollObserver() {
  const pathname = usePathname();

  useEffect(() => {
    // Mark JS ready on document root
    document.documentElement.classList.add('js-ready');

    const selector = '.reveal, .reveal-up, .reveal-fade, .reveal-scale, .reveal-left, .reveal-right, [data-reveal]';

    const revealInViewport = () => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 200 && rect.bottom > -100) {
          el.classList.add('visible');
        }
      });
    };

    // Run immediately on page load/navigation
    revealInViewport();

    let observerInstance;
    if ('IntersectionObserver' in window) {
      const elements = document.querySelectorAll(selector);
      observerInstance = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observerInstance.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.01, rootMargin: '150px 0px 150px 0px' }
      );

      elements.forEach((el) => {
        if (!el.classList.contains('visible')) {
          observerInstance.observe(el);
        }
      });
    } else {
      // Fallback for older browsers
      document.querySelectorAll(selector).forEach((el) => el.classList.add('visible'));
    }

    // Safety fallback: Force reveal everything after 500ms so nothing can ever remain hidden
    const safetyTimer = setTimeout(() => {
      document.querySelectorAll(selector).forEach((el) => el.classList.add('visible'));
    }, 500);

    return () => {
      clearTimeout(safetyTimer);
      if (observerInstance && typeof observerInstance.disconnect === 'function') {
        observerInstance.disconnect();
      }
    };
  }, [pathname]);

  return null;
}
