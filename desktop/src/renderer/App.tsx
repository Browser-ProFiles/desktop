import { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Layout, ConfigProvider, Modal, theme } from 'antd';
import { ExclamationOutlined } from '@ant-design/icons';

import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/reset.css';
import './App.css';

import { getAppVersion } from './api';

import DarkThemeIcon from './components/icons/theme/DarkTheme';
import DefaultThemeIcon from './components/icons/theme/DefaultTheme';

import Login from './pages/Login';
import Profiles from './pages/Profiles';

import { getStorageTheme, setStorageTheme } from './helpers/theme'
import SwitchLang from "./components/utils/SwitchLang";

const { defaultAlgorithm, darkAlgorithm } = theme;
const { Header, Footer, Content } = Layout;

const APP_CURRENT_VERSION = '1.0.0';

export default function App() {
  const [theme, setTheme] = useState<string>(getStorageTheme());
  const [latestVersion, setLatestVersion] = useState<string>('');
  const [newVersionAvailable, setNewVersionAvailable] = useState<boolean>(false);

  const { t } = useTranslation();

  const toggleTheme = () => {
    const newTheme = theme === 'default' ? 'dark' : 'default';
    setTheme(newTheme);
    setStorageTheme(newTheme);
  }

  const openUpdateModal = () => {
    Modal.info({
      title: t('modals.newVersion.title', { version: latestVersion }),
      content: (
        <div>
          <p>{t('modals.newVersion.description')}</p>
        </div>
      ),
      okText: t('utils.notShowAgain'),
      onOk: () => localStorage.setItem('hidUpdate', latestVersion)
    });
  }

  useEffect(() => {
    const fetchAppVersion = async () => {
      try {
        const { data } = await getAppVersion();

        setLatestVersion(data.latestVersion);
        if (
          Number(data.latestVersion.split('.').join('')) >
          Number(APP_CURRENT_VERSION.split('.').join(''))
        ) {
          setNewVersionAvailable(true);

          if (localStorage.getItem('hidUpdate') === data.latestVersion) {
            return;
          }

          openUpdateModal();
        }
      } catch (e) {
        console.error(e)
      }
    }

    fetchAppVersion();
  }, []);

  return (
    <ConfigProvider
      key={theme}
      theme={{
        algorithm: theme === 'default' ? defaultAlgorithm : darkAlgorithm,
        token: {
          fontFamily: 'Jura',
          colorPrimary: '#da431a',
          colorLink: '#1aa7da',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          borderRadius: 6,
          fontSize: 15,
        },
      }}
    >
      <Layout className={theme}>
        <Header className='header'>
          <div className='header__theme' onClick={toggleTheme}>
            {theme === 'default' && <DarkThemeIcon />}
            {theme === 'dark' && <DefaultThemeIcon />}
          </div>
        </Header>
        <Content>
          <Router>
            <Routes>
              <Route path="/profiles" element={<Profiles />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/profiles" replace />} />
            </Routes>
          </Router>
        </Content>
        <Footer className="footer">
          <div className="footer__left">
            <div className="footer__copyright">© {new Date().getFullYear()} Browser ProFiles</div>
            <div className="footer__version">{APP_CURRENT_VERSION} {newVersionAvailable && (
              <div onClick={() => openUpdateModal()} className="footer__version-new">
                <ExclamationOutlined />
              </div>
            )}</div>
          </div>
          <SwitchLang className="footer__switch-lang" />
        </Footer>

        <ToastContainer />
      </Layout>
    </ConfigProvider>
  );
}
