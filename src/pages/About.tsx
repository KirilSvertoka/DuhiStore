import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../components/LanguageProvider';

export default function About() {
  const { language } = useLanguage();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-16 px-4 sm:px-6 lg:px-8 py-12"
    >
      <Helmet>
        <title>{language === 'ru' ? 'О нас' : 'Пра нас'} | Arhetip</title>
        <meta name="description" content={language === 'ru' ? 'Путешествие в мир высокой парфюмерии.' : 'Падарожжа ў свет высокай парфумерыі.'} />
        <link rel="canonical" href={`${window.location.origin}/about`} />
      </Helmet>
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif text-brand-light">
          {language === 'ru' ? 'Наша история' : 'Наша гісторыя'}
        </h1>
        <p className="text-brand-muted max-w-2xl mx-auto">
          {language === 'ru' 
            ? 'Путешествие в мир высокой парфюмерии, где мы собираем самые изысканные ароматы для современных людей.' 
            : 'Падарожжа ў свет высокай парфумерыі, дзе мы збіраем самыя вытанчаныя водары для сучасных людзей.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="aspect-square rounded-3xl overflow-hidden bg-brand-bg">
          <img 
            src="https://101beat.com/_next/image?url=https%3A%2F%2Fglobal.s3.cloud.ru%2Fbeats-bucket%2FF3t6qt0P8Av6JHVo6w8rrdRH1B9RJhtdNEYvyxox9ZWpW2YrZbHznXgTVXcxRsFCtPUhV1WA0njpvAptKfQDHe8yZGOrvlNdJffhrCkKa6d6QFD1CX2fZ6ujrIEcRgy3ZYGrKusrHv6dEW5wCB8B7ZrtEI2KxWhZs7tNwrzhrbutDSzT32djs07odgcb1eCAmR2grrIjYLRCZ6aLeJTtIVYhlBi7mPpZdMvkpWlzWLrCXJMJXXVrrXYPeRJCmypO.jpg&w=828&q=75" 
            alt="Perfumery Studio" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-serif text-brand-light">
            {language === 'ru' ? 'Искусство выбора' : 'Мастацтва выбару'}
          </h2>
          <p className="text-brand-muted leading-relaxed font-light">
            {language === 'ru'
              ? 'Основанный в 2020 году, Arhetip родился из страсти к нишевой парфюмерии. Мы верим, что аромат — это больше, чем просто запах. Это невидимый аксессуар, триггер воспоминаний и глубокое выражение личности.'
              : 'Заснаваны ў 2020 годзе, Arhetip нарадзіўся з запалу да нішавай парфумерыі. Мы верым, што водар — гэта больш, чым проста пах. Гэта нябачны аксэсуар, трыгер успамінаў і глыбокае выяўленне асобы.'}
          </p>
          <p className="text-brand-muted leading-relaxed font-light">
            {language === 'ru'
              ? 'Наша коллекция тщательно отобрана. Мы путешествуем по миру, чтобы найти независимых парфюмеров, которые ставят качество ингредиентов и инновационные композиции выше массовой привлекательности. Каждый флакон в нашем магазине был протестирован и полюблен нашей командой.'
              : 'Наша калекцыя старанна адабрана. Мы падарожнічаем па свеце, каб знайсці незалежных парфумераў, якія ставяць якасць інгрэдыентаў і інавацыйныя кампазіцыі вышэй за масавую прывабнасць. Кожны флакон у нашай краме быў пратэставаны і ўпадабаны нашай камандай.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-12 border-t border-brand-border">
        <div className="space-y-2">
          <h3 className="text-3xl font-serif text-brand-light">50+</h3>
          <p className="text-sm uppercase tracking-wider text-brand-muted">
            {language === 'ru' ? 'Уникальных ароматов' : 'Унікальных водараў'}
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-serif text-brand-light">12</h3>
          <p className="text-sm uppercase tracking-wider text-brand-muted">
            {language === 'ru' ? 'Нишевых брендов' : 'Нішавых брэндаў'}
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-serif text-brand-light">10k+</h3>
          <p className="text-sm uppercase tracking-wider text-brand-muted">
            {language === 'ru' ? 'Счастливых клиентов' : 'Шчаслівых кліентаў'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
