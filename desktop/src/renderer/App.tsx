import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Layout } from 'antd';

import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/reset.css';
import './App.css';

import Login from './pages/Login';
import Profiles from './pages/Profiles';

const { Footer, Content } = Layout;

export default function App() {
  return (
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
      <Footer>App Name {new Date().getFullYear()} (c)</Footer>

      <ToastContainer />
    </Layout>
  );
}
