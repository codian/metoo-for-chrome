var Metoo = Metoo || {};
Metoo.API = Metoo.API || {};

Metoo.API.emptyFunction = function() {};

Metoo.API.DEBUGMODE = false;

Metoo.API.defaultOptions = function(options) {
  options = options || {}
  options.error = options.error || Metoo.API.emptyFunction;
  options.success = options.success || Metoo.API.emptyFunction;
  
  return options;
};

Metoo.API.getWebpageInfo = function(url, options) {
  options = Metoo.API.defaultOptions(options);

  params = {
    'url': url
  };
  if (options['pluginKey']) {
    params['pluginKey'] = options['pluginKey'];
  }
  if (options['pluginReferer']) {
    params['pluginReferer'] = options['pluginReferer'];
  }  
  
  var errorHandler = function(data) {
    options.error(data);
    console.log("ERROR:", data);
  }
  
  $.ajax({
    url: "http://plugin.me2day.net/v1/plugin/get_webpage_info.json",
    type: "GET",
    data: params,
    complete: function(jqXHR, textStatus) {
      Metoo.API.writeLog("CALL(" + "textStatus" + ") v1/plugin/get_webpage_info.json", {
        "params": params,
        "responseText": jqXHR.responseText
      });
    },
    success: function(data) {
      if (data.code != 0) {
        errorHandler(data.message);
        return
      }
      options.success(data);
    },
    error: errorHandler
  });
};

Metoo.API.metoo = function(url, token, options) {
  options = Metoo.API.defaultOptions(options);
  
  params = {
    'url': url,
    'security_token': token
  };
  if (options['pluginKey']) {
    params['plugin_key'] = options['pluginKey'];
  }
  if (options['pageTitle']) {
    params['title'] = options['pageTitle'];
  }  
  
  var errorHandler = function(data) {
    options.error(data);
    console.log("ERROR:", data);
  }

  $.ajax({
    url: "http://plugin.me2day.net/v1/metoo/metoo.json",
    type: "POST",
    data: params,
    complete: function(jqXHR, textStatus) {
      Metoo.API.writeLog("CALL(" + "textStatus" + ") v1/metoo/metoo.json", {
        "params": params,
        "responseText": jqXHR.responseText
      });
    },
    success: function(data) {
      if (data.code != 0) {
        errorHandler(data.message);
        return
      }
      options.success(data);
    },
    error: errorHandler
  });
};

Metoo.API.getMetooFriendList = function(postId, count, options) {
  options = Metoo.API.defaultOptions(options);

  params = {
    'post_id': postId,
    'count': count
  };
  
  var errorHandler = function(data) {
    options.error(data);
    console.log("ERROR:", data);
  }
  
  $.ajax({
    url: "http://plugin.me2day.net/v1/metoo/get_metoo_friend_list.json",
    type: "GET",
    data: params,
    complete: function(jqXHR, textStatus) {
      Metoo.API.writeLog("CALL(" + "textStatus" + ") v1/plugin/get_metoo_friend_list.json", {
        "params": params,
        "responseText": jqXHR.responseText
      });
    },
    success: function(data) {
      if (data.code != 0) {
        errorHandler(data.message);
        return
      }
      options.success(data);
    },
    error: errorHandler
  });
};

Metoo.API.writeComment = function(url, token, options) {
  Metoo.API.writeLog("Metoo.API.writeComment", url, token, options);

  options = Metoo.API.defaultOptions(options);
  
  params = {
    'url': url,
    'security_token': token,
    'body': options.body,
    'pingback': options.pingback ? 'true' : 'false'
  };
  if (options['pluginKey']) {
    params['plugin_key'] = options['pluginKey'];
  }
  if (options['pageTitle']) {
    params['title'] = options['pageTitle'];
  }  
  
  var errorHandler = function(data) {
    options.error(data);
    console.log("ERROR:", data);
  }

  $.ajax({
    url: "http://plugin.me2day.net/v1/comment/create_comment.json",
    type: "POST",
    data: params,
    complete: function(jqXHR, textStatus) {
      Metoo.API.writeLog("CALL(" + "textStatus" + ") v1/comment/create_comment.json", {
        "params": params,
        "responseText": jqXHR.responseText
      });
    },
    success: function(data) {
      if (data.code != 0) {
        errorHandler(data.message);
        return
      }
      options.success(data);
    },
    error: errorHandler
  });
};

Metoo.API.getSecurityToken = function(data) {
  if (data && data.result && data.result.securityToken) {
    // return first element in data.result.securityToken
    for (var key in data.result.securityToken) {
      return data.result.securityToken[key];
    }
  }
  return null;
};

Metoo.API.writeLog = function(subject, data) {
  console.log("DEBUGMODE: " + Metoo.API.DEBUGMODE);
  if (Metoo.API.DEBUGMODE == false) return; 
  console.log(subject);
  for (key in data) {
    console.log("    " + key + ": ", data[key]);
  }
};