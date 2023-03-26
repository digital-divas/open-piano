const GHPATH = '/open-piano';

const URLS = [
    `${GHPATH}/`,
    `${GHPATH}/index.html`,
    `${GHPATH}/index.js`
];

const CACHE_NAME = 'open-piano';

// Listener for the install event - precaches our assets list on service worker install.
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        console.log('Installing cache : ' + CACHE_NAME);
        await cache.addAll(URLS);
        console.log('Installed cache.');
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
    event.respondWith(async () => {
        const cache = await caches.open(CACHE_NAME);

        // match the request to our cache
        const cachedResponse = await cache.match(event.request);

        // check if we got a valid response
        if (cachedResponse !== undefined) {
            // Cache hit, return the resource
            console.log('Responding with cache : ' + e.request.url);
            return cachedResponse;
        } else {
            // Otherwise, go to the network
            console.log('File is not cached, fetching : ' + e.request.url);
            return fetch(event.request);
        };
    });
});