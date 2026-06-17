importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Config hardcoded — SWs não têm acesso a process.env
firebase.initializeApp({
  apiKey: "AIzaSyDheF9baAGJE8BBNKaCRoFs537nxLjvIsw",
  authDomain: "tchilla-hmg.firebaseapp.com",
  databaseURL: "https://tchilla-hmg-default-rtdb.firebaseio.com",
  projectId: "tchilla-hmg",
  storageBucket: "tchilla-hmg.firebasestorage.app",
  messagingSenderId: "879571708226",
  appId: "1:879571708226:web:6a4c958392e7a202dec0db",
});

const messaging = firebase.messaging();

// Recebe push quando a tab está em background ou fechada
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification ?? {};
  self.registration.showNotification(title ?? 'Tchilla Admin', {
    body: body ?? '',
    icon: icon ?? '/assets/vectores/logotipo.svg',
    badge: '/admin_favicon.png',
    data: payload.data,
    tag: payload.data?.reservaId ?? 'tchilla-notif',
    renotify: true,
  });
});
