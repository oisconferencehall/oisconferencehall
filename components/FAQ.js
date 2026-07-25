'use client';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function FAQ() {
  const { t, cmsFaq } = useApp();
  const [openIndex, setOpenIndex] = useState(0);

  const defaultFaq = t.faqSection?.items || [
    { question: "What is included in the hall rental?", answer: "Our standard rental includes access to the main hall, basic AV equipment, high-speed Wi-Fi, and standard seating arrangements." },
    { question: "Can I bring my own catering service?", answer: "Yes, we allow external catering services, though we also offer premium in-house catering options." }
  ];

  const rawFaq = cmsFaq && cmsFaq.length > 0 ? cmsFaq : defaultFaq;
  const faqList = rawFaq.map((item, idx) => {
    const translatedItem = t.faqSection?.items?.[idx];
    if (translatedItem && (!item.question || item.question === "What is included in the hall rental?" || item.question === "Can I bring my own catering service?" || item.question === "Is there parking available for guests?")) {
      return { ...item, question: translatedItem.question, answer: translatedItem.answer };
    }
    return item;
  });

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section style={{ padding: '100px 24px', background: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {t.faqSection?.title} <span style={{ color: 'var(--text-accent)' }}>{t.faqSection?.titleHighlight}</span>
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqList.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div 
                key={faq.id || i} 
                style={{ 
                  background: 'var(--bg-secondary)', 
                  border: `1px solid ${isOpen ? 'var(--text-accent)' : 'var(--border)'}`, 
                  borderRadius: '16px', 
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <button 
                  onClick={() => toggle(i)}
                  style={{
                    width: '100%', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 600 }}>{faq.question}</span>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: isOpen ? '#FFDD00' : 'rgba(255,255,255,0.05)', 
                    color: isOpen ? '#000' : 'var(--text-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'all 0.3s ease'
                  }}>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </div>
                </button>
                <div style={{
                  maxHeight: isOpen ? '500px' : '0px',
                  opacity: isOpen ? 1 : 0,
                  transition: 'all 0.4s ease',
                  padding: isOpen ? '0 24px 24px 24px' : '0 24px',
                }}>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '16px', margin: 0 }}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
