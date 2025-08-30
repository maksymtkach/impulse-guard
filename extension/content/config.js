export const CFG = { HIGH_RISK: 70, COOLDOWN: 5, BADGE: 26, GAP: 6, PANEL_W: 420, PANEL_MARGIN: 8 };
if (!('COOLDOWN' in CFG)) CFG.COOLDOWN = 5;

export const settings = {
  API_URL: "http://127.0.0.1:8000",
  API_TOKEN: ""
};

export function loadSettings() {
  return new Promise(resolve => {
    try {
      chrome.storage.sync.get(["API_URL","API_TOKEN"], v => {
        if (v.API_URL)  settings.API_URL  = v.API_URL;
        if (v.API_TOKEN) settings.API_TOKEN = v.API_TOKEN;
        resolve(settings);
      });
    } catch {
      resolve(settings);
    }
  });
}
