// Wrapper para a API oficial da Hotmart (Sales History).
// Docs: https://developers.hotmart.com/docs/en/v1/sales/sales-history/
//
// Fluxo de auth:
//   1. POST /security/oauth/token com client_credentials -> access_token (1h)
//   2. Cache em memória do server runtime (boa pra serverless: 1 req = 1 token)
//   3. Chamadas seguintes vão pra https://developers.hotmart.com/payments/api/v1/...

const TOKEN_URL = "https://api-sec-vlc.hotmart.com/security/oauth/token";
const API_BASE = "https://developers.hotmart.com/payments/api/v1";

interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
}

// Cache em escopo de módulo. Vive enquanto o worker estiver aquecido.
let cached: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 30_000) {
    return cached.token;
  }

  const clientId = process.env.HOTMART_CLIENT_ID;
  const clientSecret = process.env.HOTMART_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "HOTMART_CLIENT_ID o HOTMART_CLIENT_SECRET no configurados",
    );
  }

  const basic = btoa(`${clientId}:${clientSecret}`);

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${TOKEN_URL}?${params.toString()}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Hotmart OAuth error [${res.status}]: ${body}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number; // segundos
  };

  cached = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

// ---------- Tipagens dos campos que usamos ----------

export interface HotmartTransaction {
  transaction: string;
  approved_date?: number; // epoch ms
  order_date?: number;
  status?: string; // APPROVED, REFUNDED, CHARGEBACK, COMPLETE, ...
  product?: {
    id?: number;
    name?: string;
  };
  buyer?: {
    name?: string;
    email?: string;
    ucode?: string;
    document?: string;
  };
  payment?: {
    method?: string;
    installments_number?: number;
    type?: string;
  };
  price?: {
    value?: number;
    currency_code?: string; // BRL, USD, EUR, MXN, ARS...
  };
  commission_as?: string; // PRODUCER, CO_PRODUCER, AFFILIATE
  offer?: {
    code?: string;
    payment_mode?: string;
  };
}

interface HotmartListResponse<T> {
  items: T[];
  page_info?: {
    next_page_token?: string;
    total_results?: number;
  };
}

// ---------- Endpoints públicos ----------

interface ListSalesParams {
  buyer_email?: string;
  start_date?: number; // epoch ms
  end_date?: number;
  transaction_status?: string;
  max_results?: number;
}

export async function listSales(
  params: ListSalesParams = {},
): Promise<HotmartTransaction[]> {
  const token = await getAccessToken();

  const search = new URLSearchParams();
  if (params.buyer_email) search.set("buyer_email", params.buyer_email);
  if (params.start_date) search.set("start_date", String(params.start_date));
  if (params.end_date) search.set("end_date", String(params.end_date));
  if (params.transaction_status)
    search.set("transaction_status", params.transaction_status);
  search.set("max_results", String(params.max_results ?? 50));

  const url = `${API_BASE}/sales/history?${search.toString()}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Hotmart sales/history error [${res.status}]: ${body}`);
  }

  const data = (await res.json()) as HotmartListResponse<HotmartTransaction>;
  return data.items ?? [];
}

// Resumo agregado (1 chamada) para mostrar valor total e moeda na lista.
export interface BuyerSummary {
  totalApproved: number;
  totalRefunded: number;
  currency: string | null;
  transactionCount: number;
  lastTransaction: HotmartTransaction | null;
}

export async function getBuyerSummary(email: string): Promise<BuyerSummary> {
  const items = await listSales({ buyer_email: email, max_results: 50 });

  let totalApproved = 0;
  let totalRefunded = 0;
  let currency: string | null = null;
  let lastTransaction: HotmartTransaction | null = null;
  let lastDate = 0;

  for (const t of items) {
    const value = t.price?.value ?? 0;
    if (t.price?.currency_code && !currency) currency = t.price.currency_code;

    const status = (t.status ?? "").toUpperCase();
    if (status === "APPROVED" || status === "COMPLETE") {
      totalApproved += value;
    } else if (status === "REFUNDED" || status === "CHARGEBACK") {
      totalRefunded += value;
    }

    const d = t.approved_date ?? t.order_date ?? 0;
    if (d > lastDate) {
      lastDate = d;
      lastTransaction = t;
    }
  }

  return {
    totalApproved,
    totalRefunded,
    currency,
    transactionCount: items.length,
    lastTransaction,
  };
}
