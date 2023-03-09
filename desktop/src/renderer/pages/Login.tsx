import React, { useState } from 'react';
import { Form, Button, Input } from 'antd'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import { signIn } from '../api';
import { setAuthToken } from '../helpers/auth';

interface Form {
  username: string,
  password: string,
}

const Login = () => {
  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { t } = useTranslation()

  const onSubmit = (form: Form) => {
    setLoading(true);
    signIn(form.username, form.password, token || '')
      .then(({ data }) => {
        setAuthToken(data.token);
        toast.success(t('messages.auth.success'));
        navigate('/profiles');
      })
      .catch((e) => {
        console.error(e);
        toast.error(e.response?.data?.message || e.message);
      })
      .finally(() => {
        setLoading(false);
        setToken(null);
      })
  }

  return (
    <div className="content">
      <div className="center-page">
        <div className="wrapper">
          <h1 className="title">{t("login.title")}</h1>

          <p className="note">
            {t("login.subtitle")}
            <a target="_blank" href="https://lk.browser-profiles.com/auth/sign-up"> {t("utils.ourWebsite")}</a>.
          </p>

          <Form
            name='login'
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            initialValues={{ remember: true }}
            onFinish={onSubmit}
          >
            <Form.Item
              label={t("user.username")}
              name="username"
              trigger="onChange"
              rules={[
                { required: true, message: t("rules.username.required") as string },
                { max: 255, message: t("rules.username.long") as string },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label={t("user.password")}
              name="password"
              trigger="onChange"
              rules={[
                { required: true, message: t("rules.password.required") as string },
                { max: 255, message: t("rules.password.long") as string },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button className="auth-submit" disabled={loading} type="primary" htmlType="submit">
                {t("utils.submit")}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
