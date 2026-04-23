// Service worker mínimo — sem cache offline.
// Existe apenas para satisfazer os critérios de "installable PWA" do Chrome/Edge,
// que exigem um SW registrado para disparar o evento `beforeinstallprompt`.
//
// Estratégia: network-only. Tudo passa direto, nada é armazenado.
// Isso evita os problemas clássicos de SW (conteúdo velho, navegação travada).

self.addEventListener("install", (event) => {
  // Ativa imediatamente sem esperar abas antigas fecharem.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Toma controle de todas as abas abertas no scope.
  event.waitUntil(self.clients.claim());
});

// Sem listener de fetch = browser usa rede normal.
// Mas o Chrome exige um handler 'fetch' para considerar o app installable.
// Implementamos um pass-through puro (network-only).
self.addEventListener("fetch", (event) => {
  // Não intercepta nada. Comportamento padrão da rede.
  return;
});
