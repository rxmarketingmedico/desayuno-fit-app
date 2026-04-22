
# Etapa 2: Landing pública + Login estilizado

## Arquivos a criar/editar

### 1. `src/routes/index.tsx` (REESCREVER) — Landing pública
Remover placeholder atual e criar landing completa com:
- **Header sticky** com logo "Desayuno Fit" + botão "Ya compré, acceder" → `/login`
- **Hero**: título grande, subtítulo, CTA principal "Empieza hoy" (scroll pra planos), foto Unsplash de café da manhã
- **Sección "¿Qué incluye?"**: 4 cards com ícones (Lucide) — recetas, plan semanal, lista de compras, app mobile
- **3 cards de planos** (Mensual $9, Semestral $29 com badge "Más popular", Anual $47 com badge "Mejor valor") — cada um abre URL Hotmart em nova aba
- **3 testimonios** (cards com nome + cidade + texto)
- **FAQ** (4 perguntas em accordion shadcn)
- **Footer** com link login + texto institucional
- `head()` com title/description/og em espanhol LATAM
- Tom caloroso, mulheres 28-55, espanhol neutro

### 2. `src/routes/login.tsx` (REESCREVER) — Login estilizado
- Layout split em 2 colunas no desktop: foto à esquerda + formulário à direita
- Mobile: só formulário, com header colorido em cima
- **Remover botão "Crear cuenta"** (signup público não faz sentido — só Hotmart cria contas) — substituir por link "¿Aún no tienes cuenta? Empieza aquí" que abre URL Hotmart Mensual
- Manter campos email/senha + esqueci a senha + login funcional
- Aplicar paleta coral/oliva/creme

### 3. Configuração de URLs Hotmart
Como você ainda não passou os links Hotmart reais, vou:
- Criar arquivo `src/config/hotmart.ts` com 3 constantes lendo de `import.meta.env`
- Usar placeholders `#` quando env vars não estiverem definidas + mostrar toast "Próximamente disponible" no clique
- Adicionar 3 env vars no `.env`:
  - `VITE_HOTMART_CHECKOUT_URL_MENSUAL`
  - `VITE_HOTMART_CHECKOUT_URL_SEMESTRAL`
  - `VITE_HOTMART_CHECKOUT_URL_ANUAL`

### 4. Componentes auxiliares
- `src/components/landing/PricingCard.tsx` — card de plano reutilizável
- `src/components/landing/FeatureCard.tsx` — card de benefício
- `src/components/landing/TestimonialCard.tsx` — card de depoimento

### 5. Imagens
Usar URLs Unsplash diretas (sem upload) pra:
- Hero da landing (mesa de café da manhã saudável)
- Coluna lateral do login (smoothie bowl ou similar)

## O que NÃO faz parte desta etapa
- Catálogo real de receitas → Etapa 3
- Configuração de domínio de email → Etapa 6
- Webhook Hotmart → Etapa 6
- Página `/plan-expirado` → Etapa 5

## Entregável
Preview navegável: `/` (landing completa) → clicar "Ya compré, acceder" → `/login` estilizado → login funciona → `/app` (placeholder).

Após validação, sigo pra Etapa 3 (catálogo + filtros + detalhe + favoritos).
