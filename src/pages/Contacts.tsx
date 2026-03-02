import { motion } from 'motion/react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../components/LanguageProvider';

export default function Contacts() {
  const { language } = useLanguage();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-12 px-4 sm:px-6 lg:px-8 py-12"
    >
      <Helmet>
        <title>{language === 'ru' ? 'Контакты' : 'Кантакты'} | Scentique</title>
        <meta name="description" content={language === 'ru' ? 'Свяжитесь с нами.' : 'Звяжыцеся з намі.'} />
      </Helmet>
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif text-stone-900 dark:text-stone-100">
          {language === 'ru' ? 'Свяжитесь с нами' : 'Звяжыцеся з намі'}
        </h1>
        <p className="text-stone-500 dark:text-stone-400">
          {language === 'ru' ? 'Мы будем рады ответить на ваши вопросы.' : 'Мы будзем рады адказаць на вашы пытанні.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
          <div className="w-12 h-12 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          </div>
          <h3 className="font-medium text-stone-900 dark:text-stone-100 mb-1">Email</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">hello@scentique.com</p>
        </div>

        <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
          <div className="w-12 h-12 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center mb-4">
            <Phone className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          </div>
          <h3 className="font-medium text-stone-900 dark:text-stone-100 mb-1">
            {language === 'ru' ? 'Телефон' : 'Тэлефон'}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">+375 (29) 123-45-67</p>
        </div>

        <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
          <div className="w-12 h-12 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          </div>
          <h3 className="font-medium text-stone-900 dark:text-stone-100 mb-1">
            {language === 'ru' ? 'Студия' : 'Студыя'}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {language === 'ru' ? 'ул. Парфюмерная 123' : 'вул. Парфумерная 123'}<br/>
            {language === 'ru' ? 'Минск, Беларусь' : 'Мінск, Беларусь'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
