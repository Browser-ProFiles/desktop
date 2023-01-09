import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Button } from 'antd';
import { toast } from 'react-toastify';
import axios from 'axios';
import type { AxiosError } from 'axios';

import { fetchProfiles } from '../api';

const Profiles = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any[]>([]);

  const onLaunch = (config: any) => {
    // @ts-ignore
    window.electron.ipcRenderer.sendMessage('launch-browser', config);
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await fetchProfiles();
        setList(data?.profiles);
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

    fetch();
  }, [fetchProfiles]);

  return (
    <div>
      <h1>Profiles list</h1>

      <List
        itemLayout="horizontal"
        dataSource={list}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button onClick={() => onLaunch(item)} type="primary">Launch</Button>
            ]}
          >
            <List.Item.Meta
              title={item.name}
              description="Empty description"
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Profiles;
