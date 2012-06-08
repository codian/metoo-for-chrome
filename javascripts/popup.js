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
            Metoo.Popup.updateMetoo();
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
  
  $("#title").html(Metoo.Popup.pageInfo.title);
};

Metoo.Popup.updateMetoo = function() {
  // 미투 수 표시
  var metooCount = Metoo.Popup.pageInfo.metooCount;
  $("#metoo_count").html(metooCount);

  if (!Metoo.Popup.pageInfo) return;
  if (!Metoo.Popup.pageInfo.postId) return;
  
  Metoo.API.getMetooFriendList(Metoo.Popup.pageInfo.postId, 5, {
    success: function(data) {
      console.log(data);
    
      $.each(data.result.metooFriendList, function(key) {
        var friend = data.result.metooFriendList[key];
        
        // 미투한 친구 프로필 목록
        $("#metoo_list").append("<a href=\"#\" id=\"profile_" + friend.userId + "\"" +
          " title=\"" + friend.nickname + "\">" +
          "<img src=\"" + friend.profileImage + "\" alt=\"" + friend.nickname + "\"" +
          "width=\"30\" height=\"30\">" +
          "</a>"
        );
        
        // 프로필 클릭시 해당 사용자 마이미투로 탭 열기
        $("#profile_" + friend.userId).click(function() {
          chrome.tabs.create(
            { 'url': "http://me2day.net/" + friend.userId },
            function(tab) { Metoo.Popup.close(); }
          );
        });
      });
    },
    error: function(data) {
    }
  });
  
  if (Metoo.Popup.pageInfo.postUrl) {
    $("#metoo_list_to_post").click(function() {
      console.log("#metoo_list_to_post");
      chrome.tabs.create(
        { 'url': Metoo.Popup.pageInfo.postUrl }, 
        function(tab) { Metoo.Popup.close(); }
      );
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
        // backgroundPage.console.log("receive Metoo result:", resp);
        if (resp.result) {
          Metoo.Popup.pageInfo = resp.data;
          Metoo.Popup.updateMetoo();

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