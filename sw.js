var CACHE='oldman-lms-v2';
var ASSETS=['index.html','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',function(e){self.skipWaiting();e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}).catch(function(){}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){if(k!==CACHE)return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){
  var u=e.request.url;
  if(u.indexOf('firestore')>-1||u.indexOf('googleapis')>-1||u.indexOf('firebaseio')>-1||u.indexOf('identitytoolkit')>-1||u.indexOf('gstatic')>-1){return;}
  if(e.request.method!=='GET'){return;}
  e.respondWith(caches.match(e.request).then(function(r){return r||fetch(e.request).then(function(resp){try{var cp=resp.clone();caches.open(CACHE).then(function(c){c.put(e.request,cp);});}catch(_){}return resp;}).catch(function(){return caches.match('index.html');});}));
});
