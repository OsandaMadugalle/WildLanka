import { useLanguage } from '../context/LanguageContext';

// Function to translate database content based on language
export const translateDatabaseContent = (content, language) => {
  if (!content) return content;
  
  // If content is an object with language-specific fields
  if (typeof content === 'object' && content[language]) {
    return content[language];
  }
  
  // If content is an object with language-specific fields (common pattern)
  if (typeof content === 'object' && content[`${language}_text`]) {
    return content[`${language}_text`];
  }
  
  // If content is an object with language-specific fields (another common pattern)
  if (typeof content === 'object' && content[`text_${language}`]) {
    return content[`text_${language}`];
  }
  
  // If content has a translations field
  if (typeof content === 'object' && content.translations && content.translations[language]) {
    return content.translations[language];
  }
  
  // If content has a localized field
  if (typeof content === 'object' && content.localized && content.localized[language]) {
    return content.localized[language];
  }
  
  // Fallback to original content or English
  if (typeof content === 'object' && content.en) {
    return content.en;
  }
  
  if (typeof content === 'object' && content.english) {
    return content.english;
  }
  
  // If no translation found, return the original content
  return content;
};

// Hook for translating database content
export const useDatabaseTranslation = () => {
  const { currentLanguage, t } = useLanguage();
  
  const translateDB = (content) => {
    return translateDatabaseContent(content, currentLanguage);
  };
  
  return { translateDB, currentLanguage, t };
};

// Function to translate common database fields
export const translateCommonFields = (data, language) => {
  if (!data || typeof data !== 'object') return data;
  
  const translated = { ...data };
  
  // Common translatable fields
  const translatableFields = [
    'name', 'title', 'description', 'message', 'comment', 'notes',
    'address', 'requirements', 'included', 'notIncluded'
  ];
  
  translatableFields.forEach(field => {
    if (translated[field]) {
      translated[field] = translateDatabaseContent(translated[field], language);
    }
  });
  
  return translated;
};

// Function to translate arrays of database objects
export const translateArray = (array, language) => {
  if (!Array.isArray(array)) return array;
  
  return array.map(item => translateCommonFields(item, language));
};

// Function to translate status values
export const translateStatus = (status, language) => {
  const statusTranslations = {
    en: {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
      cancelled: 'Cancelled',
      active: 'Active',
      inactive: 'Inactive'
    },
    si: {
      pending: 'පොරොත්තු වෙමින්',
      approved: 'අනුමත කරන ලදී',
      rejected: 'ප්‍රතික්ෂේප කරන ලදී',
      completed: 'සම්පූර්ණ කරන ලදී',
      cancelled: 'අවලංගු කරන ලදී',
      active: 'සක්‍රිය',
      inactive: 'අක්‍රිය'
    },
    ta: {
      pending: 'நிலுவையில்',
      approved: 'அங்கீகரிக்கப்பட்டது',
      rejected: 'நிராகரிக்கப்பட்டது',
      completed: 'முடிக்கப்பட்டது',
      cancelled: 'ரத்து செய்யப்பட்டது',
      active: 'செயலில்',
      inactive: 'செயலற்ற'
    }
  };
  
  return statusTranslations[language]?.[status] || status;
};

// Function to translate role values
export const translateRole = (role, language) => {
  const roleTranslations = {
    en: {
      admin: 'Admin',
      driver: 'Driver',
      tour_guide: 'Tour Guide',
      customer: 'Customer'
    },
    si: {
      admin: 'පරිපාලක',
      driver: 'රියදුරු',
      tour_guide: 'සංචාර මාර්ගෝපදේශක',
      customer: 'පාරිභෝගික'
    },
    ta: {
      admin: 'நிர்வாகி',
      driver: 'ஓட்டுநர்',
      tour_guide: 'சுற்றுலா வழிகாட்டி',
      customer: 'வாடிக்கையாளர்'
    }
  };
  
  return roleTranslations[language]?.[role] || role;
};
