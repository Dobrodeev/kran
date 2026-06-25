import React, { useState, useMemo, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Menu, 
  ChevronDown, 
  Truck, 
  ShieldCheck, 
  X, 
  Check, 
  Info,
  PhoneCall,
  User,
  Zap,
  ArrowRight,
  Calculator,
  Star,
  Newspaper,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Camera,
  Users
} from 'lucide-react';
import { CRANES, KYIV_ZONES, BLOG_ARTICLES } from './data/cranes';
import type { Article, Crane } from './types';
import { calculateRentalCost } from './utils/calculator';

declare const L: any;

interface CraneIconProps {
  size?: number;
  color?: string;
  className?: string;
}

const CraneIcon = ({ size = 20, color = 'currentColor', className = '' }: CraneIconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    style={{ flexShrink: 0 }}
  >
    <path d="M3 22h18" />
    <path d="M9 22V5h2v17" />
    <path d="M9 10h2" />
    <path d="M9 15h2" />
    <path d="M4 5h16" />
    <path d="M17 5v8" />
    <path d="M17 13c-0.8 0-1.5 0.5-1.5 1.2s0.7 1.2 1.5 1.2h0.8" />
  </svg>
);

const REVIEWS = [
  {
    id: 1,
    name: "Олег Петренко",
    role: "Виконроб, БК 'Інтербуд'",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    text: "Подали кран XCMG 25т за 1.5 год в Ірпінь. Машиніст майстер своєї справи!"
  },
  {
    id: 2,
    name: "Дмитро Коваленко",
    role: "Логіст, ТОВ 'Буд-Монтаж'",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
    text: "Найкращі умови роботи з ПДВ у Києві. Договір та акти закривають вчасно."
  },
  {
    id: 3,
    name: "Андрій Мельник",
    role: "Головний інженер",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
    text: "Орендували Liebherr 90т для монтажу балок. Виконано ювелірно та без затримок."
  },
  {
    id: 4,
    name: "Сергій Войтенко",
    role: "Керівник проектів, БК 'Міськбуд'",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop",
    text: "Брали автокран Liebherr 50т на три зміни для монтажу вежі. Техніка в ідеальному стані, оператор працював чітко по рації."
  },
  {
    id: 5,
    name: "Олена Яковенко",
    role: "Директор з постачання, 'СпецПром'",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop",
    text: "Працюємо на постійній основі. Дуже швидко надають комерційні пропозиції та рахунки. Завжди є вільні крани під термінові задачі."
  },
  {
    id: 6,
    name: "Ігор Кравченко",
    role: "Приватний забудовник, Київ",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop",
    text: "Замовляв 16-тонний кран для підйому піноблоків на будівництво будинку. Приїхав вчасно, водій допоміг правильно розмістити вантаж."
  },
  {
    id: 7,
    name: "Артем Шевченко",
    role: "Керівник напрямку, ТОВ 'Сталь-Міст'",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop",
    text: "Орендували кран 40 тонн для розвантаження металоконструкцій. Дуже кваліфікований персонал, професійні стропальники. Рекомендую!"
  },
  {
    id: 8,
    name: "Віталій Лисенко",
    role: "Виконавчий директор, 'ЕнергоБуд'",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop",
    text: "Співпрацюємо більше року. Всі дозволи на негабаритні крани та роботу в центрі міста завжди оформлені заздалегідь. Надійний партнер."
  }
];

const PROJECTS = [
  {
    id: 1,
    title: "Монтаж металоконструкцій ТРЦ",
    crane: "Liebherr LTM 1090 (90 тонн)",
    location: "Київ, Поділ",
    duration: "12 змін",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop",
    description: "Ювелірний монтаж опорних балок на висоті 24 метри в умовах щільної історичної забудови Подолу."
  },
  {
    id: 2,
    title: "Підйом плит перекриття",
    crane: "XCMG XCT25 (25 тонн)",
    location: "Ірпінь, Київська обл.",
    duration: "2 зміни",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
    description: "Оперативне розвантаження та підйом плит для будівництва приватного житлового комплексу."
  },
  {
    id: 3,
    title: "Встановлення вишки зв'язку",
    crane: "XCMG XCA50 (50 тонн)",
    location: "Київ, Дарниця",
    duration: "4 зміни",
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=600&h=400&fit=crop",
    description: "Монтаж та закріплення секцій телекомунікаційної щогли загальною висотою 45 метрів."
  }
];

const TEAM = [
  {
    id: 1,
    name: "Олександр Шевченко",
    role: "Старший машиніст кранів 90т+",
    experience: "15 років досвіду",
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop",
    specialty: "Експерт з важкої техніки Liebherr, має допуск до складних висотних робіт у центрі Києва."
  },
  {
    id: 2,
    name: "Михайло Кравчук",
    role: "Машиніст автокрана 25т - 40т",
    experience: "10 років досвіду",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    specialty: "Спеціаліст з точного монтажу металоконструкцій та роботи в обмеженому міському просторі."
  },
  {
    id: 3,
    name: "Дмитро Коваленко",
    role: "Машиніст автокрана 16т - 25т",
    experience: "8 років досвіду",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop",
    specialty: "Майстер швидкої подачі та розвантаження матеріалів, досконало знає приватний сектор Київщини."
  }
];

export default function App() {
  // Ініціалізація станів на основі початкового URL
  const initialPath = window.location.pathname;
  const initialArticle = initialPath.startsWith('/blog/') 
    ? BLOG_ARTICLES.find(a => a.id === initialPath.replace('/blog/', '')) || null 
    : null;
  
  let initialTab = 'catalog';
  if (initialPath === '/blog' || initialPath.startsWith('/blog/')) {
    initialTab = 'blog';
  } else if (initialPath === '/works') {
    initialTab = 'works';
  } else if (initialPath === '/team') {
    initialTab = 'team';
  }

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(initialArticle);

  // Region Selector State
  const [selectedCity, setSelectedCity] = useState('Київ та область');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  // Reviews Carousel State
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibleCards = windowWidth >= 1024 ? 3 : windowWidth >= 768 ? 2 : 1;
  const maxIndex = Math.max(0, REVIEWS.length - visibleCards);

  useEffect(() => {
    if (activeReviewIndex > maxIndex) {
      setActiveReviewIndex(maxIndex);
    }
  }, [visibleCards, maxIndex, activeReviewIndex]);

  const nextReview = () => {
    if (activeReviewIndex < maxIndex) {
      setActiveReviewIndex(prev => prev + 1);
    }
  };

  const prevReview = () => {
    if (activeReviewIndex > 0) {
      setActiveReviewIndex(prev => prev - 1);
    }
  };

  // Filters State
  const [selectedTonnage, setSelectedTonnage] = useState<string>('all');
  const [selectedBoom, setSelectedBoom] = useState<string>('all');

  // Calculator State
  const [selectedCraneId, setSelectedCraneId] = useState<string>(CRANES[0].id);
  const [calcHours, setCalcHours] = useState<number>(8);
  const [insideKp, setInsideKp] = useState<boolean>(true);
  const [calcDistance, setCalcDistance] = useState<number>(10);
  const [requiresCenterPermit, setRequiresCenterPermit] = useState<boolean>(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('right-bank');

  const [deliveryAddress, setDeliveryAddress] = useState<string>('Київ, вул. Хрещатик, 1');
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([50.4501, 30.5234]);
  const [addressSearchQuery, setAddressSearchQuery] = useState<string>('');
  
  const mapInstance = React.useRef<any>(null);
  const markerInstance = React.useRef<any>(null);

  // Helper for computing distance using Haversine formula
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // We can synchronize manual delivery/distance inputs with the map
  const syncManualInputWithMap = (isInside: boolean, distance: number) => {
    if (isInside) {
      const kyivCenter: [number, number] = [50.4501, 30.5234];
      setMarkerPosition(kyivCenter);
      setDeliveryAddress('Київ, центр');
      if (mapInstance.current) {
        mapInstance.current.setView(kyivCenter, 12);
        if (markerInstance.current) {
          markerInstance.current.setLatLng(kyivCenter);
        }
      }
    } else {
      const offsetKm = 18 + distance;
      const offsetLat = 50.4501 + (offsetKm / 111);
      const suburbPos: [number, number] = [offsetLat, 30.5234];
      setMarkerPosition(suburbPos);
      setDeliveryAddress(`Передмістя, ${distance} км від КП`);
      if (mapInstance.current) {
        mapInstance.current.setView(suburbPos, 11);
        if (markerInstance.current) {
          markerInstance.current.setLatLng(suburbPos);
        }
      }
    }
  };

  const handleAddressSearch = async (addressQuery: string) => {
    if (!addressQuery.trim()) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMarkerPosition([lat, lon]);
        setDeliveryAddress(data[0].display_name);
        
        // update map and marker position
        if (mapInstance.current) {
          mapInstance.current.setView([lat, lon], 14);
          if (markerInstance.current) {
            markerInstance.current.setLatLng([lat, lon]);
          }
        }
        
        // Calculate distance and update zone/Kp status
        const dist = getDistance(50.4501, 30.5234, lat, lon);
        if (dist <= 18) {
          setInsideKp(true);
          setCalcDistance(0);
          if (dist < 4) {
            setSelectedZoneId('center');
          } else if (lon < 30.53) {
            setSelectedZoneId('right-bank');
          } else {
            setSelectedZoneId('left-bank');
          }
        } else {
          setInsideKp(false);
          setCalcDistance(Math.max(1, Math.round(dist - 18)));
          setSelectedZoneId('suburbs');
        }
      } else {
        alert("Адресу не знайдено. Будь ласка, спробуйте інший пошуковий запит.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  // Auto-update center city permit on active crane & zone updates
  useEffect(() => {
    if (selectedZoneId === 'center' && activeCrane.capacity >= 40) {
      setRequiresCenterPermit(true);
    } else {
      setRequiresCenterPermit(false);
    }
  }, [selectedZoneId, selectedCraneId]);

  // Leaflet Initialization effect
  useEffect(() => {
    if (typeof L === 'undefined') return;

    const mapContainer = document.getElementById('calc-map');
    if (!mapContainer) return;

    if (mapInstance.current) {
      try {
        mapInstance.current.remove();
      } catch (e) {
        console.error(e);
      }
      mapInstance.current = null;
    }

    try {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    } catch (e) {
      console.error("Leaflet icon setup error:", e);
    }

    const map = L.map('calc-map').setView(markerPosition, 11);
    mapInstance.current = map;

    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: 'Map data &copy; Google'
    }).addTo(map);

    const marker = L.marker(markerPosition, { draggable: true }).addTo(map);
    markerInstance.current = marker;

    const updateFromCoords = async (lat: number, lon: number) => {
      const dist = getDistance(50.4501, 30.5234, lat, lon);
      if (dist <= 18) {
        setInsideKp(true);
        setCalcDistance(0);
        if (dist < 4) {
          setSelectedZoneId('center');
        } else if (lon < 30.53) {
          setSelectedZoneId('right-bank');
        } else {
          setSelectedZoneId('left-bank');
        }
      } else {
        setInsideKp(false);
        setCalcDistance(Math.max(1, Math.round(dist - 18)));
        setSelectedZoneId('suburbs');
      }

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await res.json();
        if (data && data.display_name) {
          setDeliveryAddress(data.display_name);
        } else {
          setDeliveryAddress(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
        }
      } catch (err) {
        console.error("Reverse geocoding error:", err);
        setDeliveryAddress(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
      }
    };

    marker.on('dragend', () => {
      const position = marker.getLatLng();
      setMarkerPosition([position.lat, position.lng]);
      updateFromCoords(position.lat, position.lng);
    });

    map.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      setMarkerPosition([lat, lon]);
      marker.setLatLng([lat, lon]);
      updateFromCoords(lat, lon);
    });

    return () => {
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
        } catch (e) {
          console.error(e);
        }
        mapInstance.current = null;
      }
    };
  }, [activeTab]);

  const [bookingCrane, setBookingCrane] = useState<Crane | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-24');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [nameError, setNameError] = useState('');
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);


  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setSelectedArticle(null);
      if (path === '/' || path === '') {
        setActiveTab('catalog');
      } else if (path === '/blog') {
        setActiveTab('blog');
      } else if (path === '/works') {
        setActiveTab('works');
      } else if (path === '/team') {
        setActiveTab('team');
      } else if (path.startsWith('/blog/')) {
        setActiveTab('blog');
        const articleId = path.replace('/blog/', '');
        const article = BLOG_ARTICLES.find(a => a.id === articleId);
        if (article) {
          setSelectedArticle(article);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (activeTab === 'blog') {
      document.title = "Блог та корисні статті | Kyiv Crane Pro";
    } else if (activeTab === 'works') {
      document.title = "Наші роботи та виконані проекти | Kyiv Crane Pro";
    } else if (activeTab === 'team') {
      document.title = "Наша команда машиністів кранів | Kyiv Crane Pro";
    } else {
      document.title = "Оренда автокранів в Києві | Подача від 2 годин | Kyiv Crane Pro";
    }
  }, [activeTab]);

  const scrollToSection = (id: string, tabName: string) => {
    setSelectedArticle(null);
    setActiveTab(tabName);
    
    if (tabName === 'blog') {
      if (window.location.pathname !== '/blog') {
        window.history.pushState({}, '', '/blog');
      }
    } else if (tabName === 'works') {
      if (window.location.pathname !== '/works') {
        window.history.pushState({}, '', '/works');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tabName === 'team') {
      if (window.location.pathname !== '/team') {
        window.history.pushState({}, '', '/team');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  };

  // 1. Filter Logic
  const filteredCranes = useMemo(() => {
    return CRANES.filter(crane => {
      // Tonnage filter
      if (selectedTonnage !== 'all') {
        const capacity = crane.capacity;
        if (selectedTonnage === '16' && capacity !== 16) return false;
        if (selectedTonnage === '25' && capacity !== 25) return false;
        if (selectedTonnage === '40' && capacity !== 40) return false;
        if (selectedTonnage === '50+' && capacity < 50) return false;
      }
      // Boom length filter
      if (selectedBoom !== 'all') {
        const length = crane.boomLength;
        if (selectedBoom === '22' && length > 25) return false; // 22m range
        if (selectedBoom === '38' && (length < 25 || length > 40)) return false; // 38m range
        if (selectedBoom === '50+' && length < 50) return false; // 50m+ range
      }
      return true;
    });
  }, [selectedTonnage, selectedBoom]);

  // 2. Active Crane details for Calculator
  const activeCrane = useMemo(() => {
    return CRANES.find(c => c.id === selectedCraneId) || CRANES[0];
  }, [selectedCraneId]);

  // 3. Calculator Pricing Result
  const calculatorResult = useMemo(() => {
    return calculateRentalCost(
      activeCrane,
      calcHours,
      insideKp,
      calcDistance,
      requiresCenterPermit
    );
  }, [activeCrane, calcHours, insideKp, calcDistance, requiresCenterPermit]);



  // 5. Booking Flow Submit Handler
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    
    if (!contactName.trim()) {
      setNameError("Будь ласка, введіть ім'я");
      valid = false;
    } else {
      setNameError("");
    }

    const digitsOnly = contactPhone.replace(/\D/g, '');
    
    if (!contactPhone.trim()) {
      setPhoneError("Введіть номер телефону");
      valid = false;
    } else if (digitsOnly.length < 9) {
      setPhoneError("Некоректний формат телефону");
      valid = false;
    } else {
      setPhoneError("");
    }

    if (!selectedDate) {
      alert("Будь ласка, оберіть вільну дату в календарі");
      valid = false;
    }

    if (valid && bookingCrane) {
      setIsSuccessOpen(true);
    }
  };

  // Close Booking Form Modal
  const closeBookingModal = () => {
    setBookingCrane(null);
    setSelectedDate('2026-06-24');
    setContactName('');
    setContactPhone('');
    setPhoneError('');
    setNameError('');
    setIsSuccessOpen(false);
  };



  return (
    <div className="app-container">
      <div className="page-wrapper">
        
        {/* 1. Header (Шапка екрана) */}
        <header className="app-header">
          {/* Left side: Logo */}
          <div className="header-logo" onClick={() => scrollToSection('catalog', 'catalog')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CraneIcon size={30} color="var(--primary-orange)" />
            <span className="brand-name" style={{ fontWeight: '800', fontSize: '18px', color: '#1C1C1E' }}>Kyiv Crane Pro</span>
          </div>

          {/* Center: Desktop Nav Menu (Hidden on mobile via CSS) */}
          <nav className="desktop-nav">
            <a href="#catalog" className={activeTab === 'catalog' ? 'active' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('catalog', 'catalog'); }}>Крани</a>
            <a href="#calc" className={activeTab === 'calc' ? 'active' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('calc', 'catalog'); }}>Ціни</a>
            <a href="#works" className={activeTab === 'works' ? 'active' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('works', 'works'); }}>Роботи</a>
            <a href="#team" className={activeTab === 'team' ? 'active' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('team', 'team'); }}>Команда</a>
            <a href="#reviews" className={activeTab === 'reviews' ? 'active' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('reviews', 'catalog'); }}>Відгуки</a>
            <a href="#blog" className={activeTab === 'blog' ? 'active' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('blog', 'blog'); }}>Блог</a>
            <a href="#contacts" className={activeTab === 'contacts' ? 'active' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('contacts', 'catalog'); }}>Контакти</a>
          </nav>

          {/* Right side: Location & Phone */}
          <div className="header-actions">
            <div className="geo-tag" onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}>
              <MapPin size={14} style={{ color: 'var(--primary-orange)' }} />
              <span>{selectedCity}</span>
              <ChevronDown size={14} />
            </div>

            {isCityDropdownOpen && (
              <div className="geo-dropdown glass-card">
                {['Київ та область', 'Київ (Центр)', 'Бровари', 'Бориспіль', 'Ірпінь'].map((city) => (
                  <div 
                    key={city} 
                    className="filter-pill-option"
                    onClick={() => {
                      setSelectedCity(city);
                      setIsCityDropdownOpen(false);
                    }}
                  >
                    {city}
                  </div>
                ))}
              </div>
            )}

            <a href="tel:+380441234567" className="phone-btn-desktop">
              <Phone size={14} />
              <span>+38 (044) 123-45-67</span>
            </a>

            {/* Mobile-only contact and menu icons */}
            <a href="tel:+380441234567" className="icon-btn mobile-only" title="Подзвонити">
              <Phone size={16} />
            </a>
            <button className="icon-btn mobile-menu-toggle" onClick={() => setIsBurgerOpen(true)} title="Меню">
              <Menu size={16} />
            </button>
          </div>
        </header>

        {activeTab === 'blog' ? (
          <main className="app-main">
            {selectedArticle ? (
              /* Полноценная отдельная страница статьи для SEO (с H1) */
              <div className="seo-article-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <button 
                    className="icon-btn" 
                    onClick={() => { setSelectedArticle(null); window.history.pushState({}, '', '/blog'); }} 
                    style={{ width: '32px', height: '32px' }}
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <span style={{ fontSize: '13px', color: 'var(--text-grey)', fontWeight: '600' }}>Назад до статей</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--primary-orange)', fontWeight: 'bold' }}>{selectedArticle.readTime} • {selectedArticle.date}</span>
                  <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#1C1C1E', lineHeight: '1.3' }}>{selectedArticle.title}</h1>
                </div>

                {selectedArticle.image && (
                  <img 
                    src={selectedArticle.image} 
                    alt={selectedArticle.title} 
                    style={{ 
                      width: '100%', 
                      borderRadius: '16px', 
                      objectFit: 'cover', 
                      maxHeight: '220px', 
                      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                      border: '1px solid var(--border-color)'
                    }} 
                  />
                )}

                <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

                <div className="article-body-content" style={{ fontSize: '13px', color: 'var(--text-grey)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {selectedArticle.content}
                </div>

                <button 
                  className="btn-secondary" 
                  onClick={() => { setSelectedArticle(null); window.history.pushState({}, '', '/blog'); }} 
                  style={{ width: '100%', marginTop: '20px' }}
                >
                  Повернутися до списку статей
                </button>
              </div>
            ) : (
              /* Отдельный экран Блога (Список статей) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <button 
                    className="icon-btn" 
                    onClick={() => { setActiveTab('catalog'); window.history.pushState({}, '', '/'); }} 
                    style={{ width: '32px', height: '32px' }}
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <h2 className="section-title" style={{ margin: 0 }}>Блог та корисні статті</h2>
                </div>
                
                <div className="blog-grid" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {BLOG_ARTICLES.map((article) => (
                    <div 
                      key={article.id} 
                      className="glass-card" 
                      style={{ 
                        padding: '12px', 
                        cursor: 'pointer', 
                        transition: 'transform 0.2s ease', 
                        display: 'flex', 
                        gap: '12px', 
                        alignItems: 'center', 
                        textAlign: 'left' 
                      }}
                      onClick={() => { setSelectedArticle(article); window.history.pushState({}, '', '/blog/' + article.id); }}
                    >
                      {article.image && (
                        <img 
                          src={article.image} 
                          alt={article.title} 
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            objectFit: 'cover', 
                            borderRadius: '12px', 
                            flexShrink: 0, 
                            border: '1px solid var(--border-color)' 
                          }} 
                        />
                      )}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--primary-orange)', fontWeight: 'bold' }}>{article.readTime}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-grey)' }}>{article.date}</span>
                        </div>
                        <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#1C1C1E', lineHeight: '1.3' }}>{article.title}</h3>
                        <p style={{ 
                          fontSize: '11.5px', 
                          color: 'var(--text-grey)', 
                          margin: 0, 
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {article.excerpt}
                        </p>
                        <span style={{ fontSize: '11.5px', color: '#A36B00', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          Читати статтю <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Статичний оптимізований SEO-текст */}
                <div className="glass-card" style={{ padding: '14px', background: 'rgba(255,255,255,0.4)', border: '1px dashed var(--border-color)', textAlign: 'left', marginTop: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Про компанію Kyiv Crane Pro</span>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                    Ми надаємо послуги оренди автомобільних кранів вантажопідйомністю від 16 до 160 тонн у Києві та Київській області (Ірпінь, Буча, Бровари, Бориспіль, Вишгород). Працюємо офіційно з ПДВ, надаємо безкоштовні дозволи на в'їзд у центр Києва та гарантуємо подачу спецтехніки від 2 годин.
                  </p>
                </div>
              </div>
            )
          }
          </main>
        ) : activeTab === 'works' ? (
          <main className="app-main">
            /* Наші роботи (Окрема сторінка) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <button 
                  className="icon-btn" 
                  onClick={() => { setActiveTab('catalog'); window.history.pushState({}, '', '/'); }} 
                  style={{ width: '32px', height: '32px' }}
                >
                  <ArrowLeft size={16} />
                </button>
                <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#1C1C1E' }}>Наші роботи (Виконані проекти)</h1>
              </div>

              <div className="works-grid">
                {PROJECTS.map((proj) => (
                  <div key={proj.id} className="glass-card work-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#FFFFFF', padding: '16px', textAlign: 'left' }}>
                    <div className="work-image-container" style={{ width: '100%', height: '200px', borderRadius: '16px', overflow: 'hidden', background: '#F2F2F7' }}>
                      <img 
                        src={proj.image} 
                        alt={proj.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
                        className="work-image"
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--primary-orange)', fontWeight: 'bold' }}>{proj.location} • {proj.duration}</span>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1E', margin: 0 }}>{proj.title}</h3>
                      <span style={{ fontSize: '13px', color: 'var(--text-grey)', fontWeight: '600' }}>Техніка: {proj.crane}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-grey)', margin: 0, lineHeight: '1.45' }}>
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>

              <button 
                className="btn-secondary" 
                onClick={() => { setActiveTab('catalog'); window.history.pushState({}, '', '/'); }} 
                style={{ width: '100%', marginTop: '20px' }}
              >
                Повернутися на головну сторінку
              </button>
            </div>
          </main>
        ) : activeTab === 'team' ? (
          <main className="app-main">
            /* Наша команда (Окрема сторінка) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <button 
                  className="icon-btn" 
                  onClick={() => { setActiveTab('catalog'); window.history.pushState({}, '', '/'); }} 
                  style={{ width: '32px', height: '32px' }}
                >
                  <ArrowLeft size={16} />
                </button>
                <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#1C1C1E' }}>Наша команда (Професійні машиністи)</h1>
              </div>

              <div className="team-grid">
                {TEAM.map((member) => (
                  <div key={member.id} className="glass-card team-card" style={{ display: 'flex', gap: '16px', background: '#FFFFFF', padding: '16px', textAlign: 'left', alignItems: 'center' }}>
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-orange)', flexShrink: 0 }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1C1C1E', margin: 0 }}>{member.name}</h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-grey)', fontWeight: '700' }}>{member.role} ({member.experience})</span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-grey)', margin: 0, lineHeight: '1.4' }}>
                        {member.specialty}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                className="btn-secondary" 
                onClick={() => { setActiveTab('catalog'); window.history.pushState({}, '', '/'); }} 
                style={{ width: '100%', marginTop: '20px' }}
              >
                Повернутися на головну сторінку
              </button>
            </div>
          </main>
        ) : (
          <>
            <main className="app-main">

          {/* 2. Главный баннер (Быстрый подбор) */}
          <section className="hero-section">
            <h1 className="hero-title">Оренда автокранів в Києві. Подача від 2 годин.</h1>
            <p className="hero-subtitle">Швидкий підбір техніки під будь-які індустріальні та будівельні завдання.</p>
          </section>

          {/* Smart Filters Block */}
          <section className="glass-card filters-container">
            {/* Tonnage filter */}
            <div className="filter-group">
              <span className="filter-label">Вантажопідйомність (тонн)</span>
              <div className="filter-options">
                {[
                  { value: 'all', label: 'Всі' },
                  { value: '16', label: '16 т' },
                  { value: '25', label: '25 т 🔥' },
                  { value: '40', label: '40 т' },
                  { value: '50+', label: '50 т+' }
                ].map(opt => (
                  <button 
                    key={opt.value}
                    className={`filter-pill ${selectedTonnage === opt.value ? 'active' : ''}`}
                    onClick={() => setSelectedTonnage(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Boom length filter */}
            <div className="filter-group">
              <span className="filter-label">Довжина стріли</span>
              <div className="filter-options">
                {[
                  { value: '22', label: 'до 22 м' },
                  { value: '38', label: '22 - 38 м' },
                  { value: '50+', label: 'понад 50 м' }
                ].map(opt => (
                  <button 
                    key={opt.value}
                    className={`filter-pill ${selectedBoom === opt.value ? 'active' : ''}`}
                    onClick={() => setSelectedBoom(selectedBoom === opt.value ? 'all' : opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Quick Filter Info SEO Text */}
          <div className="filter-seo-text" style={{ fontSize: '15px', color: 'var(--text-grey)', textAlign: 'left', marginTop: '4px', marginBottom: '12px', lineHeight: '1.5', padding: '0 15px', maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto' }}>
            Швидкий підбір автокрана в оренду по Києву та області. Оберіть вантажопідйомність від 16 до 50 тонн та довжину стріли. 
            Усі автокрани надаються з досвідченими машиністами та заправкою дизелем. Подача техніки на об'єкт — від 2 годин. 
            Ми пропонуємо гнучкі умови оренди спецтехніки для проектів будь-якого масштабу та складності. 
            Весь наш автопарк автокранів Liebherr, Demag та XCMG проходить регулярний технічний огляд. 
            Забезпечуємо швидке та офіційне оформлення документів, працюємо як з фізичними особами, так і з ПДВ. 
            Зверніться до наших спеціалістів, щоб отримати безкоштовну консультацію та точний розрахунок вартості.
          </div>

          {/* 3. Список автокранов (Карточки товара) */}
          <section id="catalog" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 className="section-title">
              <Zap size={18} style={{ color: 'var(--primary-orange)' }} />
              Доступна спецтехніка ({filteredCranes.length})
            </h2>

            {filteredCranes.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-grey)' }}>
                Не знайдено кранів за обраними фільтрами. Спробуйте змінити фільтрацію.
              </div>
            ) : (
              <div className="cranes-grid">
                {filteredCranes.map(crane => (
                  <div key={crane.id} className="glass-card crane-card">
                    <div className="crane-card-header" style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                      <div className="crane-title-block">
                        <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>{crane.brand} {crane.name}</h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-grey)', display: 'block', marginTop: '2px' }}>Телескопічний автокран</span>
                      </div>
                    </div>

                    <div className="crane-image-container" style={{ position: 'relative' }}>
                      {/* Absolute Badges Overlay on Image */}
                      <div className="crane-badges" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 5, display: 'flex', gap: '6px' }}>
                        {crane.isAvailableToday && (
                          <span className="badge-available" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(4px)', color: 'var(--neon-green)', border: '1px solid var(--neon-green)', borderRadius: '50px', fontSize: '11px', padding: '3px 8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-green)', display: 'inline-block' }}></span>
                            Свободен сьогодні
                          </span>
                        )}
                      </div>
                      {crane.isSpecialPrice && (
                        <span className="badge-special" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 5, background: '#FFB800', color: '#121214', border: 'none', borderRadius: '50px', fontSize: '11px', padding: '3.5px 10px', fontWeight: '700' }}>
                          Спецціна
                        </span>
                      )}

                      <img 
                        src={crane.image} 
                        alt={`${crane.brand} ${crane.name}`} 
                        className="crane-image" 
                        onError={(e) => {
                          // fallback if image fails
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=500';
                        }}
                      />
                    </div>

                    <div className="crane-specs">
                      <div className="spec-item">
                        <span className="spec-label">Вантажність</span>
                        <span className="spec-value">{crane.capacity} т</span>
                      </div>
                      <div className="spec-item" style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="spec-label">Стріла</span>
                        <span className="spec-value">{crane.boomLength} м</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Мін. замовлення</span>
                        <span className="spec-value">1 зміна ({crane.minOrderHours} год)</span>
                      </div>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-grey)', lineHeight: '1.4' }}>
                      {crane.description}
                    </p>

                    <div className="crane-pricing-row">
                      <div className="price-block">
                        <span className="price-main">від {crane.hourlyRate.toLocaleString()} грн/год</span>
                        <span className="price-sub">зміна: {crane.shiftRate.toLocaleString()} грн з ПДВ</span>
                      </div>
                      
                      <button 
                        className="btn-primary crane-book-btn" 
                        onClick={() => {
                          setBookingCrane(crane);
                          setSelectedCraneId(crane.id); // Also sync with calculator
                        }}
                        style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        Забронювати в 1 клік
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 4. Умний UX-калькулятор з Інтерактивною картою */}
          <section id="calc" className="location-section">
            <h2 className="section-title">
              <Truck size={18} style={{ color: 'var(--electric-blue)' }} />
              Розрахунок вартості та доставки
            </h2>

            <div className="calc-desktop-grid">
              {/* Left Column: Smart Calculator Input Form */}
              <div className="glass-card calc-field-group" style={{ margin: 0 }}>
                <span className="filter-label" style={{ marginBottom: '12px', display: 'block' }}>
                  ⚙️ Параметри оренди:
                </span>
                
                <div className="form-row">
                  <div className="form-col">
                    <label htmlFor="crane-select">Обрати Автокран</label>
                    <select 
                      id="crane-select"
                      value={selectedCraneId} 
                      onChange={(e) => setSelectedCraneId(e.target.value)}
                    >
                      {CRANES.map(c => (
                        <option key={c.id} value={c.id}>{c.brand} {c.name} ({c.capacity}т / {c.boomLength}м)</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-col">
                    <label htmlFor="hours-input">Години роботи</label>
                    <input 
                      id="hours-input"
                      type="number" 
                      min="8" 
                      max="72"
                      value={calcHours} 
                      onChange={(e) => setCalcHours(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-col">
                    <label htmlFor="delivery-select">Доставка</label>
                    <select 
                      id="delivery-select"
                      value={insideKp ? 'inside' : 'outside'} 
                      onChange={(e) => {
                        const isInside = e.target.value === 'inside';
                        setInsideKp(isInside);
                        if (isInside) {
                          setCalcDistance(0);
                          if (selectedZoneId === 'suburbs') setSelectedZoneId('right-bank');
                          syncManualInputWithMap(true, 0);
                        } else {
                          setSelectedZoneId('suburbs');
                          syncManualInputWithMap(false, calcDistance);
                        }
                      }}
                    >
                      <option value="inside">В межах КП (Безкоштовно)</option>
                      <option value="outside">За межі КП (Передмістя)</option>
                    </select>
                  </div>

                  {!insideKp && (
                    <div className="form-col">
                      <label htmlFor="distance-slider">Відстань від КП (км)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          id="distance-slider"
                          type="range" 
                          min="1" 
                          max="100" 
                          value={calcDistance} 
                          onChange={(e) => {
                            const dist = Number(e.target.value);
                            setCalcDistance(dist);
                            syncManualInputWithMap(false, dist);
                          }}
                          style={{ flex: 1, accentColor: 'var(--primary-orange)' }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: 'bold', width: '45px' }}>{calcDistance} км</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Special Options depending on parameters */}
                {activeCrane.capacity >= 40 && (
                  <div className="switch-row" style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Спецперепустка в центр міста</span>
                      <span className="switch-label-desc">Вимога для важкої техніки (оформляємо безкоштовно)</span>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={requiresCenterPermit}
                        onChange={(e) => setRequiresCenterPermit(e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                )}
              </div>

              {/* Right Column: Interactive Map with Address Input */}
              <div className="glass-card map-card-wrapper" style={{ margin: 0, padding: '12px', display: 'flex', flexDirection: 'column' }}>
                <span className="filter-label" style={{ marginBottom: '8px', display: 'block' }}>
                  📍 Адреса подачі автокрана:
                </span>

                {/* Address Search Bar */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-grey)', zIndex: 2 }} />
                    <input 
                      type="text" 
                      aria-label="Введіть адресу доставки..."
                      placeholder="Введіть адресу доставки..." 
                      value={addressSearchQuery}
                      onChange={(e) => setAddressSearchQuery(e.target.value)}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px 10px 36px', 
                        borderRadius: '12px', 
                        border: '1px solid var(--border-color)',
                        fontSize: '13px',
                        background: 'var(--bg-input)',
                        outline: 'none',
                        color: '#1C1C1E'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddressSearch(addressSearchQuery);
                        }
                      }}
                    />
                  </div>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={() => handleAddressSearch(addressSearchQuery)}
                    style={{ padding: '10px 16px', fontSize: '13px', borderRadius: '12px', whiteSpace: 'nowrap' }}
                  >
                    Знайти
                  </button>
                </div>
                
                {/* Map Div */}
                <div 
                  id="calc-map" 
                  style={{ 
                    height: '220px', 
                    width: '100%', 
                    borderRadius: '16px', 
                    border: '1px solid var(--border-color)', 
                    position: 'relative',
                    zIndex: 1
                  }}
                ></div>

                {/* Selected Address & Cost Info */}
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <MapPin size={14} style={{ color: 'var(--primary-orange)', marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: '#1C1C1E', fontWeight: 'bold' }}>
                      Адреса: <span style={{ fontWeight: 'normal', color: 'var(--text-grey)' }}>{deliveryAddress}</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <Info size={14} style={{ color: 'var(--electric-blue)', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-grey)' }}>
                      {KYIV_ZONES.find(z => z.id === selectedZoneId)?.description}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Full Width Pricing Breakdown */}
            <div className="glass-card calc-results-full-width">
              <div className="pricing-details-left">
                <span className="filter-label" style={{ display: 'block' }}>
                  💵 Деталі розрахунку:
                </span>
                <div className="pricing-items-row">
                  <div className="pricing-item">
                    <span className="item-label">Оренда ({calcHours} год):</span>
                    <span className="item-value">{calculatorResult.baseRentCost.toLocaleString()} грн</span>
                  </div>
                  {!insideKp && (
                    <div className="pricing-item">
                      <span className="item-label">Доставка за КП ({calcDistance} км):</span>
                      <span className="item-value">{calculatorResult.deliveryCost.toLocaleString()} грн</span>
                    </div>
                  )}
                  {requiresCenterPermit && activeCrane.capacity >= 40 && (
                    <div className="pricing-item">
                      <span className="item-label">Спецпропуск та супровід:</span>
                      <span className="item-value" style={{ color: 'var(--electric-blue)' }}>Включено (0 грн)</span>
                    </div>
                  )}
                  <div className="pricing-item">
                    <span className="item-label">ПДВ (20%):</span>
                    <span className="item-value">{calculatorResult.vatCost.toLocaleString()} грн</span>
                  </div>
                </div>
              </div>
              <div className="pricing-cta-right">
                <div className="total-cost-block">
                  <span className="total-label">Всього до сплати:</span>
                  <span className="total-value">{calculatorResult.totalCostIncludingVat.toLocaleString()} грн</span>
                </div>
                <button 
                  className="btn-primary" 
                  onClick={() => setBookingCrane(activeCrane)}
                  style={{ padding: '14px 28px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span>Оформити замовлення</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </section>


          {/* 4.5 Відгуки Google Maps */}
          <section id="reviews" className="reviews-section">
            <div className="google-rating-badge">
              <div className="google-logo">
                <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#1C1C1E' }}>4.9</span>
                  <span style={{ color: '#FFB800', fontSize: '12px' }}>★★★★★</span>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-grey)', fontWeight: '600' }}>184 відгуки в Києві</span>
              </div>
              <div className="avatar-stack">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" alt="User 1" />
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop" alt="User 2" />
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop" alt="User 3" />
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop" alt="User 4" />
              </div>
            </div>

            <div className="reviews-carousel-outer">
              <div className="reviews-carousel-container">
                <button 
                  className="carousel-nav-btn prev-btn" 
                  onClick={prevReview} 
                  disabled={activeReviewIndex === 0}
                  aria-label="Previous review"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="reviews-carousel-viewport">
                  <div 
                    className="reviews-carousel-track"
                    style={{ 
                      transform: `translateX(-${activeReviewIndex * (100 / visibleCards)}%)`,
                    }}
                  >
                    {REVIEWS.map(rev => (
                      <div 
                        key={rev.id} 
                        className="review-slide-item"
                        style={{ 
                          width: `${100 / visibleCards}%`,
                        }}
                      >
                        <div className="review-mini-card">
                          <div className="review-author">
                            <img src={rev.avatar} alt={rev.name} />
                            <div className="author-info">
                              <span className="author-name">{rev.name}</span>
                              <span className="author-role">{rev.role}</span>
                            </div>
                            <span style={{ color: '#FFB800', fontSize: '10px', marginLeft: 'auto' }}>★★★★★</span>
                          </div>
                          <p className="review-text">«{rev.text}»</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button 
                  className="carousel-nav-btn next-btn" 
                  onClick={nextReview} 
                  disabled={activeReviewIndex >= maxIndex}
                  aria-label="Next review"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              
              {maxIndex > 0 && (
                <div className="carousel-dots">
                  {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                    <button 
                      key={idx} 
                      className={`carousel-dot ${activeReviewIndex === idx ? 'active' : ''}`}
                      onClick={() => setActiveReviewIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 5. Блок Доверия и Гарантий */}
          <section className="trust-block">
            <h2 className="section-title">
              <ShieldCheck size={18} style={{ color: 'var(--neon-green)' }} />
              Нам довіряють
            </h2>
            
            <div className="logos-ticker-container">
              <div className="logos-ticker-track">
                {[1, 2].map((setIndex) => (
                  <React.Fragment key={setIndex}>
                    {/* Logo 1: KAN */}
                    <div className="trust-logo-card" title="KAN Development">
                      <svg viewBox="0 0 81 114" width="20" height="28" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                        <path d="M80.2197 56.553L40.2184 7.62939e-05L0.219727 56.553L40.2184 113.104L80.2197 56.553Z" fill="#120F82"/>
                        <path d="M26.8517 64.1582L22.4846 57.0992L19.9298 59.7376V64.1582H16.7495V48.9455H19.9298V55.7013L26.0346 48.9455H30.3119L24.6765 54.9514L30.6338 64.1582H26.8517Z" fill="#FFFFFF"/>
                        <path d="M63.6899 64.1582H60.6277L53.3022 53.9238V64.1582H50.4668V48.9455H53.4361L60.8546 59.4183V48.9455H63.6899V64.1582Z" fill="#FFFFFF"/>
                        <path d="M37.1042 58.1407L39.4331 52.4935L41.8155 58.1407H37.1042ZM41.1609 48.9455H37.7812L31.293 64.1582H34.6834L36.1214 60.7028H42.8413L44.3448 64.1582H47.8219L41.1609 48.9455Z" fill="#FFFFFF"/>
                      </svg>
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={{ fontSize: '11px', fontWeight: '900', color: '#1C1C1E', lineHeight: 1.1 }}>KAN</span>
                        <span style={{ fontSize: '6px', fontWeight: '700', color: '#636366', letterSpacing: '0.5px' }}>DEVELOPMENT</span>
                      </div>
                    </div>
                    
                    {/* Logo 2: Kyivmiskbud */}
                    <div className="trust-logo-card" title="Київміськбуд">
                      <img src="/kyivmiskbud.png" alt="Київміськбуд" style={{ height: '24px', width: 'auto', objectFit: 'contain', marginRight: '6px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={{ fontSize: '8.5px', fontWeight: '900', color: '#1C1C1E', lineHeight: 1.1 }}>КИЇВМІСЬКБУД</span>
                        <span style={{ fontSize: '5px', fontWeight: '700', color: '#636366', letterSpacing: '0.1px' }}>ХОЛДИНГОВА КОМПАНІЯ</span>
                      </div>
                    </div>
                    
                    {/* Logo 3: Kovalska */}
                    <div className="trust-logo-card" title="Ковальська">
                      <svg viewBox="0 0 130 36" width="100" height="28" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                        <path d="M4 4 H11 V15 L19 4 H26 L17 17 L27 30 H20 L11 20 V30 H4 Z" fill="#E31E24" />
                        <text x="31" y="19" fill="#1C1C1E" fontSize="11" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.1">КОВАЛЬСЬКА</text>
                        <text x="31" y="27" fill="#636366" fontSize="6.5" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.5">БУДІВЕЛЬНА ГРУПА</text>
                      </svg>
                    </div>
                    
                    {/* Logo 4: Intergal-Bud */}
                    <div className="trust-logo-card" title="Інтергал-Буд">
                      <svg viewBox="0 0 32 32" width="24" height="24" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                        <path d="M6 2H26V30H6V2Z" fill="#0A3C9A"/>
                        <path d="M11 7H21V12H11V7ZM11 15H21V20H11V15ZM11 23H21V28H11V23Z" fill="#FFFFFF"/>
                      </svg>
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: '#1C1C1E', lineHeight: 1.1 }}>ІНТЕРГАЛ-БУД</span>
                        <span style={{ fontSize: '5.5px', fontWeight: '700', color: '#636366', letterSpacing: '0.2px' }}>БУДІВЕЛЬНА КОМПАНІЯ</span>
                      </div>
                    </div>
                    
                    {/* Logo 5: UDP */}
                    <div className="trust-logo-card" title="UDP">
                      <svg viewBox="0 0 50 30" width="36" height="22" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                        <rect width="50" height="30" fill="#0D47A1" />
                        <text x="25" y="20" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif" text-anchor="middle" letterSpacing="0.5">UDP</text>
                      </svg>
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: '#1C1C1E', lineHeight: 1.1 }}>UDP</span>
                        <span style={{ fontSize: '5.5px', fontWeight: '700', color: '#636366', letterSpacing: '0.2px' }}>DEVELOPMENT PARTNERS</span>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="contract-guarantee">
              <Check size={28} style={{ color: 'var(--neon-green)', flexShrink: 0 }} />
              <span>Працюємо офіційно за договором. Ціна фіксується та не змінюється під час виконання робіт.</span>
            </div>
          </section>

          {/* 5.3 FAQ Блок */}
          <section className="faq-section">
            <h2 className="section-title">❓ Популярні питання (FAQ)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                {
                  q: "Які документи необхідні для укладення договору оренди?",
                  a: "Для юридичних осіб необхідні статутні документи, реквізити компанії та підписаний договір. Для фізичних осіб достатньо надати оригінал паспорта, ідентифікаційний код та внести передоплату."
                },
                {
                  q: "Чи входить паливо та робота машиніста у вартість зміни?",
                  a: "Так, уся спецтехніка надається в оренду виключно з висококваліфікованими операторами та повністю заправлена дизельним паливом. Жодних додаткових витрат на ПММ чи оплату праці немає."
                },
                {
                  q: "Як розраховується доставка спецтехніки за межі Києва (КП)?",
                  a: "Транспортування автокранів у межах Києва вже включено у вартість першої зміни. При доставці за КП тариф розраховується за ставкою 50 гривень за кілометр пробігу в обидва боки від межі міста."
                },
                {
                  q: "Чи працюєте ви у нічний час, вихідні та святкові дні?",
                  a: "Компанія Kyiv Crane Pro працює цілодобово, сім днів на тиждень. Ми надаємо автокрани на нічні зміни та у вихідні дні за умови попереднього узгодження для формування графіку операторів."
                },
                {
                  q: "Що робити, якщо роботи затягнулися і потрібно більше часу?",
                  a: "Ви можете легко продовжити оренду крана на додатковий час або наступну зміну. Понаднормова робота понад 8-годинний ліміт оплачується погодинно згідно з тарифом обраної моделі техніки."
                }
              ].map((item, idx) => {
                const isActive = activeFaqIndex === idx;
                return (
                  <div key={idx} className={`faq-item ${isActive ? 'active' : ''}`}>
                    <button 
                      type="button"
                      className="faq-question" 
                      onClick={() => setActiveFaqIndex(isActive ? null : idx)}
                    >
                      <span>{item.q}</span>
                      <ChevronDown size={14} className="faq-arrow" />
                    </button>
                    <div className="faq-answer">
                      <p>{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SEO Text Block */}
          <section className="glass-card seo-section" style={{ marginTop: '20px', padding: '24px' }}>
            <h2 className="section-title" style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#1C1C1E' }}>
              🏗️ Послуги оренди автокранів у Києві та області
            </h2>
            <div className="seo-content" style={{ fontSize: '13px', color: 'var(--text-grey)', lineHeight: '1.6', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p>
                <strong>Kyiv Crane Pro</strong> — ваш надійний партнер у сфері оренди вантажопідйомної спецтехніки. Ми надаємо професійні послуги оренди автокранів у Києві та Київській області для вирішення будівельних, монтажних, логістичних та індустріальних завдань будь-якої складності. Наш власний автопарк включає сучасні телескопічні автокрани провідних світових брендів, таких як <strong>Liebherr, XCMG, Demag та Tadano</strong>.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: windowWidth >= 768 ? '1fr 1fr' : '1fr', gap: '20px', margin: '8px 0' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1C1C1E', marginBottom: '8px' }}>
                    Оренда крана під будь-які завдання:
                  </h3>
                  <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><strong>Маневрені автокрани 16т:</strong> ідеально підходять для приватного будівництва, підйому піноблоків, цегли та перекриттів на невеликих майданчиках.</li>
                    <li><strong>Універсальні крани 25т:</strong> оптимальне рішення для розвантаження металоконструкцій та більшості монтажних робіт.</li>
                    <li><strong>Важкі автокрани 40т та 50т+:</strong> незамінні при встановленні промислового обладнання та перенесенні негабаритних вантажів.</li>
                  </ul>
                </div>
                
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1C1C1E', marginBottom: '8px' }}>
                    Переваги співпраці з нами:
                  </h3>
                  <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><strong>Швидка подача:</strong> власна техніка дозволяє гарантувати прибуття крана на об'єкт від 2 годин.</li>
                    <li><strong>Машиністи-професіонали:</strong> оператори з багаторічним досвідом виконають роботу швидко, точно та безпечно.</li>
                    <li><strong>Офіційно з ПДВ:</strong> повний пакет бухгалтерських документів, підписання договору та фіксована вартість.</li>
                  </ul>
                </div>
              </div>

              <p style={{ margin: 0 }}>
                Ми дбаємо про безпеку роботи на кожному об'єкті: вся техніка проходить регулярні технічні огляди, має діючі дозволи та сертифікати ЧТО/ПТО. Менеджери Kyiv Crane Pro розрахують точну вартість доставки та оренди автокрана за зміну (8 годин) з урахуванням специфіки вашого будівельного майданчика. Замовте безкоштовну консультацію або скористайтеся нашим розумним онлайн-калькулятором для розрахунку вартості оренди спецтехніки просто зараз!
              </p>
            </div>
          </section>

        </main>

        {/* 6. Footer (Подвал экрана) */}
          <footer id="contacts" style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Social Links Row */}
            <div className="footer-social-row" style={{ display: 'flex', justifyContent: 'center', gap: '16px', margin: '4px 0' }}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" style={{ color: 'var(--text-grey)' }} title="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" style={{ color: 'var(--text-grey)' }} title="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="social-link" style={{ color: 'var(--text-grey)' }} title="Telegram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-25deg)' }}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </a>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-grey)' }}>
              © 2026 Оренда автокранів Kyiv-Crane-Pro. Всі права захищені.
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-grey)' }}>
              Розроблено Mobile-First • Premium Industrial System
            </span>
          </footer>
        </>
      )}

        {/* --- INTERACTIVE BOOKING MODAL --- */}
        {bookingCrane && (
          <div className="modal-overlay" onClick={closeBookingModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div className="modal-header">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="modal-title">Швидке бронювання</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-grey)' }}>Автокран {bookingCrane.brand} {bookingCrane.name}</span>
                </div>
                <button className="icon-btn" onClick={closeBookingModal} style={{ width: '32px', height: '32px' }}>
                  <X size={14} />
                </button>
              </div>

              {!isSuccessOpen ? (
                <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Visual specs display inside modal */}
                  <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-input)', padding: '10px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <img src={bookingCrane.image} alt={bookingCrane.name} style={{ width: '70px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{bookingCrane.brand} {bookingCrane.name}</span>
                      <span style={{ fontSize: '12px', color: '#A36B00', fontWeight: 'bold' }}>
                        {calculatorResult.totalCostIncludingVat.toLocaleString()} грн з ПДВ
                      </span>
                    </div>
                  </div>

                  {/* Contact input fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="form-col">
                      <label htmlFor="booking-name">Ваше ім'я</label>
                      <div style={{ position: 'relative' }}>
                        <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-grey)' }} />
                        <input 
                          id="booking-name"
                          type="text" 
                          placeholder="Олексій" 
                          style={{ paddingLeft: '36px' }}
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          required
                        />
                      </div>
                      {nameError && <span style={{ fontSize: '11px', color: '#FF3D00' }}>{nameError}</span>}
                    </div>

                    <div className="form-col">
                      <label htmlFor="booking-phone">Контактний телефон</label>
                      <div style={{ position: 'relative' }}>
                        <PhoneCall size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-grey)' }} />
                        <input 
                          id="booking-phone"
                          type="tel" 
                          placeholder="+380 97 123 4567" 
                          style={{ paddingLeft: '36px' }}
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          required
                        />
                      </div>
                      {phoneError && <span style={{ fontSize: '11px', color: '#FF3D00' }}>{phoneError}</span>}
                    </div>

                    <div className="form-col">
                      <label htmlFor="booking-address">Адреса подачі автокрана</label>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-grey)' }} />
                        <input 
                          id="booking-address"
                          type="text" 
                          placeholder="Адреса доставки крана..." 
                          style={{ paddingLeft: '36px' }}
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-col">
                      <label htmlFor="booking-date">Бажана дата роботи</label>
                      <input 
                        id="booking-date"
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Order Action Button */}
                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '4px' }}>
                    Підтвердити замовлення
                  </button>
                </form>
              ) : (
                /* Success Booking State Screen */
                <div className="success-screen">
                  <div className="success-icon-glow">
                    <Check size={32} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Замовлення прийнято!</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-grey)', lineHeight: '1.5' }}>
                    Дякуємо, <strong>{contactName}</strong>. Заявка на оренду автокрана <strong>{bookingCrane.brand} {bookingCrane.name}</strong> на <strong>{selectedDate}</strong> успішно сформована.
                  </p>
                  <div className="glass-card" style={{ width: '100%', padding: '12px', border: '1px solid rgba(57, 255, 20, 0.15)', background: 'rgba(57, 255, 20, 0.02)', textAlign: 'left', fontSize: '12px' }}>
                    <strong>Деталі замовлення:</strong>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span>Час оренди:</span>
                      <span>{calcHours} год (1 зміна)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span>Доставка:</span>
                      <span>{insideKp ? 'В межах КП' : `За КП (${calcDistance} км)`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', fontWeight: 'bold' }}>
                      <span>Сума (з ПДВ):</span>
                      <span style={{ color: 'var(--primary-orange)' }}>{calculatorResult.totalCostIncludingVat.toLocaleString()} грн</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-grey)' }}>
                    Менеджер зв'яжеться з вами протягом 5 хвилин для підтвердження та надсилання договору.
                  </p>
                  <button className="btn-secondary" onClick={closeBookingModal} style={{ width: '100%' }}>
                    Закрити
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Burger Menu Modal */}
        {isBurgerOpen && (
          <div className="modal-overlay" onClick={() => setIsBurgerOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ height: 'auto', maxHeight: '80%' }}>
              <div className="modal-header">
                <span className="modal-title">Навігація</span>
                <button className="icon-btn" onClick={() => setIsBurgerOpen(false)} style={{ width: '32px', height: '32px' }}>
                  <X size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px 0' }}>
                {/* Location Selector in Burger Menu */}
                <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--text-grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 Регіон оренди:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['Київ та область', 'Київ (Центр)', 'Бровари', 'Бориспіль', 'Ірпінь'].map((city) => (
                      <button 
                        key={city}
                        type="button"
                        onClick={() => {
                          setSelectedCity(city);
                          setIsBurgerOpen(false);
                        }}
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: '50px', 
                          fontSize: '12px', 
                          fontWeight: '700', 
                          border: '1px solid',
                          borderColor: selectedCity === city ? 'var(--primary-orange)' : 'var(--border-color)',
                          background: selectedCity === city ? '#FFF9E6' : '#FFFFFF',
                          color: selectedCity === city ? '#A36B00' : 'var(--text-grey)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
                <div 
                  onClick={() => { scrollToSection('catalog', 'catalog'); setIsBurgerOpen(false); }} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', cursor: 'pointer', background: activeTab === 'catalog' ? 'rgba(255, 184, 0, 0.1)' : 'transparent', transition: 'all 0.2s ease' }}
                >
                  <CraneIcon size={18} color={activeTab === 'catalog' ? '#A36B00' : 'var(--text-grey)'} />
                  <span style={{ fontSize: '15px', fontWeight: '700', color: activeTab === 'catalog' ? '#A36B00' : '#1C1C1E' }}>Крани</span>
                </div>
                <div 
                  onClick={() => { scrollToSection('calc', 'calc'); setIsBurgerOpen(false); }} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', cursor: 'pointer', background: activeTab === 'calc' ? 'rgba(255, 184, 0, 0.1)' : 'transparent', transition: 'all 0.2s ease' }}
                >
                  <Calculator size={18} style={{ color: activeTab === 'calc' ? '#A36B00' : 'var(--text-grey)' }} />
                  <span style={{ fontSize: '15px', fontWeight: '700', color: activeTab === 'calc' ? '#A36B00' : '#1C1C1E' }}>Ціни</span>
                </div>
                <div 
                  onClick={() => { scrollToSection('works', 'works'); setIsBurgerOpen(false); }} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', cursor: 'pointer', background: activeTab === 'works' ? 'rgba(255, 184, 0, 0.1)' : 'transparent', transition: 'all 0.2s ease' }}
                >
                  <Camera size={18} style={{ color: activeTab === 'works' ? '#A36B00' : 'var(--text-grey)' }} />
                  <span style={{ fontSize: '15px', fontWeight: '700', color: activeTab === 'works' ? '#A36B00' : '#1C1C1E' }}>Роботи</span>
                </div>
                <div 
                  onClick={() => { scrollToSection('team', 'team'); setIsBurgerOpen(false); }} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', cursor: 'pointer', background: activeTab === 'team' ? 'rgba(255, 184, 0, 0.1)' : 'transparent', transition: 'all 0.2s ease' }}
                >
                  <Users size={18} style={{ color: activeTab === 'team' ? '#A36B00' : 'var(--text-grey)' }} />
                  <span style={{ fontSize: '15px', fontWeight: '700', color: activeTab === 'team' ? '#A36B00' : '#1C1C1E' }}>Команда</span>
                </div>
                <div 
                  onClick={() => { scrollToSection('reviews', 'reviews'); setIsBurgerOpen(false); }} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', cursor: 'pointer', background: activeTab === 'reviews' ? 'rgba(255, 184, 0, 0.1)' : 'transparent', transition: 'all 0.2s ease' }}
                >
                  <Star size={18} style={{ color: activeTab === 'reviews' ? '#A36B00' : 'var(--text-grey)' }} />
                  <span style={{ fontSize: '15px', fontWeight: '700', color: activeTab === 'reviews' ? '#A36B00' : '#1C1C1E' }}>Відгуки</span>
                </div>
                <div 
                  onClick={() => { scrollToSection('blog', 'blog'); setIsBurgerOpen(false); }} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', cursor: 'pointer', background: activeTab === 'blog' ? 'rgba(255, 184, 0, 0.1)' : 'transparent', transition: 'all 0.2s ease' }}
                >
                  <Newspaper size={18} style={{ color: activeTab === 'blog' ? '#A36B00' : 'var(--text-grey)' }} />
                  <span style={{ fontSize: '15px', fontWeight: '700', color: activeTab === 'blog' ? '#A36B00' : '#1C1C1E' }}>Блог</span>
                </div>
                <div 
                  onClick={() => { scrollToSection('contacts', 'contacts'); setIsBurgerOpen(false); }} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', cursor: 'pointer', background: activeTab === 'contacts' ? 'rgba(255, 184, 0, 0.1)' : 'transparent', transition: 'all 0.2s ease' }}
                >
                  <Phone size={18} style={{ color: activeTab === 'contacts' ? '#A36B00' : 'var(--text-grey)' }} />
                  <span style={{ fontSize: '15px', fontWeight: '700', color: activeTab === 'contacts' ? '#A36B00' : '#1C1C1E' }}>Контакти</span>
                </div>

                <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }} />

                <a 
                  href="tel:+380441234567" 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', background: 'linear-gradient(135deg, #FFD500 0%, #FFB800 100%)', textDecoration: 'none', color: '#121214', justifyContent: 'center', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 12px rgba(255, 184, 0, 0.2)' }}
                >
                  <Phone size={16} />
                  <span>Зв\'язатися з диспетчером</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation Tab Bar (Telegram Bot style / LUN style) */}
        <nav className="bottom-tab-bar">
          <button 
            type="button"
            className={`tab-item ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => scrollToSection('catalog', 'catalog')}
          >
            <CraneIcon size={18} className="tab-icon" />
            <span className="tab-label">Крани</span>
          </button>
          <button 
            type="button"
            className={`tab-item ${activeTab === 'calc' ? 'active' : ''}`}
            onClick={() => scrollToSection('calc', 'calc')}
          >
            <Calculator size={18} className="tab-icon" />
            <span className="tab-label">Ціни</span>
          </button>
          <button 
            type="button"
            className={`tab-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => scrollToSection('reviews', 'reviews')}
          >
            <Star size={18} className="tab-icon" />
            <span className="tab-label">Відгуки</span>
          </button>
          <button 
            type="button"
            className={`tab-item ${activeTab === 'blog' ? 'active' : ''}`}
            onClick={() => scrollToSection('blog', 'blog')}
          >
            <Newspaper size={18} className="tab-icon" />
            <span className="tab-label">Блог</span>
          </button>
          <button 
            type="button"
            className={`tab-item ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => scrollToSection('contacts', 'contacts')}
          >
            <Phone size={18} className="tab-icon" />
            <span className="tab-label">Контакти</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
