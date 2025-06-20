// src/contexts/i18nContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import enTranslations from '@/i18n/en.json';
import deTranslations from '@/i18n/de.json';

export type SupportedLanguage = 'en' | 'de';

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string, params?: Record<string, any>) => string;
  isLoading: boolean;
}

const translations = {
  en: enTranslations,
  de: deTranslations,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = '@tandrum_language';

export const I18nProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language from storage or device locale
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Try to get saved language from storage
        const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);

        if (
          savedLanguage &&
          (savedLanguage === 'en' || savedLanguage === 'de')
        ) {
          setLanguageState(savedLanguage as SupportedLanguage);
        } else {
          // Fall back to device locale
          const deviceLocales = getLocales();
          const deviceLanguage = deviceLocales[0]?.languageCode;

          if (deviceLanguage === 'de') {
            setLanguageState('de');
          } else {
            setLanguageState('en'); // Default to English
          }
        }
      } catch (error) {
        console.error('Error initializing language:', error);
        setLanguageState('en');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  // Function to change language
  const setLanguage = async (lang: SupportedLanguage) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  // Translation function with nested key support and interpolation
  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    // Navigate through nested keys
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found in current language
        value = translations['en'];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            console.warn(`Translation key "${key}" not found`);
            return key; // Return the key itself if not found
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" is not a string`);
      return key;
    }

    // Handle pluralization
    if (params && 'count' in params) {
      const count = params.count;
      if (count === 1) {
        // Try to find singular form (key_one)
        const singularKey = key + '_one';
        const singularValue = t(singularKey);
        if (singularValue !== singularKey) {
          value = singularValue;
        }
      }
    }

    // Simple interpolation
    if (params) {
      return value.replace(
        /\{\{(\w+)\}\}/g,
        (match: string, paramKey: string) => {
          return params[paramKey]?.toString() || match;
        },
      );
    }

    return value;
  };

  const contextValue: I18nContextType = {
    language,
    setLanguage,
    t,
    isLoading,
  };

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
};

// Custom hook to use i18n
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Helper hook for just the translation function
export const useTranslation = () => {
  const { t } = useI18n();
  return { t };
};
