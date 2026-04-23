# Banner de instalação PWA

## Contexto

O `manifest.json` já está configurado com `display: "standalone"`, ícones e `start_url: /app/recetas` — ou seja, o app já é tecnicamente instalável. Falta apenas a UI que **convida** a usuária a instalar.

Cada navegador trata isso de forma diferente:

- **Android / Chrome / Edge**: dispara o evento `beforeinstallprompt`, que permite mostrar um botão "Instalar" nativo via `prompt()`.
- **iOS / Safari**: NÃO suporta `beforeinstallprompt`. O único caminho é mostrar instruções manuais ("Toque em Compartilhar → Adicionar à Tela de Início").
- **Já instalado**: detectável via `display-mode: standalone` ou `navigator.standalone` (iOS) — nesse caso, não mostrar nada.

## O que será construído

Um único componente `<PWAInstallBanner />` montado no layout autenticado (`src/routes/_authenticated.app.tsx`), que:

1. **Só aparece em mobile** (usa o hook existente `useIsMobile`).
2. **Não aparece se já estiver instalado** (display-mode standalone).
3. **Não aparece em iframes** (preview do Lovable) — evita ruído no editor.
4. **Aparece após pequeno delay** (~3s) para não atrapalhar o primeiro carregamento.
5. **Pode ser dispensado** com botão "Agora não" — guarda flag em `localStorage` (`pwa-install-dismissed-at`) e só volta a aparecer após 7 dias.
6. **Comportamento adaptativo por plataforma**:
   - **Android**: captura `beforeinstallprompt`, mostra botão "Instalar app" que chama `deferredPrompt.prompt()`.
   - **iOS**: detecta via user agent, mostra card com ícone de Compartilhar (⎙) + texto: *"Toque em Compartilhar e depois em 'Adicionar à Tela de Início'"*.
7. **Visual**: card flutuante na parte inferior (acima da tab bar mobile), com logo do app, título "Instala Desayuno Fit", subtexto curto, botão primário e botão "Agora não". Usa tokens de design existentes (`bg-card`, `text-primary`, `rounded-lg`, `shadow-lg`).

## Arquivos

**Criar:**
- `src/hooks/usePWAInstall.tsx` — hook que encapsula toda a lógica:
  - Estado: `canInstall`, `platform` (`'android' | 'ios' | null`), `isInstalled`, `promptInstall()`, `dismiss()`.
  - Listener de `beforeinstallprompt` + `appinstalled`.
  - Detecção de iOS via user agent.
  - Detecção de standalone via `matchMedia('(display-mode: standalone)')` e `navigator.standalone`.
  - Verifica `localStorage` para respeitar dismissal recente.
  - Guard para não rodar em iframe nem em hosts de preview do Lovable.

**Criar:**
- `src/components/PWAInstallBanner.tsx` — UI do banner, consome o hook, renderiza variante Android vs iOS.

**Editar:**
- `src/routes/_authenticated.app.tsx` — montar `<PWAInstallBanner />` dentro do layout (após o `<Outlet />`), só no escopo do app autenticado (não na landing).

## Detalhes técnicos relevantes

- `beforeinstallprompt` precisa ser capturado com `e.preventDefault()` e guardado em ref/estado para uso posterior; o evento dispara uma única vez por sessão.
- O componente é **client-only**: todos os acessos a `window`, `navigator`, `localStorage` ficam dentro de `useEffect` para não quebrar SSR do TanStack Start.
- Posicionamento: `fixed bottom-20 md:bottom-4 inset-x-4` (acima da tab bar mobile que tem `pb-20`).
- z-index acima da tab bar (`z-40`).
- Animação de entrada simples com Tailwind (`animate-in slide-in-from-bottom`).

## Fora do escopo

- Service worker / cache offline (não solicitado, e o guia interno do projeto recomenda evitar SW no ambiente Lovable).
- Banner na landing pública (`/`) — só no app autenticado, onde a usuária já demonstrou interesse.
- Tracking analytics do install (pode ser adicionado depois se quiser).
