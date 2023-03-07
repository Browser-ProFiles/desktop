import React, {useState, useEffect, Fragment} from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Button, Spin, Select, Progress } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import type { AxiosError } from 'axios';

import type { BrowserVersion } from '../../types';

import { getBrowserVersions, getCurrentUser, getInstanceList } from '../api';
import { clearAuthToken, isAuth } from '../helpers/auth';

type Revision = {
  revision: string,
  hash: string,
}

const Profiles = () => {
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();

  const [downloadedSize, setDownloadedSize] = useState<number | string>(0);
  const [fullSize, setFullSize] = useState<number | string>(0);

  const [downloading, setDownloading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [launching, setLaunching] = useState<boolean>(false);

  const [list, setList] = useState<any[]>([]);

  const [currentUserHash, setCurrentUserHash] = useState<string>('');
  const [currentUserMaxProfiles, setCurrentUserMaxProfiles] = useState<number>(0);
  const [listRealLength, setListRealLength] = useState<number>(0);

  const [localRevisions, setLocalRevisions] = useState<Revision[]>([]);
  const [currentRevision, setCurrentRevision] = useState<string | null>(null);

  const [browserVersions, setBrowserVersions] = useState<BrowserVersion[]>([]);

  useEffect(() => {
    if (!isAuth()) {
      clearAuthToken();
      navigate('/auth/login');
    }

    // @ts-ignore
    window.electron.ipcRenderer.on('browser-launch-finish', (data: any) => {
      data.success ?
        toast.success(`${t('messages.launch.success.part1')} ${data.name ? '"' + data.name + '"' : ''} ${t('messages.launch.success.part2')}`) :
        toast.error(data.message);
      setLaunching(false);
    });

    // @ts-ignore
    window.electron.ipcRenderer.on('download-browser-progress', (data: any) => {
      // @ts-ignore
      setDownloadedSize((Number(data.current) / 1000000).toFixed(1));
      // @ts-ignore
      setFullSize((Number(data.fullSize) / 1000000).toFixed(1));
    });

    // @ts-ignore
    window.electron.ipcRenderer.on('download-browser-finish', (data: any) => {
      if (data.success) {
        toast.success(t('messages.download.success'));
        onGetLocalRevisions();
      } else {
        toast.error(data.message);
      }
      setDownloading(false);
    });

    // @ts-ignore
    window.electron.ipcRenderer.on('local-revisions-finish', (data: any) => {
      setLoading(false);
      setLocalRevisions(data.versions);
    });
  }, []);

  useEffect(() => {
    onGetLocalRevisions();
  }, [currentUserHash]);

  const onOpenProfile = (name: string) => {
    // @ts-ignore
    window.electron.ipcRenderer.sendMessage('open-profile', name);
  }

  const onLaunch = (config: any) => {
    setLaunching(true);
    // @ts-ignore
    window.electron.ipcRenderer.sendMessage('launch-browser', {
      ...config,
      browserHash: currentRevision,
      userHash: currentUserHash,
    });
  }

  const onBrowserDownload = async () => {
    if (!currentUserHash) {
      return;
    }
    setDownloading(true);

    // @ts-ignore
    window.electron.ipcRenderer.sendMessage('download-browser', {
      userHash: currentUserHash,
      browserHash: currentRevision,
      lang: i18n.language,
    });
  }

  const onGetLocalRevisions = async () => {
    if (!currentUserHash) {
      return;
    }
    setLoading(true);

    // @ts-ignore
    window.electron.ipcRenderer.sendMessage('get-local-revisions', {
      userHash: currentUserHash,
    });
  }

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const { data } = await getCurrentUser();
      setCurrentUserHash(data?.hash ?? '');
      setCurrentUserMaxProfiles(data?.subscription?.maxProfiles);
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

  const fetchBrowserVersions = async () => {
    try {
      setLoading(true);
      const { data } = await getBrowserVersions();
      setBrowserVersions(data.versions);

      const currentRevision = data.versions.find((item: any) => item.selected);
      if (currentRevision) {
        setCurrentRevision(currentRevision.hash);
      }
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

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data } = await getInstanceList();
      setList(data?.profiles.map((profile: any) => ({
        ...profile,
        form: profile.form ? JSON.parse(profile.form) : {},
      })));
      setListRealLength(data?.realLength)
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

  const fetchAll = async () => {
    await fetchCurrentUser();
    await fetchBrowserVersions();
    await fetchProfiles();
    await onGetLocalRevisions();
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const hasCurrentRevision = () => localRevisions.map((item) => item.hash).includes(currentRevision ?? '');

  return (
    <div className="content-inner">
      {downloading && (
        <Fragment>
          <div className="overlay">
            <div className="download-modal">
              <Progress
                type="circle"
                percent={parseInt(String(Number(downloadedSize) / Number(fullSize) * 100))}
                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
              />
              <div className="download-modal-text">{downloadedSize} / {fullSize} MB</div>
            </div>
          </div>
        </Fragment>
      )}

      <div className="row">
        <h1 className="title">{t('profiles.title')} ({listRealLength} / {currentUserMaxProfiles})</h1>
        <Spin delay={300} spinning={launching} />
      </div>

      <div key={`${localRevisions.toString()}${browserVersions.toString()}`} className='row'>
        <Select
          style={{ width: 200 }}
          onChange={setCurrentRevision}
          defaultValue={currentRevision}
          options={browserVersions.map((item) => ({
            label: `${item.name} ${item.version}`,
            value: item.hash,
          }))}
          disabled={loading || downloading}
        />

        {hasCurrentRevision() ? (
          <Button disabled>{t('profiles.selected')}</Button>
        ) : (
          <Button onClick={() => onBrowserDownload()} disabled={loading || downloading}>
            {t('profiles.download')}
          </Button>
        )}

        <Button className="refresh" disabled={launching || downloading} onClick={() => fetchProfiles()}>
          <SyncOutlined className="icon" />
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
                <Button
                  className="buttonLeft"
                  disabled={launching || loading || downloading || !hasCurrentRevision()}
                  onClick={() => onOpenProfile(item.name)}
                >
                  {t('profiles.goToFolder')}
                </Button>
                <Button
                  disabled={launching || loading || downloading || !hasCurrentRevision()}
                  onClick={() => onLaunch(item)}
                  type="primary"
                >
                  {t('profiles.launch')}
                </Button>
              </React.Fragment>
            ]}
          >
            <List.Item.Meta
              title={item.name}
              description={
                <React.Fragment>
                  {item.form.fingerprint?.fingerprintEnabled ? (
                    <div>
                      {t('profiles.fingerprint')}:
                      {item.form.fingerprint?.fingerprintOs} / {item.form.fingerprint?.fingerprintBrowser} {item.form.fingerprint?.fingerprintBrowserVersion}
                    </div>
                  ) : <div>{t('profiles.noFingerprint')}</div>}
                  {item.form.system?.timezone?.timezone && (
                    <div>{t('profiles.timezone')}: {item.form.system?.timezone?.timezone}</div>
                  )}
                  {item.form.proxy?.proxyEnabled && (
                    <div>{t('profiles.proxy')}: {item.form.proxy?.proxyHost}:{item.form.proxy?.proxyPort}</div>
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
