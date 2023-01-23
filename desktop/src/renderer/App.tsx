import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Layout, ConfigProvider, theme } from 'antd';

import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/reset.css';
import './App.css';

import Login from './pages/Login';
import Profiles from './pages/Profiles';

const { darkAlgorithm } = theme;
const { Footer, Content } = Layout;

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: darkAlgorithm,
        token: {
          colorPrimary: '#da431a',
          colorLink: '#1aa7da',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          borderRadius: 6,
          fontSize: 15,
        },
      }}
    >
      <Layout>
        <Content>
          <Router>
            <Routes>
              <Route path="/profiles" element={<Profiles />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/profiles" replace />} />
            </Routes>
          </Router>
        </Content>
        <Footer>© {new Date().getFullYear()} Browser ProFiles</Footer>

        <ToastContainer />
      </Layout>
    </ConfigProvider>
  );
}
