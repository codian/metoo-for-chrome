var backgroundPage = chrome.extension.getBackgroundPage();
    
var Metoo = Metoo || {};
Metoo.Popup = Metoo.Popup || {};

Metoo.Popup.init = function () {
  chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    backgroundPage.console.log("showMessage recieved", request, sender, sendResponse);
    if (request.req == "showMessage") {
      Metoo.Popup.showMessage(request.message);
    }
  });
  
  // 미투 버튼 클릭
  chrome.windows.getCurrent(function(window) {
    chrome.extension.sendRequest(
      {
        req: "toggleMetoo",
        window: window
      }, 
      function (resp) {
        backgroundPage.console.log("receive Metoo result:", resp);
        if (resp.result) {
          Metoo.Popup.close();
        } else {
          Metoo.Button.showMessage(resp.message);
        }
      });
  });
};

Metoo.Popup.showMessage = function(message) {
  $("message").html(message);
  $("loading").hide();
  $("message").show();
};

Metoo.Popup.close = function() {
  window.close();
};