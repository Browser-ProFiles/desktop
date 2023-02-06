import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';

import { getStorageLang, setStorageLang } from '../../helpers/lang';

type Props = {
  className: string
}

const LANGS = [
  {
    label: 'Русский',
    value: 'ru'
  },
  {
    label: 'English',
    value: 'en'
  }
];

const SwitchLang: React.FC<Props> = ({ className }) => {
  const [lang, setLang] = useState<string>(getStorageLang());
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, []);

  const onChange = (lang: string) => {
    setLang(lang);
    setStorageLang(lang);
    i18n.changeLanguage(lang);
  }

  return (
    <Select
      options={LANGS}
      value={lang}
      className={`${className} switch-lang`}
      onChange={onChange}
    />
  );
};

export default SwitchLang;
