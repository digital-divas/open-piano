// const GHPATH = '/open-piano';
// const APP_PREFIX = 'oppwa_';
// const VERSION = 'version_001';
// const URLS = [
//     `${GHPATH}/`,
//     `${GHPATH}/index.html`,
//     `${GHPATH}/index.js`
// ];

// const CACHE_NAME = APP_PREFIX + VERSION;

// /**
//  * @type {Clients}
//  */
// const _clients = clients;

// // Listener for the install event - precaches our assets list on service worker install.
// self.addEventListener('install', e => {
//     /**
//      * @type {ExtendableEvent} 
//      */
//     const event = e;

//     event.waitUntil((async () => {
//         try {
//             const cache = await caches.open(CACHE_NAME);
//             console.log('Installing cache : ' + CACHE_NAME);
//             await cache.addAll(URLS);
//             console.log('Installed cache.');
//         } catch (err) {
//             console.error('Error on install', err);
//         }
//     })());
// });

// self.addEventListener('activate', e => {
//     /**
//      * @type {ExtendableEvent} 
//      */
//     const event = e;
//     event.waitUntil(async () => {
//         try {
//             // return _clients.claim();
//             const keyList = await caches.keys();
//             const cacheWhitelist = keyList.filter(key => key.indexOf(APP_PREFIX));
//             cacheWhitelist.push(CACHE_NAME);

//             return Promise.all(keyList.map((key, i) => {
//                 if (cacheWhitelist.indexOf(key) === -1) {
//                     console.log('Deleting cache : ' + keyList[i]);
//                     return caches.delete(keyList[i]);
//                 }
//             }));
//         } catch (err) {
//             console.error('Error on activate', err);
//         }
//     });
// });

// self.addEventListener('fetch', e => {
//     /**
//      * @type {FetchEvent} 
//      */
//     const event = e;
//     console.log('Fetch request : ' + event.request.url);
//     event.respondWith(async () => {
//         try {
//             // match the request to our cache
//             const cachedResponse = await caches.match(event.request);

//             // check if we got a valid response
//             if (cachedResponse) {
//                 // Cache hit, return the resource
//                 console.log('Responding with cache : ' + event.request.url);
//                 return cachedResponse;
//             } else {
//                 // Otherwise, go to the network
//                 console.log('File is not cached, fetching : ' + event.request.url);
//                 return fetch(event.request);
//             };
//         } catch (err) {
//             console.error('Error on fetch', err);
//         }
//     });
// });

var GHPATH = '/open-piano';
var APP_PREFIX = 'gppwa_';
var VERSION = 'version_002';
var URLS = [
    `${GHPATH}/`,
    `${GHPATH}/index.html`,
    `${GHPATH}/index.js`
];

var CACHE_NAME = APP_PREFIX + VERSION;
self.addEventListener('fetch', function (e) {
    console.log('Fetch request : ' + e.request.url);
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) {
                console.log('Responding with cache : ' + e.request.url);
                return request;
            } else {
                console.log('File is not cached, fetching : ' + e.request.url);
                return fetch(e.request);
            }
        })
    );
});

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('Installing cache : ' + CACHE_NAME);
            return cache.addAll(URLS);
        })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            var cacheWhitelist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheWhitelist.push(CACHE_NAME);
            return Promise.all(keyList.map(function (key, i) {
                if (cacheWhitelist.indexOf(key) === -1) {
                    console.log('Deleting cache : ' + keyList[i]);
                    return caches.delete(keyList[i]);
                }
            }));
        })
    );
});