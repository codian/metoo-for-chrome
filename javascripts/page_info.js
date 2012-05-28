var Metoo = Metoo || {};
Metoo.PageInfo = Metoo.PageInfo || {};

// pageInfos: url => pageInfo
// pageInfo:  (url, normalizedUrl, metooCount, securityToken)
Metoo.PageInfo.infos = {};

Metoo.PageInfo.get = function(url) {
  return Metoo.PageInfo.infos[url];
};

Metoo.PageInfo.find = function(cond) {
  for(var key in Metoo.PageInfo.infos) {
    if (cond(Metoo.PageInfo.infos[key])) {
      return key
    }
  }
  return null;
}

Metoo.PageInfo.set = function(values) {
  if (!values.url) {
    console.log("Error: values.url is not specified in Metoo.PageInfo.set");
    return 
  }
  
  var pageInfo = Metoo.PageInfo.infos[values.url];
  if (!pageInfo) {
    Metoo.PageInfo.infos[values.url] = {}
    pageInfo = Metoo.PageInfo.infos[values.url]
  }
  
  pageInfo.url = values.url;
  for (var key in values) {
    if (key != 'url') {
      pageInfo[key] = values[key];
    }
  }
  
  return pageInfo;
};

Metoo.PageInfo.delete = function(url) {
  var pageInfo = Metoo.PageInfo.infos[url];
  delete Metoo.PageInfo.infos[url];
  return pageInfo;
};

Metoo.PageInfo.deleteByTabId = function(tabId) {
  var key = Metoo.PageInfo.find(function(pageInfo) {
    return pageInfo.tabId == tabId ? true : false;
  });
  
  if (key) {
    delete Metoo.PageInfo.infos[key];
  }
  
  return key;
};