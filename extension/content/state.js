export const state = {
  lastOriginalText: '',
  editor: null,
  panelOpen: false,
  last: { risk: 0, hits: [], emotions: {} },
  debounce: null,
  cooling: false,
  cooldownEnd: 0,
  readyToSend: false,
  bypassSend: false,
  cooldownTimerId: null
};
