import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import en from '../locales/en.json';
import uk from '../locales/uk.json';

const locales: Record<string, any> = { en, uk };

export const useI18nStore = defineStore('i18n', () => {
    const locale = ref(localStorage.getItem('locale') || 'en');

    const t = (key: string, params: Record<string, string> = {}) => {
        const parts = key.split('.');
        let template = locales[locale.value];

        for (const part of parts) {
            template = template?.[part];
        }

        if (typeof template !== 'string') return key;

        return template.replace(/{(\w+)}/g, (_, p) => params[p] || `{${p}}`);
    };

    const setLocale = (newLocale: string) => {
        if (locales[newLocale]) {
            locale.value = newLocale;
        }
    };

    watch(locale, (newLocale) => {
        localStorage.setItem('locale', newLocale);
        document.documentElement.lang = newLocale;
    });

    // Initialize HTML lang attribute
    document.documentElement.lang = locale.value;

    return {
        locale,
        t,
        setLocale
    };
});
