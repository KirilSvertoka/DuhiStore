import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ru' | 'be';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ru: {
    catalog: 'Каталог',
    about: 'О нас',
    reviews: 'Отзывы',
    contacts: 'Контакты',
    cart: 'Корзина',
    addToCart: 'В корзину',
    checkout: 'Оформить заказ',
    emptyCart: 'Ваша корзина пуста',
    total: 'Итого',
    currency: 'BYN',
    backToCatalog: 'Назад в каталог',
    notFound: 'Товар не найден',
    search: 'Поиск ароматов...',
    allBrands: 'Все бренды',
    sortNameAsc: 'Название (А-Я)',
    sortNameDesc: 'Название (Я-А)',
    sortPriceAsc: 'Сначала дешевле',
    sortPriceDesc: 'Сначала дороже',
    genderAll: 'Все',
    genderMale: 'Мужские',
    genderFemale: 'Женские',
    genderUnisex: 'Унисекс',
    notes: 'Ноты',
    topNotes: 'Верхние ноты',
    heartNotes: 'Средние ноты',
    baseNotes: 'Базовые ноты',
    viewAll: 'Смотреть все ароматы',
    homeTitle: 'Искусство минимализма',
    homeSubtitle: 'Найдите свой идеальный аромат.',
    shopCollection: 'В каталог',
    scentFamilies: 'Семейства ароматов',
    familyFloral: 'Цветочные',
    familyOriental: 'Восточные',
    familyWoody: 'Древесные',
    familyFresh: 'Свежие',
    familyCitrus: 'Цитрусовые',
    familySpicy: 'Пряные',
    familyLeather: 'Кожаные',
    familyGourmand: 'Гурманские',
    allFamilies: 'Все семейства',
    leaveReview: 'Оставить отзыв',
    name: 'Имя',
    rating: 'Оценка',
    comment: 'Ваш отзыв',
    submit: 'Отправить',
    reviewSuccess: 'Отзыв отправлен и ожидает модерации',
    noReviews: 'Пока нет отзывов об этом товаре',
  },
  be: {
    catalog: 'Каталог',
    about: 'Пра нас',
    reviews: 'Водгукі',
    contacts: 'Кантакты',
    cart: 'Кошык',
    addToCart: 'У кошык',
    checkout: 'Аформіць заказ',
    emptyCart: 'Ваш кошык пусты',
    total: 'Усяго',
    currency: 'BYN',
    backToCatalog: 'Назад у каталог',
    notFound: 'Тавар не знойдзены',
    search: 'Пошук водараў...',
    allBrands: 'Усе брэнды',
    sortNameAsc: 'Назва (А-Я)',
    sortNameDesc: 'Назва (Я-А)',
    sortPriceAsc: 'Спачатку танней',
    sortPriceDesc: 'Спачатку даражэй',
    genderAll: 'Усе',
    genderMale: 'Мужчынскія',
    genderFemale: 'Жаночыя',
    genderUnisex: 'Унісекс',
    notes: 'Ноты',
    topNotes: 'Верхнія ноты',
    heartNotes: 'Сярэднія ноты',
    baseNotes: 'Базавыя ноты',
    viewAll: 'Глядзець усе водары',
    homeTitle: 'Мастацтва мінімалізму',
    homeSubtitle: 'Знайдзіце свой ідэальны водар.',
    shopCollection: 'У каталог',
    scentFamilies: 'Сямействы водараў',
    familyFloral: 'Кветкавыя',
    familyOriental: 'Усходнія',
    familyWoody: 'Драўняныя',
    familyFresh: 'Свежыя',
    familyCitrus: 'Цытрусавыя',
    familySpicy: 'Пряныя',
    familyLeather: 'Скураныя',
    familyGourmand: 'Гурманскія',
    allFamilies: 'Усе сямействы',
    leaveReview: 'Пакінуць водгук',
    name: 'Імя',
    rating: 'Ацэнка',
    comment: 'Ваш водгук',
    submit: 'Адправіць',
    reviewSuccess: 'Водгук адпраўлены і чакае мадэрацыі',
    noReviews: 'Пакуль няма водгукаў аб гэтым тавары',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'ru';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
