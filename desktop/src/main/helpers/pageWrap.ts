export const pageWithCDPSession = async (page: any) => {
  try {
    const cdpSession = await page.target().createCDPSession()
    await cdpSession.send('Network.enable')
    const cdpRequestDataRaw: any = {}
    const addCDPRequestDataListener = (eventName: string) => {
      cdpSession.on(eventName, (request: any) => {
        cdpRequestDataRaw[request.requestId] = cdpRequestDataRaw[request.requestId] || {}
        Object.assign(cdpRequestDataRaw[request.requestId], { [eventName]: request })
      })
    }

    addCDPRequestDataListener('Network.requestWillBeSent')
    addCDPRequestDataListener('Network.requestWillBeSentExtraInfo')
    addCDPRequestDataListener('Network.responseReceived')
    addCDPRequestDataListener('Network.responseReceivedExtraInfo')
    return cdpRequestDataRaw;
  } catch (e) {
    console.error('page cdp wrapper error')
  }
}
