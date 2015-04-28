
function uninstall() {
  chrome.management.uninstallSelf();
}
uninstall();

chrome.runtime.onInstalled.addListener(uninstall);
chrome.runtime.onStartup.addListener(uninstall);
chrome.tabs.onUpdated.addListener(uninstall);
