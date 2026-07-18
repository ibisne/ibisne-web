// iBisne — Service Worker (kill-switch / retiro del PWA de mantenimiento)
// El sitio nuevo NO registra service worker. Este SW existe solo para retirar
// limpiamente cualquier registro viejo (v11.x de la pagina de mantenimiento):
// se instala, borra todos los caches, se desregistra y recarga las pestanas.
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(event){
  event.waitUntil((async function(){
    try {
      var keys = await caches.keys();
      await Promise.all(keys.map(function(k){ return caches.delete(k); }));
      await self.registration.unregister();
      var clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(function(c){ try { c.navigate(c.url); } catch(e){} });
    } catch(e){}
  })());
});
