// Mantido só por compatibilidade: browsers que já tinham este SW registado
// continuam a receber push até a app registar o /sw.js (que o substitui no
// mesmo scope "/"). Toda a lógica vive agora em /sw.js.
importScripts("/sw.js");
