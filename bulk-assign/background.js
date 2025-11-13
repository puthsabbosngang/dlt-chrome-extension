// background.js
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url
  ) {
    // Handle draft-application/list/new
    if (tab.url.startsWith("https://los-uat.luyleun.com/draft-application/list/new")) {
      const queryParameters = tab.url.split("?")[1] || "";
      const urlParameters = new URLSearchParams(queryParameters);
      chrome.tabs.sendMessage(tabId, {
        type: "DRAFT_LIST_NEW",
        page: urlParameters.get("page"),
        url: tab.url
      });
    }
    // Handle collection/list/before-due
    if (tab.url.startsWith("https://los-uat.luyleun.com/collection/list/before-due")) {
      const queryParameters = tab.url.split("?")[1] || "";
      const urlParameters = new URLSearchParams(queryParameters);
      chrome.tabs.sendMessage(tabId, {
        type: "COLLECTION_BEFORE_DUE",
        page: urlParameters.get("page"),
        url: tab.url
      });
    }

    // Handle collection/list/on-due
    if (tab.url.startsWith("https://los-uat.luyleun.com/collection/list/on-due")) {
      const queryParameters = tab.url.split("?")[1] || "";
      const urlParameters = new URLSearchParams(queryParameters);
      chrome.tabs.sendMessage(tabId, {
        type: "COLLECTION_ON_DUE",
        page: urlParameters.get("page"),
        url: tab.url
      });
    }

    // Handle collection/list/over-due
    if (tab.url.startsWith("https://los-uat.luyleun.com/collection/list/over-due")) {
      const queryParameters = tab.url.split("?")[1] || "";
      const urlParameters = new URLSearchParams(queryParameters);
      chrome.tabs.sendMessage(tabId, {
        type: "COLLECTION_OVER_DUE",
        page: urlParameters.get("page"),
        url: tab.url
      });
    }
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const urlTypes = [
      { type: "DRAFT_LIST_NEW", path: "draft-application/list/new" },
      { type: "COLLECTION_BEFORE_DUE", path: "collection/list/before-due" },
      { type: "COLLECTION_ON_DUE", path: "collection/list/on-due" },
      { type: "COLLECTION_OVER_DUE", path: "collection/list/over-due" }
    ];
    urlTypes.forEach(({ type, path }) => {
      if (tab.url.includes(path)) {
        const queryParameters = tab.url.split("?")[1] || "";
        const urlParameters = new URLSearchParams(queryParameters);
        chrome.tabs.sendMessage(tabId, {
          type,
          page: urlParameters.get("page"),
          url: tab.url
        });
      }
    });
  }
});
