// Email de boas-vindas via Resend (API direta, sem connector gateway)
// Disparado pelo webhook Hotmart quando uma cliente nova compra um plano.

const RESEND_API = "https://api.resend.com/emails";
const FROM = "Desayuno Fit <noreply@desayunofitapp.com>";

interface WelcomeEmailParams {
  to: string;
  nombre?: string | null;
  magicLink: string;
  planLabel: string;
}

export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY no configurada");
  }

  const greeting = params.nombre ? `¡Hola ${params.nombre}! 🌸` : "¡Hola! 🌸";
  const html = renderHtml(greeting, params.magicLink, params.planLabel);

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [params.to],
      subject: "¡Bienvenida a Desayuno Fit! Tu acceso está listo 🥑",
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error [${res.status}]: ${body}`);
  }
}

function renderHtml(greeting: string, magicLink: string, planLabel: string): string {
  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bienvenida a Desayuno Fit</title>
  </head>
  <body style="margin:0;padding:0;background-color:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F2;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
            <tr>
              <td>
                <h1 style="margin:0 0 8px;font-size:26px;color:#3F4A3A;font-weight:700;">${greeting}</h1>
                <p style="margin:0 0 24px;font-size:16px;color:#6B6B6B;line-height:1.5;">
                  Gracias por sumarte a <strong style="color:#3F4A3A;">Desayuno Fit</strong>. Tu plan <strong>${planLabel}</strong> ya está activo y tienes acceso completo a recetas, plan semanal y lista de compras.
                </p>

                <p style="margin:0 0 16px;font-size:16px;color:#3F4A3A;line-height:1.5;">
                  Para entrar por primera vez, solo haz clic en este botón. No necesitas contraseña:
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                  <tr>
                    <td align="center" style="background-color:#E67E5C;border-radius:12px;">
                      <a href="${magicLink}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;">
                        Acceder a mi cuenta
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0;font-size:14px;color:#6B6B6B;line-height:1.6;">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
                  <a href="${magicLink}" style="color:#E67E5C;word-break:break-all;">${magicLink}</a>
                </p>

                <hr style="border:none;border-top:1px solid #EFEAE2;margin:32px 0;" />

                <p style="margin:0 0 8px;font-size:15px;color:#3F4A3A;font-weight:600;">¿Qué puedes hacer ahora?</p>
                <ul style="margin:0 0 0 20px;padding:0;font-size:14px;color:#6B6B6B;line-height:1.7;">
                  <li>Explorar más de 200 recetas saludables 🥣</li>
                  <li>Generar tu plan semanal automático 📅</li>
                  <li>Descargar tu lista de compras lista para el súper 🛒</li>
                </ul>

                <p style="margin:32px 0 0;font-size:13px;color:#9B9B9B;line-height:1.5;">
                  Cualquier duda, responde este correo y te ayudamos.<br />
                  Con cariño, el equipo de Desayuno Fit 💚
                </p>
              </td>
            </tr>
          </table>

          <p style="margin:24px 0 0;font-size:12px;color:#B5B5B5;text-align:center;">
            Recibiste este correo porque acabas de adquirir un plan en Desayuno Fit.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
