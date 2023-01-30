const AUTO_OPEN_LINKS: { [ key: string ]: string } = {
  whoer: 'https://whoer.net/',
  iphey: 'https://iphey.com/',
  creepjs: 'https://abrahamjuliot.github.io/creepjs/',
  botDetection: 'https://bot.sannysoft.com/',
  dnsLeak: 'https://whoer.net/dns-leak-test',
  webrtcLeak: 'https://browserleaks.com/webrtc',
  fingerprintCom: 'https://fingerprint.com/',
  chromeSecurity: 'chrome://settings/security',
}

export const getAutoOpenLinks = (keys: string[]): string[] => {
  return keys.map((key) => AUTO_OPEN_LINKS[key]);
}
