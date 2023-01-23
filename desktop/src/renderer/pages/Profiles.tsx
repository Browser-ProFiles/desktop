import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Button, Spin } from 'antd';
import { toast } from 'react-toastify';
import axios from 'axios';
import type { AxiosError } from 'axios';

import { getInstanceList } from '../api';
import { clearAuthToken, isAuth } from '../helpers/auth';

const Profiles = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [launching, setLaunching] = useState<boolean>(false);
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuth()) {
      clearAuthToken();
      navigate('/auth/login');
    }

    // @ts-ignore
    window.electron.ipcRenderer.on('browser-launch-finish', (data: any) => {
      setLaunching(false);
      data.success ? toast.success(`Profile ${data.name ? '"' + data.name + '"' : ''} successfully launched.`) : toast.error(data.message);
    });
  }, []);

  const onOpenProfile = (name: string) => {
    // @ts-ignore
    window.electron.ipcRenderer.sendMessage('open-profile', name);
  }

  const onLaunch = (config: any) => {
    setLaunching(true);
    // @ts-ignore
    window.electron.ipcRenderer.sendMessage('launch-browser', config);
  }

  const fetchInstances = async () => {
    try {
      setLoading(true);
      const { data } = await getInstanceList();
      setList(data?.profiles.map((profile: any) => ({
        ...profile,
        form: profile.form ? JSON.parse(profile.form) : {},
      })));
      // @ts-ignore
    } catch (e: Error | AxiosError) {
      console.error(e);
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 401 || e.response?.status === 403) {
          navigate('/auth/login');
          return;
        }
        toast.error(e.response?.data?.message);
      } else {
        toast.error(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, [getInstanceList]);

  return (
    <div className="content-inner">
      <div className="row">
        <h1 className="title">Profiles</h1>
        <Spin delay={300} spinning={launching} />
      </div>

      <div className="row">
        <Button className="refresh" disabled={launching} onClick={() => fetchInstances()}>
          Refresh
        </Button>
      </div>

      <List
        itemLayout="horizontal"
        dataSource={list}
        loading={loading}
        renderItem={(item) => (
          <List.Item
            actions={[
              <React.Fragment>
                <Button className="buttonLeft" disabled={launching} onClick={() => onOpenProfile(item.name)}>Go to folder</Button>
                <Button disabled={launching} onClick={() => onLaunch(item)} type="primary">Launch</Button>
              </React.Fragment>
            ]}
          >
            <List.Item.Meta
              title={item.name}
              description={
                <React.Fragment>
                  {item.form.fingerprint?.fingerprintEnabled && (
                    <div>Generated fingerprint platform: {item.form.fingerprint?.fingerprintOs}</div>
                  )}
                  {item.form.system?.timezone?.timezone && (
                    <div>Timezone: {item.form.system?.timezone?.timezone}</div>
                  )}
                  {item.form.proxy?.proxyEnabled && (
                    <div>Proxy: {item.form.proxy?.proxyHost}:{item.form.proxy?.proxyPort}</div>
                  )}
                </React.Fragment>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Profiles;
