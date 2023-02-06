import { useState } from 'react';
import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Layout, ConfigProvider, theme } from 'antd';

import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/reset.css';
import './App.css';

import DarkThemeIcon from './components/icons/theme/DarkTheme';
import DefaultThemeIcon from './components/icons/theme/DefaultTheme';

import Login from './pages/Login';
import Profiles from './pages/Profiles';

import { getStorageTheme, setStorageTheme } from './helpers/theme'
import SwitchLang from "./components/utils/SwitchLang";

const { defaultAlgorithm, darkAlgorithm } = theme;
const { Header, Footer, Content } = Layout;

export default function App() {
  const [theme, setTheme] = useState<string>(getStorageTheme());

  const toggleTheme = () => {
    const newTheme = theme === 'default' ? 'dark' : 'default';
    setTheme(newTheme);
    setStorageTheme(newTheme);
  }

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
          <div className="footer__copyright">© {new Date().getFullYear()} Browser ProFiles</div>
          <SwitchLang className="footer__switch-lang" />
        </Footer>

        <ToastContainer limit={1} />
      </Layout>
    </ConfigProvider>
  );
}
