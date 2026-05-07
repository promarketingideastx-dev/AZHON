export interface Subcategory {
  id: string;
  i18nKey: string;
}

export interface Category {
  id: string;
  i18nKey: string;
  icon: string;
  image: string;
  requires18Plus?: boolean;
  isFeaturedOnHome?: boolean;
  subcategories: Subcategory[];
}

export const CATALOG_CATEGORIES: Category[] = [
  {
    id: 'cell_phones',
    i18nKey: 'categories.cell_phones.title',
    icon: '📱',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
    isFeaturedOnHome: true,
    subcategories: [
      { id: 'smartphones', i18nKey: 'categories.cell_phones.smartphones' },
      { id: 'accessories', i18nKey: 'categories.cell_phones.accessories' },
      { id: 'smartwatches', i18nKey: 'categories.cell_phones.smartwatches' },
      { id: 'spare_parts', i18nKey: 'categories.cell_phones.spare_parts' },
      { id: 'landline', i18nKey: 'categories.cell_phones.landline' },
      { id: 'radios', i18nKey: 'categories.cell_phones.radios' },
    ]
  },
  {
    id: 'electronics',
    i18nKey: 'categories.electronics.title',
    icon: '📺',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=800&auto=format&fit=crop',
    isFeaturedOnHome: true,
    subcategories: [
      { id: 'televisions', i18nKey: 'categories.electronics.televisions' },
      { id: 'audio', i18nKey: 'categories.electronics.audio' },
      { id: 'cameras', i18nKey: 'categories.electronics.cameras' },
      { id: 'tv_accessories', i18nKey: 'categories.electronics.tv_accessories' },
      { id: 'streaming', i18nKey: 'categories.electronics.streaming' },
      { id: 'projectors', i18nKey: 'categories.electronics.projectors' },
    ]
  },
  {
    id: 'computing',
    i18nKey: 'categories.computing.title',
    icon: '💻',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop',
    isFeaturedOnHome: true,
    subcategories: [
      { id: 'laptops', i18nKey: 'categories.computing.laptops' },
      { id: 'desktops', i18nKey: 'categories.computing.desktops' },
      { id: 'components', i18nKey: 'categories.computing.components' },
      { id: 'peripherals', i18nKey: 'categories.computing.peripherals' },
      { id: 'networking', i18nKey: 'categories.computing.networking' },
      { id: 'storage', i18nKey: 'categories.computing.storage' },
    ]
  },
  {
    id: 'home',
    i18nKey: 'categories.home.title',
    icon: '🛋️',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop',
    isFeaturedOnHome: true,
    subcategories: [
      { id: 'appliances', i18nKey: 'categories.home.appliances' },
      { id: 'furniture', i18nKey: 'categories.home.furniture' },
      { id: 'kitchen', i18nKey: 'categories.home.kitchen' },
      { id: 'decoration', i18nKey: 'categories.home.decoration' },
      { id: 'garden', i18nKey: 'categories.home.garden' },
    ]
  },
  {
    id: 'clothing',
    i18nKey: 'categories.clothing.title',
    icon: '👕',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    isFeaturedOnHome: true,
    subcategories: [
      { id: 'men', i18nKey: 'categories.clothing.men' },
      { id: 'women', i18nKey: 'categories.clothing.women' },
      { id: 'kids', i18nKey: 'categories.clothing.kids' },
      { id: 'footwear', i18nKey: 'categories.clothing.footwear' },
      { id: 'accessories', i18nKey: 'categories.clothing.accessories' },
    ]
  },
  {
    id: 'beauty',
    i18nKey: 'categories.beauty.title',
    icon: '✨',
    image: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?q=80&w=800&auto=format&fit=crop',
    isFeaturedOnHome: true,
    subcategories: [
      { id: 'makeup', i18nKey: 'categories.beauty.makeup' },
      { id: 'personal_care', i18nKey: 'categories.beauty.personal_care' },
      { id: 'perfumes', i18nKey: 'categories.beauty.perfumes' },
    ]
  },
  {
    id: 'sports',
    i18nKey: 'categories.sports.title',
    icon: '⚽',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=800&auto=format&fit=crop',
    isFeaturedOnHome: true,
    subcategories: [
      { id: 'fitness', i18nKey: 'categories.sports.fitness' },
      { id: 'cycling', i18nKey: 'categories.sports.cycling' },
      { id: 'camping', i18nKey: 'categories.sports.camping' },
      { id: 'team_sports', i18nKey: 'categories.sports.team_sports' },
      { id: 'fishing', i18nKey: 'categories.sports.fishing' },
      { id: 'swimming', i18nKey: 'categories.sports.swimming' },
    ]
  },
  {
    id: 'vehicles',
    i18nKey: 'categories.vehicles.title',
    icon: '🚗',
    image: 'https://images.unsplash.com/photo-1606571556947-6b4dcb833f2c?q=80&w=800&auto=format&fit=crop',
    isFeaturedOnHome: true,
    subcategories: [
      { id: 'cars', i18nKey: 'categories.vehicles.cars' },
      { id: 'motorcycles', i18nKey: 'categories.vehicles.motorcycles' },
      { id: 'parts', i18nKey: 'categories.vehicles.parts' },
      { id: 'accessories', i18nKey: 'categories.vehicles.accessories' },
    ]
  },
  {
    id: 'toys',
    i18nKey: 'categories.toys.title',
    icon: '🧸',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=800&auto=format&fit=crop',
    subcategories: [
      { id: 'action_figures', i18nKey: 'categories.toys.action_figures' },
      { id: 'board_games', i18nKey: 'categories.toys.board_games' },
      { id: 'plush_toys', i18nKey: 'categories.toys.plush_toys' },
    ]
  },
  {
    id: 'books',
    i18nKey: 'categories.books.title',
    icon: '📚',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
    subcategories: [
      { id: 'physical_books', i18nKey: 'categories.books.physical_books' },
      { id: 'magazines', i18nKey: 'categories.books.magazines' },
      { id: 'ebooks', i18nKey: 'categories.books.ebooks' },
    ]
  },
  {
    id: 'music_movies',
    i18nKey: 'categories.music_movies.title',
    icon: '🎬',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop',
    subcategories: [
      { id: 'music', i18nKey: 'categories.music_movies.music' },
      { id: 'movies', i18nKey: 'categories.music_movies.movies' },
      { id: 'series', i18nKey: 'categories.music_movies.series' },
    ]
  },
  {
    id: 'musical_instruments',
    i18nKey: 'categories.musical_instruments.title',
    icon: '🎸',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop',
    subcategories: [
      { id: 'guitars', i18nKey: 'categories.musical_instruments.guitars' },
      { id: 'keyboards', i18nKey: 'categories.musical_instruments.keyboards' },
      { id: 'pro_audio', i18nKey: 'categories.musical_instruments.pro_audio' },
    ]
  },
  {
    id: 'pets',
    i18nKey: 'categories.pets.title',
    icon: '🐾',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop',
    subcategories: [
      { id: 'food', i18nKey: 'categories.pets.food' },
      { id: 'accessories', i18nKey: 'categories.pets.accessories' },
      { id: 'hygiene', i18nKey: 'categories.pets.hygiene' },
      { id: 'beds_transport', i18nKey: 'categories.pets.beds_transport' },
      { id: 'toys', i18nKey: 'categories.pets.toys' },
      { id: 'health', i18nKey: 'categories.pets.health' },
    ]
  },
  {
    id: 'intimate_wellness',
    i18nKey: 'categories.intimate_wellness.title',
    icon: '🔞',
    image: 'https://images.unsplash.com/photo-1518085250893-ec9cf43f550d?q=80&w=800&auto=format&fit=crop',
    requires18Plus: true,
    subcategories: [
      { id: 'wellness', i18nKey: 'categories.intimate_wellness.wellness' },
      { id: 'care', i18nKey: 'categories.intimate_wellness.care' },
      { id: 'accessories', i18nKey: 'categories.intimate_wellness.accessories' },
    ]
  }
];
