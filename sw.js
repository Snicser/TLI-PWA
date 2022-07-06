const STATIC_CACHE_NAME = 'tlipwa-static-cache-v1';
const assets = [
    // FAV ICON
    'favicon.ico',
    // HTML
    'index.html',
    '404.html',
    'app/about.html',
    'app/demo.html',
    'app/home.html',
    'app/loader.html',
    'app/login.html',
    'app/logout.html',
    'app/profile.html',
    'app/search.html',
    'app/statistics.html',
    'app/add-group.html',
    'app/tos.html',
    'strategy/info.html',
    'strategy/practice.html',
    // CSS
    'css/bootstrap.min.css',
    'css/demo.css',
    'css/login.css',
    'css/animations.css',
    'css/normalize.css',
    'css/profile.css',
    'css/style.css',
    'css/search.css',
    'css/info.css',
    // IMAGES
    'images/learning-strategies-icon-generic.png',
    // JS
    'js/app.js',
    'js/content.js',
    'js/debug.js',
    'js/html5-qrcode.min.js',
    'js/local-database.js',
    'js/main.js',
    'js/modal.js',
    'js/profile.js',
    'js/search.js',
    'js/statistics.js',
    'js/strategy.js',
    'js/user.js',
    'js/install.js',
    'sw.js',

    // CONFIG
    'config.json',
    'webmanifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Poppins'
];


// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then((cache) => {
            return cache.addAll(assets);
        }).catch(error => console.log(`Error while trying to cache; ${error}`))
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cacheRes => {
            return cacheRes || fetch(event.request).then(fetchRes => {
                return caches.open(dynamicCacheName).then(cache => {
                    cache.put(event.request.url, fetchRes.clone());
                        return fetchRes;
                })
            });
        })
    );
});

// Activate event
const dynamicCacheName = 'tlipwa-dynamic-v1';
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key =>  key !== dynamicCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});