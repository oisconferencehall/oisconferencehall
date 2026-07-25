'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { formatPrice } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import Typewriter from '@/components/Typewriter';
import Feedbacks from '@/components/Feedbacks';
import Partners from '@/components/Partners';
import Cases from '@/components/Cases';
import Contacts from '@/components/Contacts';
import FAQ from '@/components/FAQ';
import Hero from '@/components/Hero';
import OurHalls from '@/components/OurHalls';
import AdvantagesSection from '@/components/AdvantagesSection';
import RentCTASection from '@/components/RentCTASection';
import YellowShapeBanner from '@/components/YellowShapeBanner';
import AppPromoBanner from '@/components/AppPromoBanner';
import {
  ArrowRight, Star, Users, CalendarDays, Wifi, Monitor,
  Volume2, Wind, ParkingCircle, Utensils, Shield, PhoneCall,
  ChevronRight, Play, CheckCircle, MapPin, Clock, Calendar,
} from 'lucide-react';
import { HALL_INFO } from '@/lib/data';

const amenityIcons = {
  wifi: Wifi, projector: Monitor, sound: Volume2,
  ac: Wind, parking: ParkingCircle, catering: Utensils,
  security: Shield, reception: PhoneCall,
};

const amenityDescriptions = {
  uz: {
    wifi: "Gigabit-tezlikdagi maxsus simsiz tarmoq butun tadbiringizni uzilishlarsiz onlayn ushlab turadi.",
    projector: "Kino darajasidagi 4K proyeksiyalash va ajoyib vizual taqdimotlar uchun o'ta yorqin ekranlar.",
    sound: "Atrofni o'rab oluvchi Dolby ovoz tizimi, professional mikrofonlar va akustik izolyatsiya.",
    ac: "Odamlar sonidan qat'i nazar mukammal haroratni ta'minlaydigan aqlli iqlim nazorati tizimi.",
    parking: "300 tagacha avtomobilga mo'ljallangan keng, xavfsiz va bepul yerosti avtoturargohi.",
    catering: "Yuqori darajadagi oshpazlar tomonidan tayyorlanadigan to'liq moslashtiriladigan menyularga ega premium keytering xizmatlari.",
    security: "To'liq xotirjamlik uchun 24/7 professional xavfsizlik xodimlari va zamonaviy kuzatuv tizimi.",
    reception: "Barcha VIP mehmonlaringizni kutib olish va yo'naltirish uchun maxsus konsyerj va qabulxona xodimlari."
  },
  ru: {
    wifi: "Выделенное беспроводное соединение гигабитной скорости, обеспечивающее бесперебойную онлайн-трансляцию вашего мероприятия.",
    projector: "4K-проекторы кинематографического уровня и ультраяркие экраны для впечатляющих визуальных презентаций.",
    sound: "Иммерсивный объемный звук Dolby с профессиональными микрофонами и акустической изоляцией.",
    ac: "Умная система климат-контроля, обеспечивающая идеальную температуру независимо от количества людей.",
    parking: "Просторная, охраняемая и бесплатная подземная парковка, вмещающая до 300 автомобилей.",
    catering: "Премиальные услуги кейтеринга с полностью настраиваемым меню от шеф-поваров высшего класса.",
    security: "Круглосуточная профессиональная служба безопасности и передовые системы наблюдения для полного спокойствия.",
    reception: "Специальный консьерж и персонал стойки регистрации для элегантной встречи и сопровождения всех ваших VIP-гостей."
  },
  en: {
    wifi: "Gigabit-speed dedicated wireless connection keeping your entire event online without interruptions.",
    projector: "Cinema-grade 4K projection mapping and ultra-bright screens for spectacular visual presentations.",
    sound: "Immersive Dolby surround sound with professional-grade microphones and acoustic isolation.",
    ac: "Smart climate control system that ensures the perfect temperature regardless of the crowd size.",
    parking: "Spacious, secure, and free underground parking accommodating up to 300 vehicles.",
    catering: "Premium catering services offering fully customizable menus crafted by top-tier executive chefs.",
    security: "24/7 on-site professional security personnel and advanced surveillance for total peace of mind.",
    reception: "Dedicated concierge and reception staff to elegantly welcome and guide all your VIP guests."
  }
};

const extendedDetails = {
  uz: {
    wifi: "Bizning korporativ tarmog'imizda optik tolali ulanishlar, Wi-Fi 6 texnologiyasi va striming, virtual konferensiyalar hamda yuzlab foydalanuvchilar bir vaqtda kechikishlarsiz ishlashi uchun maxsus o'tkazuvchanlik qobiliyati mavjud.",
    projector: "Bir nechta 20,000 lyumenli 4K lazer proyektorlari va motorli ekranlar bilan jihozlangan. Biz kirishlarni uzluksiz almashtirish, PIP (ekran ichida ekran) imkoniyatlari va tadbiringiz davomida maxsus texnik yordamni taqdim etamiz.",
    sound: "Zalning akustik ishlovi mukammal tiniqlikni ta'minlaydi. Tizim line-array karnaylari, sabvuferlar va raqamli miksher pultini o'z ichiga oladi. Simsiz yoqa va quloqchin mikrofonlari kiritilgan.",
    ac: "Bizning HVAC tizimimiz HEPA filtrlash va ovozsiz ishlash xususiyatiga ega. Harorat zonalar bo'yicha boshqarilishi mumkin va bizning xodimlarimiz tomonidan xonadagi odamlar soni hamda sizning xohishlaringizga darhol javob berish uchun masofadan turib nazorat qilinadi.",
    parking: "VIP avtoturargoh joylari kirish eshigi yaqinida mavjud. Bino avtomobil raqamini aniqlash va konferensiya zali foyesiga to'g'ridan-to'g'ri lift orqali chiqish imkoniyatiga ega bo'lgan to'liq xavfsiz majmuadir.",
    catering: "Qahva-breyklardan tortib, 5 xil taomli gala kechki ovqatlarigacha. Biz barcha parhez talablarini (vegan, halol, glyutensiz) qondiramiz va bejirim idish-tovoqlar hamda professional ofitsiantlarni taqdim etamiz.",
    security: "Kirishni nazorat qilish tizimlari, asosiy kirish joylarida metall detektorlar va so'rov bo'yicha fuqaro kiyimidagi ehtiyotkor xavfsizlik xodimlari mavjud. Biz yuqori darajadagi mehmonlar uchun xavfsiz muhitni kafolatlaymiz.",
    reception: "Bizning ko'p tilli xodimlarimiz mehmonlarni ro'yxatga olish, kiyim saqlash xizmatlari va VIP kuzatuvni amalga oshiradi. Qabulxonadagi raqamli belgilar tadbiringiz brendiga to'liq moslashtirilishi mumkin."
  },
  ru: {
    wifi: "Наша сеть корпоративного уровня включает резервные оптоволоконные соединения, технологию Wi-Fi 6 и выделенную пропускную способность для потоковой передачи, виртуальных конференций и сотен одновременных пользователей без задержек.",
    projector: "Оснащен несколькими лазерными 4K проекторами яркостью 20 000 люмен и моторизованными экранами. Мы обеспечиваем плавное переключение между входами, возможности PIP и специальную техническую поддержку на протяжении всего мероприятия.",
    sound: "Акустическая обработка зала обеспечивает идеальную четкость. Система включает линейные массивы, сабвуферы и цифровую микшерную консоль. В комплект входят беспроводные петличные и ручные микрофоны.",
    ac: "Наша система HVAC оснащена фильтрацией HEPA и бесшумной работой. Температуру можно зонировать и контролировать удаленно нашим персоналом, чтобы мгновенно реагировать на количество людей в помещении и ваши предпочтения.",
    parking: "VIP парковочные места доступны возле входа. Объект полностью безопасен, оснащен системой распознавания номерных знаков и прямым доступом на лифте в вестибюль конференц-зала.",
    catering: "От кофе-брейков с ремесленной выпечкой до гала-ужинов из 5 блюд. Мы учитываем все диетические требования (веганские, халяльные, безглютеновые) и предоставляем элегантную посуду и профессиональных официантов.",
    security: "Системы контроля доступа, металлодетекторы на главных входах и незаметная охрана в штатском по запросу. Мы обеспечиваем безопасную среду для высокопоставленных гостей.",
    reception: "Наш многоязычный персонал занимается регистрацией гостей, услугами гардероба и сопровождением VIP-персон. Цифровые вывески на стойке регистрации можно полностью настроить в соответствии с брендингом вашего мероприятия."
  },
  en: {
    wifi: "Our enterprise-grade network features redundant fiber connections, Wi-Fi 6 technology, and dedicated bandwidth for streaming, virtual conferences, and hundreds of concurrent users without latency.",
    projector: "Equipped with multiple 20,000 lumen 4K laser projectors and motorized screens. We provide seamless switching between inputs, PIP capabilities, and dedicated technical support throughout your event.",
    sound: "The acoustic treatment of the hall ensures perfect clarity. The system includes line array speakers, subwoofers, and a digital mixing console. Wireless lapel and handheld microphones are included.",
    ac: "Our HVAC system features HEPA filtration and silent operation. The temperature can be zoned and controlled remotely by our staff to respond instantly to the room's occupancy and your preferences.",
    parking: "VIP parking slots are available near the entrance. The facility is fully secure with license plate recognition and direct elevator access to the conference hall lobby.",
    catering: "From coffee breaks with artisanal pastries to 5-course gala dinners. We cater to all dietary requirements (vegan, halal, gluten-free) and provide elegant tableware and professional waitstaff.",
    security: "Access control systems, metal detectors at main entrances, and discreet plainclothes security available upon request. We ensure a safe environment for high-profile guests.",
    reception: "Our multilingual staff handles guest registration, cloakroom services, and VIP ushering. Digital signage at the reception can be fully customized with your event branding."
  }
};

const glowColors = [
  'rgba(56, 189, 248, 0.6)', // cyan
  'rgba(139, 92, 246, 0.6)', // purple
  'rgba(16, 185, 129, 0.6)', // green
  'rgba(244, 63, 94, 0.6)',  // rose
  'rgba(255, 221, 0, 0.6)',  // amber
  'rgba(99, 102, 241, 0.6)', // indigo
  'rgba(236, 72, 153, 0.6)', // pink
  'rgba(20, 184, 166, 0.6)'  // teal
];

function useReveal(threshold = 0.12, repeat = false) {
  const [ref, setRef] = useState(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref) return;
    const ob = new IntersectionObserver(([e]) => { 
      if (e.isIntersecting) { 
        setVisible(true); 
        if (!repeat) ob.unobserve(ref); 
      } else if (repeat) {
        setVisible(false);
      }
    }, { threshold });
    ob.observe(ref);
    return () => ob.disconnect();
  }, [ref, threshold, repeat]);
  return { ref: setRef, visible };
}

function useCountUp(target, duration = 1600, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let t0 = null;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(e * target));
      if (p < 1) requestAnimationFrame(tick);
      else setVal(target);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return val;
}

function AnimatedAmenity({ amenityKey, index, Icon, title, glowColor }) {
  const { ref, visible } = useReveal(0.15, true);
  const { lang, t } = useApp();
  const isLeft = index % 2 === 0;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const extendedDetails = {
    wifi: "Our enterprise-grade network features redundant fiber connections, Wi-Fi 6 technology, and dedicated bandwidth for streaming, virtual conferences, and hundreds of concurrent users without latency.",
    projector: "Equipped with multiple 20,000 lumen 4K laser projectors and motorized screens. We provide seamless switching between inputs, PIP capabilities, and dedicated technical support throughout your event.",
    sound: "The acoustic treatment of the hall ensures perfect clarity. The system includes line array speakers, subwoofers, and a digital mixing console. Wireless lapel and handheld microphones are included.",
    ac: "Our HVAC system features HEPA filtration and silent operation. The temperature can be zoned and controlled remotely by our staff to respond instantly to the room's occupancy and your preferences.",
    parking: "VIP parking slots are available near the entrance. The facility is fully secure with license plate recognition and direct elevator access to the conference hall lobby.",
    catering: "From coffee breaks with artisanal pastries to 5-course gala dinners. We cater to all dietary requirements (vegan, halal, gluten-free) and provide elegant tableware and professional waitstaff.",
    security: "Access control systems, metal detectors at main entrances, and discreet plainclothes security available upon request. We ensure a safe environment for high-profile guests.",
    reception: "Our multilingual staff handles guest registration, cloakroom services, and VIP ushering. Digital signage at the reception can be fully customized with your event branding."
  };

  return (
    <>
      <div ref={ref}
        className={`${isLeft ? 'reveal-book-left' : 'reveal-book-right'} ${visible ? 'visible' : ''}`}
      >
        <div style={{
          padding: '36px 32px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-card)',
          height: '100%',
          zIndex: 1,
        }}
          onClick={() => setIsModalOpen(true)}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.borderColor = glowColor.replace('0.6', '0.4');
            e.currentTarget.style.boxShadow = `0 12px 30px ${glowColor.replace('0.6', '0.1')}`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
          }}
        >

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              width: '50px', height: '50px',
              background: 'var(--bg-secondary)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)',
            }}>
              {Icon && <Icon size={24} />}
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {title}
            </div>
          </div>
          
          <div style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px', flexGrow: 1 }}>
            {amenityDescriptions[lang]?.[amenityKey] || amenityDescriptions.en[amenityKey]}
          </div>

          <div style={{ display: 'inline-flex', alignSelf: 'flex-start' }}>
            <div style={{
              padding: '8px 16px',
              background: 'var(--bg-secondary)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border)',
              borderRadius: '100px',
              fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <span>+</span> {t.misc?.readMore || '+ Read More'}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute', top: '24px', right: '24px',
                background: 'var(--bg-secondary)', border: 'none',
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-primary)'
              }}
            >
              ✕
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '56px', height: '56px',
                background: 'rgba(255, 221, 0, 0.1)',
                border: '1px solid rgba(255, 221, 0, 0.3)',
                borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-accent)',
              }}>
                {Icon && <Icon size={28} />}
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</h2>
            </div>
            <p style={{ fontSize: '16px', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '16px', fontWeight: 600 }}>
              {amenityDescriptions[lang]?.[amenityKey] || amenityDescriptions.en[amenityKey]}
            </p>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '32px' }}>
              {extendedDetails[lang]?.[amenityKey] || extendedDetails.en[amenityKey]}
            </p>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(false)} style={{ width: '100%', justifyContent: 'center' }}>
              {t.misc?.close || 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ label, value, suffix = '', prefix = '', active, delay }) {
  const num = useCountUp(value, 1600, active);
  const { ref, visible } = useReveal(0.3);
  return (
    <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`} style={{ transitionDelay: delay }}>
      <div style={{
        textAlign: 'center', padding: '32px 20px', background: 'var(--bg-card)',
        border: '1px solid var(--border)', borderRadius: '20px', backdropFilter: 'blur(12px)',
        transition: 'all 0.3s ease', cursor: 'default',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255, 221, 0, 0.35)'; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <div style={{
          fontSize: '44px', fontWeight: 900, lineHeight: 1,
          backgroundImage: 'linear-gradient(135deg, var(--text-primary), var(--text-accent))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '8px',
        }}>
          {prefix}{active ? num : 0}{suffix}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      </div>
    </div>
  );
}

function Orb({ style }) {
  return (
    <div style={{
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(60px)',
      pointerEvents: 'none',
      ...style,
    }} />
  );
}

function FloatingParticles() {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    // Generate 40 random glowing yellow particles
    const newParticles = Array.from({ length: 40 }).map((_, i) => {
      const types = ['particleFloat1', 'particleFloat2', 'particleFloat3'];
      return {
        id: i,
        left: Math.random() * 100 + '%',
        size: Math.random() * 5 + 2 + 'px',
        dur: Math.random() * 15 + 10 + 's', // Slow float
        delay: Math.random() * -20 + 's', // Negative delay so they are already on screen
        tx: (Math.random() * 200 - 100) + 'px',
        opacity: Math.random() * 0.6 + 0.2,
        anim: types[Math.floor(Math.random() * types.length)]
      };
    });
    setParticles(newParticles);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1, pointerEvents: 'none' }}>
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          left: p.left,
          bottom: '-5%',
          width: p.size,
          height: p.size,
          background: '#FFDD00',
          boxShadow: '0 0 10px #FFDD00, 0 0 20px #FFDD00',
          animationName: p.anim,
          '--start-opacity': p.opacity,
          '--dur': p.dur,
          '--delay': p.delay,
          '--tx': p.tx
        }} />
      ))}
    </div>
  );
}

function PricingCard({ plan, t, index, revealed }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const delay = index * 0.22;

  const handleMouseMove = (e) => {
    if (!revealed) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translateY(-8px) scale(1.02)`;
  };
  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (card) card.style.transform = '';
    setHovered(false);
  };

  return (
    <div
      className={`pricing-reveal ${revealed ? 'visible' : ''}`}
      style={{ position: 'relative', animationDelay: `${delay}s` }}
    >
      {/* "Best Value" badge */}
      {plan.popular && (
        <div className="pricing-badge-popular" style={{
          position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #FFDD00, #FFDD00)',
          color: '#1a0800', fontSize: '11px', fontWeight: 800,
          padding: '4px 16px', borderRadius: '9999px',
          letterSpacing: '0.07em', textTransform: 'uppercase',
          whiteSpace: 'nowrap', zIndex: 10,
        }}>{t.misc?.bestValue || '⭐ Best Value'}</div>
      )}

      <div
        ref={cardRef}
        className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}
        style={{
          background: plan.popular
            ? 'linear-gradient(135deg, rgba(255, 221, 0,0.1), rgba(79,70,229,0.04))'
            : 'var(--bg-primary)',
          border: plan.popular ? '1.5px solid rgba(255, 221, 0,0.35)' : '1px solid var(--border)',
          boxShadow: plan.popular
            ? '0 0 40px rgba(255, 221, 0,0.12), 0 0 0 1px rgba(255, 221, 0,0.08)'
            : '0 4px 20px rgba(0,0,0,0.03)',
          transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease, border-color 0.35s ease',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Glow orb inside popular card */}
        {plan.popular && (
          <div style={{
            position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 221, 0,0.3) 0%, transparent 70%)',
            filter: 'blur(20px)', pointerEvents: 'none', animation: 'glowPulse 2.5s ease-in-out infinite',
          }} />
        )}

        <div className="pricing-content-fade" style={{ transitionDelay: `${delay + 0.15}s` }}>
          {/* Icon */}
          <div style={{
            fontSize: '36px', marginBottom: '16px', display: 'flex', justifyContent: 'center',
            color: plan.popular ? '#FFDD00' : 'var(--text-primary)',
            transition: 'transform 0.3s ease, filter 0.3s ease',
            transform: hovered ? 'scale(1.18) rotate(-8deg)' : 'scale(1) rotate(0deg)',
            filter: hovered && plan.popular ? 'drop-shadow(0 0 12px rgba(255, 221, 0,0.8))' : 'none',
          }}>
            {plan.key === 'hourly' && <Clock size={32} color={plan.popular ? '#FFDD00' : 'var(--text-primary)'} />}
            {plan.key === 'daily' && <CalendarDays size={32} color={plan.popular ? '#FFDD00' : 'var(--text-primary)'} />}
            {plan.key === 'weekly' && <Calendar size={32} color={plan.popular ? '#FFDD00' : 'var(--text-primary)'} />}
          </div>

          {/* Label */}
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            {plan.label}
          </div>

          {/* Price */}
          <div style={plan.popular ? {
            fontSize: '34px', fontWeight: 900, marginBottom: '4px',
            backgroundImage: 'linear-gradient(135deg, var(--text-primary), #FFDD00)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          } : {
            fontSize: '34px', fontWeight: 900, marginBottom: '4px',
            color: 'var(--text-primary)',
          }}>
            {formatPrice(plan.price)}
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>{t.common.currency}</div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>{plan.desc}</p>

          <Link
            href="/rent"
            className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {t.pricing.bookNow}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { t, events, loading, hallBlocks } = useApp();
  const totalSeats = hallBlocks?.reduce((sum, b) => sum + (b.rows * b.cols), 0) || 850;
  const pastEventsCount = events?.filter(e => new Date(e.date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)).length || 0;
  
  const [cmsData, setCmsData] = useState(null);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const statsRef = useRef(null);
  const [statsActive, setStatsActive] = useState(false);

  const eventsSection = useReveal(0.1);
  const hallSection = useReveal(0.1);
  const amenSection = useReveal(0.1);
  const priceSection = useReveal(0.1);

  useEffect(() => {
    async function fetchPageData() {
      try {
        const { data, error } = await supabase
          .from('page_sections')
          .select('*');
          
        if (!error && data) {
          const formatted = {};
          data.forEach(s => formatted[s.type] = s.data);
          setCmsData(formatted);
        } else {
          setCmsData({});
        }
      } catch (err) {
        console.error("Error loading CMS data:", err);
        setCmsData({});
      }
    }
    fetchPageData();
  }, []);

  useEffect(() => {
    if (cmsData) {
      if (cmsData.aurora_hero?.bgImage) {
        const img = new window.Image();
        img.src = cmsData.aurora_hero.bgImage;
        img.onload = () => setBgLoaded(true);
        img.onerror = () => setBgLoaded(true);
      } else {
        setBgLoaded(true);
      }
    }
  }, [cmsData]);

  useEffect(() => {
    const el = statsRef.current; if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsActive(true); ob.unobserve(el); } }, { threshold: 0.2 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  if (loading || !cmsData || !bgLoaded) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--text-accent)', animation: 'borderRotate 1s linear infinite' }} />
      </div>
    );
  }

  const sliderItems = events.slice(0, 5);
  const activeEvent = sliderItems[activeIndex] || {};
  const featuredEvents = events.filter(e => e.featured).slice(0, 3);

  const handleCardClick = (i) => {
    if (i === activeIndex && sliderItems[i]) {
      router.push(`/events/${sliderItems[i].id}`);
    } else {
      setActiveIndex(i);
    }
  };
  const handleNext = () => setActiveIndex((prev) => (prev + 1) % sliderItems.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + sliderItems.length) % sliderItems.length);

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* ===== PREMIUM AURORA HERO ===== */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        paddingTop: '100px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        background: '#0a0a0a'
      }}>
        {cmsData?.aurora_hero?.bgImage && (
          <Image src={cmsData.aurora_hero.bgImage} fill style={{ objectFit: 'cover', opacity: 1 }} alt="Hero" />
        )}

        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
        
        <Orb style={{ top: '20%', left: '10%', width: '300px', height: '300px', background: 'rgba(255,221,0,0.1)' }} />
        <Orb style={{ bottom: '10%', right: '20%', width: '400px', height: '400px', background: 'rgba(56,189,248,0.1)' }} />
        <FloatingParticles count={20} />

        <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, color: '#fff', marginBottom: '20px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            <Typewriter key={t.landingHero?.title} title={t.landingHero?.title} titleHighlight={t.landingHero?.titleHighlight} />
          </h1>
          <p style={{ fontSize: 'clamp(16px, 1.5vw, 20px)', color: 'rgba(255,255,255,0.8)', maxWidth: '700px', margin: '0 auto 32px' }}>
            {t.landingHero?.subtitle}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
             <Link href="/rent" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '18px', textDecoration: 'none' }}>
               {t.landingHero?.btnPrimary}
             </Link>
             <Link href="/events" className="btn btn-outline-light" style={{ padding: '16px 40px', fontSize: '18px', textDecoration: 'none' }}>
               {t.landingHero?.btnSecondary}
             </Link>
          </div>
        </div>
      </section>

      {/* ===== OUR HALLS ===== */}
      <OurHalls />

      {/* ===== PREMIUM BENTO BOX ADVANTAGES ===== */}
      <AdvantagesSection t={t} cmsData={cmsData} totalSeats={totalSeats} />

      {/* ===== RENT HALL CTA BANNER ===== */}
      <RentCTASection />

      <Feedbacks />
      <Partners />
      <Cases />
      <Contacts />
      <FAQ />

      {/* ===== ITICKET PROMO BANNER AT THE BOTTOM OF THE WEBSITE ===== */}
      <AppPromoBanner />

      <Footer />
    </div>  );
}
