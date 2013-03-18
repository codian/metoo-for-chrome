var Metoo = Metoo || {};
Metoo.Button = Metoo.Button || {};

Metoo.Button.init = function() {
  console.log("Metoo.Button.init()");
    
  chrome.extension.onRequest.addListener(Metoo.Button.handleRequest);
  chrome.extension.onRequestExternal.addListener(Metoo.Button.handleExternalRequest);
  
  // 탭이 생성되는 경우 
  chrome.tabs.onCreated.addListener(function(tab) {
    Metoo.Button.updateMetoo(tab);
  });

  // 탭이 닫히는 경우
  chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    Metoo.PageInfo.deleteByTabId(tabId);
  });

  // 탭이 바뀌는 경우
  chrome.tabs.onSelectionChanged.addListener(function(tabId) {
    chrome.tabs.get(tabId, function(tab) {
      Metoo.Button.updateMetoo(tab);
    });
  });

  // 탭(status, URL, pinned)이 변경되는 경우
  chrome.tabs.onUpdated.addListener(function(tabId) {
    chrome.tabs.get(tabId, function(tab) {
      Metoo.Button.updateMetoo(tab);
    });
  });

  chrome.tabs.getCurrent(Metoo.Button.updateMetoo);
}

Metoo.Button.handleRequest = function (request, sender, sendResponse) {
  console.log("Metoo.Button.handleRequest:", request, sender, sendResponse);
  
  switch (request.req) {
  // 미투하기 
  case "toggleMetoo":
    chrome.tabs.getSelected(request.window.id, function(tab) {
      //console.log("\t", tab);
      Metoo.Button.metoo(tab, function(resp) {
        sendResponse(resp);
      });
    });
    break;
    
  case "getPageInfo":
    var pageInfo = Metoo.PageInfo.get(request.url);
    sendResponse({
      error: 0,
      result: pageInfo
    });
    break;
    
  default:
    console.log("Unknown request to Metoo.Button.handleRequest: ", 
                request, sender, sendResponse);
    break;
  }
};

Metoo.Button.handleExternalRequest = function (request, sender, sendResponse) {
  console.log("Metoo.Button.handleExternalRequest: ", request, sender, sendResponse);
};

Metoo.Button.isUrl = function(url) {
  return url.match(/^https?:\/\//) != null;
};

// 미투 카운트 업데이트 
// tab 파라미터를 지정하지 않은 경우 현재 tab을 업데이트한다. 
Metoo.Button.updateMetoo = function(tab) {
  if (!tab) return
  if (!tab.url || !Metoo.Button.isUrl(tab.url)) {
    Metoo.Button.changeButton(tab.id, '', "dis");
    return;
  }

  // console.log("Metoo.Button.updateMetoo:", tab);

  Metoo.API.getWebpageInfo(tab.url, {
    success: function(data) {
      // metooStatus 
      //   "1" - 이미 미투한 상태
      //   "2" - 미투하지 않은 상태
      //   "9" - 알수없는 상태(비로그인)
      var metoo, metooStatus, normalizedUrl, postId, postUrl;
      if (data.result.postInfoList.length > 0) {
        metoo = data.result.postInfoList[0].metooCount;
        metooStatus = data.result.postInfoList[0].metooStatus;
        normalizedUrl = data.result.postInfoList[0].url;
        postId = data.result.postInfoList[0].postId;
        postUrl = data.result.postInfoList[0].permalink;
      } else {
        metoo = 0;
        metooStatus = "2";
        normalizedUrl = null;
        postId = null;
        postUrl = null;
      }
      var st = Metoo.API.getSecurityToken(data);
      
      Metoo.PageInfo.set({
        url: tab.url,
        normalizedUrl: normalizedUrl,
        tabId: tab.id,
        metooCount: metoo,
        metooStatus: metooStatus,
        postId: postId,
        postUrl: postUrl,
        title: tab.title,
        securityToken: st
      });
      
      Metoo.Button.changeButton(tab.id, metoo, "on");
    },
    
    error: function(data) {
      Metoo.PageInfo.deleteByTabId(tab.id);
      Metoo.Button.changeButton(tab.id, "error", "err");
      Metoo.Button.showMessage(data);
    }
  });
};

Metoo.Button.metoo = function(tab, sendResponse) {
  if (!tab) return;
  if (!tab.url || !Metoo.Button.isUrl(tab.url)) return;
  
  var pageInfo = Metoo.PageInfo.get(tab.url);
  if (!pageInfo) return;

  var token = pageInfo.securityToken;
  
  var params = {
    success: function(data) {
      Metoo.API.writeLog("Metoo.Button.metoo", "SUCCESS METOO");
      var metoo = data.result.postInfo.metooCount;
      Metoo.Button.changeButton(tab.id, metoo, "on");
      
      Metoo.PageInfo.set({
        url: tab.url,
        tabId: tab.id,
        normalizedUrl: data.result.postInfo.url,
        metooCount: metoo,
        metooStatus: data.result.postInfo.metooStatus,
        postId: data.result.postInfo.postId,
        postUrl: data.result.postInfo.permalink
      });
      
      sendResponse({
        result: true,
        message: data.alert,
        data: Metoo.PageInfo.get(tab.url)
      });
    },
    error: function(data) {
      console.log("FAIL METOO");
      sendResponse({
        result: false,
        message: data
      });
    }
  };
  if (tab.title && tab.title.length > 0) {
    params.pageTitle = pageInfo.title 
  } 
  
  Metoo.API.metoo(tab.url, token, params);
};

Metoo.Button.changeButton = function(tabId, metoo, icon) {
  // console.log("Metoo.Button.changeButton", tabId, metoo, icon);
  
  chrome.browserAction.setBadgeBackgroundColor({
    color: "#FF6330",
    tabId: tabId
  });
  
  metoo = "" + metoo;
  if (metoo && metoo.length > 0) {
    chrome.browserAction.setBadgeText({
      text: Metoo.Button.format_metoo(metoo),
      tabId: tabId
    });
  }

  var iconUrl = ["images/icon19.", icon, ".png"].join("");  
  chrome.browserAction.setIcon({
    path: iconUrl,
    tabId: tabId
  });
};

Metoo.Button.format_metoo = function(metoo) {
  var ret = "";
  if (metoo > 1000000) {
    ret = Math.floor(metoo / 1000000) + "M";
  } else if (metoo > 1000) {
    ret = Math.floor(metoo / 1000) + "K";
  } else {
    ret = "" + metoo;
  }
  return ret;
};

Metoo.Button.showMessage = function(message) {
  console.log("sendRequest ", {req: "showMessage", message: message});
  chrome.extension.sendRequest({req: "showMessage", message: message}, function (resp) {
    console.log("showMessage resp: ", resp);
  })
};

console.log("button.js loaded");