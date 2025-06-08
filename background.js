const trackers = [
  /google-analytics\.com/,
  /facebook\.net/,
  /doubleclick\.net/,
  /hotjar\.com/,
  /segment\.com/,
  /mixpanel\.com/
];

let foundTrackers = [];
let thirdPartyDomains = new Set();
let thirdPartyCookies = [];

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = new URL(details.url);
    const domain = url.hostname;
    const originDomain = new URL(details.initiator || details.documentUrl || details.originUrl || '').hostname;

    for (let pattern of trackers) {
      if (pattern.test(url)) {
        foundTrackers.push(url.href);
        break;
      }
    }

    if (originDomain && domain !== originDomain && !domain.endsWith(originDomain)) {
      thirdPartyDomains.add(domain);
    }
  },
  { urls: ["<all_urls>"] },
  []
);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.cookies.getAll({ url: tab.url }, (cookies) => {
      const currentDomain = new URL(tab.url).hostname;
      thirdPartyCookies = cookies.filter(cookie => {
        return cookie.domain && !cookie.domain.includes(currentDomain);
      });
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getTrackers') {
    sendResponse({
      trackers: foundTrackers,
      thirdParty: Array.from(thirdPartyDomains),
      cookies: thirdPartyCookies
    });
  }

  if (message.type === 'clearCookies') {
    let cleared = 0;
    thirdPartyCookies.forEach((cookie) => {
      chrome.cookies.remove({
        url: `http${cookie.secure ? 's' : ''}://${cookie.domain.replace(/^\./, '')}${cookie.path}`,
        name: cookie.name
      }, () => cleared++);
    });
    sendResponse({ cleared });
  }
});