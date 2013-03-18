var backgroundPage = chrome.extension.getBackgroundPage();
    
var Metoo = Metoo || {};
Metoo.Popup = Metoo.Popup || {};

Metoo.Popup.pageInfo = null;

Metoo.Popup.init = function () {
  chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    backgroundPage.console.log("showMessage recieved", request, sender, sendResponse);
    if (request.req == "showMessage") {
      Metoo.Popup.showMessage(request.message);
    }
  });
  
  $("#close_popup").click(Metoo.Popup.close);
  
  // 페이지 정보 조회/표시
  chrome.windows.getCurrent(function(window) {
    chrome.tabs.getSelected(window.id, function(tab) {
      // console.log("sendRequest(getPageInfo)");
      
      chrome.extension.sendRequest(
        {
          req: "getPageInfo",
          url: tab.url
        },
        function (resp) {
          console.log("receiveResponse(getPageInfo)", resp);
          
          if (resp.error == 0) {
            Metoo.Popup.pageInfo = resp.result;

            // 미투하기
            Metoo.Popup.metoo();
          }
        }
      )      
    });
  });
};

Metoo.Popup.metoo = function() {
  Metoo.API.writeLog("POPUP", "Metoo.Popup.metoo");

  // 미투 버튼 클릭
  chrome.windows.getCurrent(function(window) {
    console.log("send metoo request");
    chrome.extension.sendRequest(
      {
        req: "toggleMetoo",
        window: window
      }, 
      function (resp) {
        // backgroundPage.console.log("receive Metoo result:", resp);
        if (resp.result) {
          Metoo.Popup.pageInfo = resp.data;
          Metoo.Popup.showMessage(resp.message);
        } else {
          Metoo.Popup.showMessage(resp.alert);
        }
      });
  });
}

Metoo.Popup.showMessage = function(message) {
  // console.log("showMessage", message);

  $("#message").html(message);
  $("#message").show();
};

Metoo.Popup.close = function() {
  window.close();
};

document.addEventListener("DOMContentLoaded", Metoo.Popup.init, false);