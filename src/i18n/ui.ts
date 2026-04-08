export const languages = {
  cs: 'Česky',
  en: 'English',
} as const;

export const defaultLang = 'cs' as const;

export type Lang = keyof typeof languages;

export const ui = {
  cs: {
    'nav.home': 'Úvod',
    'nav.amenities': 'Vybavení',
    'nav.pricing': 'Ceník',
    'nav.gallery': 'Galerie',
    'nav.availability': 'Obsazenost',
    'nav.reservation': 'Rezervace',
    'nav.trips': 'Výlety',
    'nav.contact': 'Kontakt',
    'nav.rules': 'Provozní řád',

    'hero.title': 'Stellplatz Petřkovice u Lurdy',
    'hero.subtitle': 'Klidné parkování pro obytné vozy s výhledem na Beskydy',
    'hero.cta': 'Rezervovat místo',
    'hero.gps': 'GPS: 49.5833° N, 17.9667° E',

    'about.title': 'O nás',
    'about.text': 'Rodinný stellplatz na okraji obce Petřkovice u Starého Jičína nabízí klidné místo pro obytné vozy a karavany. Rovné stání s krásným výhledem na panorama Beskyd, možnost připojení k elektřině, napuštění vody a vypuštění šedé i černé vody.',

    'amenities.title': 'Vybavení',
    'amenities.electricity': 'Elektřina',
    'amenities.electricity.desc': 'Připojení k elektřině 230V',
    'amenities.water': 'Pitná voda',
    'amenities.water.desc': 'Možnost napuštění nádrže pitnou vodou',
    'amenities.greywater': 'Šedá voda',
    'amenities.greywater.desc': 'Vypuštění šedé vody (odpadní z kuchyně a sprchy)',
    'amenities.blackwater': 'Černá voda',
    'amenities.blackwater.desc': 'Vypuštění chemického WC',
    'amenities.parking': 'Rovné stání',
    'amenities.parking.desc': 'Zpevněná rovná plocha pro pohodlné parkování',
    'amenities.view': 'Výhled',
    'amenities.view.desc': 'Panoramatický výhled na Beskydy a okolní krajinu',

    'pricing.title': 'Ceník',
    'pricing.perNight': 'Stání / noc',
    'pricing.electricity': 'Elektřina',
    'pricing.water': 'Voda',
    'pricing.waste': 'Vypuštění odpadní vody',
    'pricing.included': 'v ceně',

    'gallery.title': 'Galerie',
    'gallery.coming': 'Stellplatz se připravuje — další fotky brzy!',

    'availability.title': 'Obsazenost',
    'availability.available': 'Volno',
    'availability.occupied': 'Obsazeno',

    'reservation.title': 'Rezervace',
    'reservation.name': 'Jméno a příjmení',
    'reservation.email': 'E-mail',
    'reservation.phone': 'Telefon',
    'reservation.arrival': 'Datum příjezdu',
    'reservation.departure': 'Datum odjezdu',
    'reservation.vehicles': 'Počet vozidel',
    'reservation.type': 'Typ vozidla',
    'reservation.type.motorhome': 'Obytný vůz',
    'reservation.type.caravan': 'Karavan',
    'reservation.electricity': 'Potřebuji elektřinu',
    'reservation.note': 'Poznámka',
    'reservation.submit': 'Odeslat poptávku',
    'reservation.success': 'Děkujeme! Vaši poptávku jsme přijali. Ozveme se vám co nejdříve.',
    'reservation.disclaimer': 'Odeslání formuláře není potvrzením rezervace. Budeme vás kontaktovat e-mailem.',

    'trips.title': 'Tipy na výlety',
    'trips.distance': 'Vzdálenost',
    'trips.more': 'Zjistit více',

    'contact.title': 'Kontakt',
    'contact.address': 'Adresa',
    'contact.phone': 'Telefon',
    'contact.email': 'E-mail',
    'contact.directions': 'Příjezdová trasa',

    'map.title': 'Kde nás najdete',

    'footer.rights': 'Všechna práva vyhrazena.',
    'footer.rules': 'Provozní řád',
  },
  en: {
    'nav.home': 'Home',
    'nav.amenities': 'Amenities',
    'nav.pricing': 'Pricing',
    'nav.gallery': 'Gallery',
    'nav.availability': 'Availability',
    'nav.reservation': 'Reservation',
    'nav.trips': 'Trips',
    'nav.contact': 'Contact',
    'nav.rules': 'Rules',

    'hero.title': 'Stellplatz Petřkovice u Lurdy',
    'hero.subtitle': 'Peaceful motorhome parking with Beskydy mountain views',
    'hero.cta': 'Book a spot',
    'hero.gps': 'GPS: 49.5833° N, 17.9667° E',

    'about.title': 'About us',
    'about.text': 'A family-run stellplatz on the edge of Petřkovice village near Starý Jičín, offering a peaceful spot for motorhomes and caravans. Level parking with beautiful Beskydy mountain panorama, electricity hookup, fresh water, and grey/black water disposal.',

    'amenities.title': 'Amenities',
    'amenities.electricity': 'Electricity',
    'amenities.electricity.desc': '230V power hookup',
    'amenities.water': 'Fresh water',
    'amenities.water.desc': 'Fill up your fresh water tank',
    'amenities.greywater': 'Grey water',
    'amenities.greywater.desc': 'Grey water disposal (kitchen & shower)',
    'amenities.blackwater': 'Black water',
    'amenities.blackwater.desc': 'Chemical toilet disposal',
    'amenities.parking': 'Level parking',
    'amenities.parking.desc': 'Paved level surface for comfortable parking',
    'amenities.view': 'Scenic view',
    'amenities.view.desc': 'Panoramic view of Beskydy mountains and countryside',

    'pricing.title': 'Pricing',
    'pricing.perNight': 'Parking / night',
    'pricing.electricity': 'Electricity',
    'pricing.water': 'Water',
    'pricing.waste': 'Waste water disposal',
    'pricing.included': 'included',

    'gallery.title': 'Gallery',
    'gallery.coming': 'Our stellplatz is being prepared — more photos coming soon!',

    'availability.title': 'Availability',
    'availability.available': 'Available',
    'availability.occupied': 'Occupied',

    'reservation.title': 'Reservation',
    'reservation.name': 'Full name',
    'reservation.email': 'Email',
    'reservation.phone': 'Phone',
    'reservation.arrival': 'Arrival date',
    'reservation.departure': 'Departure date',
    'reservation.vehicles': 'Number of vehicles',
    'reservation.type': 'Vehicle type',
    'reservation.type.motorhome': 'Motorhome',
    'reservation.type.caravan': 'Caravan',
    'reservation.electricity': 'I need electricity',
    'reservation.note': 'Note',
    'reservation.submit': 'Send inquiry',
    'reservation.success': 'Thank you! We have received your inquiry and will get back to you shortly.',
    'reservation.disclaimer': 'Submitting this form does not confirm a reservation. We will contact you by email.',

    'trips.title': 'Trips & Activities',
    'trips.distance': 'Distance',
    'trips.more': 'Learn more',

    'contact.title': 'Contact',
    'contact.address': 'Address',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.directions': 'Directions',

    'map.title': 'How to find us',

    'footer.rights': 'All rights reserved.',
    'footer.rules': 'Rules & Regulations',
  },
} as const;

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in languages) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return ui[lang][key] ?? ui[defaultLang][key] ?? key;
  };
}

export function getLocalizedPath(path: string, lang: Lang): string {
  if (lang === defaultLang) return path;
  return `/${lang}${path}`;
}
