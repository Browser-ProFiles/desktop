import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          login: {
            title: 'Sign In',
            subtitle: 'If you don\'t have an account, create it on'
          },
          user: {
            username: 'Username',
            password: 'Password'
          },
          rules: {
            username: {
              required: 'Please input your username',
              long: 'Please shorten your username'
            },
            password: {
              required: 'Please input your password',
              long: 'Please shorten your password'
            }
          },
          profiles: {
            title: 'Profiles',
            selected: 'Selected',
            download: 'Download',
            goToFolder: 'Go to folder',
            launch: 'Launch',
            fingerprint: 'Fingerprint',
            noFingerprint: 'No fingerprint',
            timezone: 'Timezone',
            proxy: 'Proxy',
          },
          messages: {
            auth: {
              success: 'Successful authorization',
            },
            download: {
              success: 'Specified browser version successfully downloaded'
            },
            launch: {
              success: {
                part1: 'Profile',
                part2: 'successfully launched'
              }
            }
          },
          utils: {
            ourWebsite: 'website',
            submit: 'Submit'
          }
        }
      },
      ru: {
        translation: {
          login: {
            title: 'Войти',
            subtitle: 'Если у вас нет аккаунта, зарегистрируйтесь'
          },
          user: {
            username: 'Логин',
            password: 'Пароль'
          },
          rules: {
            username: {
              required: 'Введите логин',
              long: 'Слишком длинный логин'
            },
            password: {
              required: 'Введите пароль',
              long: 'Слишком длинный пароль'
            }
          },
          profiles: {
            title: 'Браузерные профили',
            selected: 'Выбран',
            download: 'Загрузить',
            goToFolder: 'Открыть папку',
            launch: 'Запустить',
            fingerprint: 'Цифровой отпечаток',
            noFingerprint: 'Не установлен цифровой отпечаток',
            timezone: 'Часовой пояс',
            proxy: 'Прокси',
          },
          messages: {
            auth: {
              success: 'Успешная авторизация',
            },
            download: {
              success: 'Указанная версия браузера успешно загружена'
            },
            launch: {
              success: {
                part1: 'Профиль',
                part2: 'успешно запущен'
              }
            }
          },
          utils: {
            ourWebsite: 'на сайте',
            submit: 'Войти'
          }
        }
      }
    },
    lng: 'ru',
    fallbackLng: 'ru',

    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
