'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "16d83a6b1099fb72b3f1b926ecc0c216",
"index.html": "a80641cf986d6b928ce8a227c641bd90",
"/": "a80641cf986d6b928ce8a227c641bd90",
"main.dart.js": "6e7aa9a96f652399b9bb802eda3ad100",
"favicon.png": "072fdc069fb4b1880957e49638ca187a",
"icons/Icon-192.png": "072fdc069fb4b1880957e49638ca187a",
"icons/Icon-512.png": "71b70d6baa4952067bf12f7ed079183f",
"manifest.json": "f1ba02762c9c534d84043d961b2f51d5",
"assets/AssetManifest.json": "19a202b43466fa7c9ec235903b902ef8",
"assets/NOTICES": "2e23fd81122086039fc62ca6daa23348",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "b14fcf3ee94e3ace300b192e9e7c8c5d",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/assets/resources/carreras.json": "1611f3506ef0aad6a57786238f523346",
"assets/assets/resources/activities_view.json": "9ef5e6ea8dbfaea184f1417b1934eef3",
"assets/assets/resources/activities.json": "c537cbbbda1ab19886a5e8b08d03ee93",
"assets/assets/img/node_buenfin.jpeg": "13d109e3e7e638881e98dd4997b0856c",
"assets/assets/img/cartel1.jpeg": "e78d25f789a86bb24c3d43ccc36bbb99",
"assets/assets/img/oracle_banner.jpg": "9d87fad3eefced3d436e0b8e5d38fbaf",
"assets/assets/img/cartel2.jpeg": "d348c40bc90cd460492003e003eff09a",
"assets/assets/img/git_buenfin.jpeg": "e4e3bce9a7388476cfa492a9ea4a68c5",
"assets/assets/img/DevHOME_HORIZONTAL.jpeg": "d7b565acc26199c3a7108d411c3a3b53",
"assets/assets/img/cartel3.jpeg": "aed3ebbe693ba690935c1c5f88985507",
"assets/assets/img/postman_buenfin.jpeg": "73288aa9ae56a8489e7cb1d7cc2f547c",
"assets/assets/icons/CISC_240.png": "0e1d7e8b128a1f3b21636a4ad3674269",
"assets/assets/icons/gmail.svg": "23a7dee5995afbb2f9ad3b32799c6f82",
"assets/assets/icons/instagram.png": "54678346db0f8e98973df5955aa88a2c",
"assets/assets/icons/cisc_black-240.png": "e8ebe74c72ad4ef43872f5b3b7187363",
"assets/assets/icons/instagram.svg": "c15b915284e0eb6ace7fd850ec809fe2",
"assets/assets/icons/cisc_white-240.png": "d7e22317f35fa167b41e13f471face87",
"assets/assets/icons/gmail.png": "f9cd5df5bf024f43683fb5a0647e5071",
"assets/assets/icons/facebook.svg": "bfa47fd43d7a39bcedcecff0ca7eeb7e",
"assets/assets/icons/facebook.png": "a0d88d1632659f288739df1f58a91fa8"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
