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
  
  $("#metoo_button").click(Metoo.Popup.onclick);
  
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
            Metoo.Popup.updatePageInfo();
            Metoo.Popup.updateMetooFriends();
            Metoo.Popup.updateComments();
          }
        }
      )      
    });
  });
};

Metoo.Popup.updatePageInfo = function() {
  if (!Metoo.Popup.pageInfo) return;
  
  // console.log(Metoo.Popup.pageInfo);
  
  url = Metoo.Popup.pageInfo.normalizedUrl;
  $("#url").html(url);
  
  metooCount = Metoo.Popup.pageInfo.metooCount;
  $("#metoo_count").html(metooCount);
};

Metoo.Popup.updateMetooFriends = function() {
  if (!Metoo.Popup.pageInfo) return;
  if (!Metoo.Popup.pageInfo.postId) return;
  
  Metoo.API.getMetooFriendList(Metoo.Popup.pageInfo.postId, 5, {
    success: function(data) {
      console.log(data);
    
      for (var key in data.result.metooFriendList) {
        var friend = data.result.metooFriendList[key];
        $("#metoo_list").append("<a href=\"http://me2day.net/" + friend.userId +
          " title=\"" + friend.nickname + "\">" +
          "<img src=\"" + friend.profileImage + " alt=\"" + friend.nickname + "\"" +
          "width=\"30\" height=\"30\">" +
          "</a>"
        );
      }
    },
    error: function(data) {
    }
  });
  
  if (Metoo.Popup.pageInfo.postUrl) {
    $("#metoo_list_to_post").click(function() {
      console.log("#metoo_list_to_post");
      chrome.tabs.create({'url': Metoo.Popup.pageInfo.postUrl}, function(tab) {
        // Tab opened.
      });
    });
  }
};

Metoo.Popup.updateComments = function() {
};

Metoo.Popup.onclick = function() {
  console.log("Metoo.Popup.onclick");

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
          Metoo.Button.showMessage("미투했습니다.");
        } else {
          Metoo.Button.showMessage(resp.message);
        }
      });
  });
}

Metoo.Popup.showMessage = function(message) {
  $("message").html(message);
  $("loading").hide();
  $("message").show();
};

Metoo.Popup.close = function() {
  window.close();
};