chrome.runtime.onInstalled.addListener(() => {
  console.log("Dihë extension installed");
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-dihe-sidebar") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: "toggleSidebar"});
    });
  }
});