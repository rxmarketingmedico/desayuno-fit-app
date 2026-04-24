import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de Privacidad — Desayuno Fit" },
      {
        name: "description",
        content:
          "Política de privacidad de Desayuno Fit: qué datos recopilamos, cómo los usamos, cookies, terceros y tus derechos.",
      },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: PrivacidadPage,
});

function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Volver al inicio
        </Link>

        <h1 className="mt-6 text-3xl md:text-4xl font-bold tracking-tight">
          Política de Privacidad
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última actualización: 24 de abril de 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold">1. Quiénes somos</h2>
            <p>
              Desayuno Fit (en adelante, "nosotros", "nuestro" o el "Servicio")
              es una aplicación web de recetas saludables disponible en{" "}
              <strong>desayunofitapp.com</strong>. Esta política explica cómo
              recopilamos, usamos y protegemos tu información cuando usas
              nuestro sitio o nuestra aplicación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Información que recopilamos</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Datos de cuenta:</strong> correo electrónico, nombre y
                preferencias alimentarias que indicas durante el registro y el
                onboarding.
              </li>
              <li>
                <strong>Datos de uso:</strong> recetas que ves o marcas como
                favoritas, semana planificada, listas de la compra.
              </li>
              <li>
                <strong>Datos técnicos:</strong> tipo de dispositivo, navegador,
                idioma, dirección IP aproximada y páginas visitadas.
              </li>
              <li>
                <strong>Datos de pago:</strong> los pagos se procesan a través
                de Hotmart. No almacenamos los datos de tu tarjeta en nuestros
                servidores.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Cómo usamos tu información</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Para darte acceso a las recetas y a tu plan personalizado.</li>
              <li>Para enviarte correos transaccionales (bienvenida, recuperación de contraseña, recibos).</li>
              <li>Para mejorar el contenido y la experiencia del producto.</li>
              <li>Para cumplir con obligaciones legales y fiscales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Cookies y tecnologías similares</h2>
            <p>
              Usamos cookies propias y de terceros para autenticación, medir el
              uso del Servicio y entender cómo nuestros anuncios funcionan.
              Puedes gestionar las cookies desde la configuración de tu
              navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Terceros que pueden mostrar contenido o usar cookies</h2>
            <p>
              Terceros, incluyendo proveedores de analítica, publicidad y
              afiliados, pueden mostrar contenido y/o usar cookies, balizas web
              y tecnologías similares cuando visitas nuestro sitio. Esto les
              permite ofrecer información personalizada sobre productos y
              servicios. Entre los proveedores que utilizamos:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Meta (Facebook Pixel y Conversions API):</strong> para
                medición publicitaria y atribución de campañas.{" "}
                <a
                  href="https://www.facebook.com/policy.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Política de Meta
                </a>
                .
              </li>
              <li>
                <strong>Google Tag Manager y Google Analytics:</strong> para
                analítica de uso.{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Política de Google
                </a>
                .
              </li>
              <li>
                <strong>Hotmart:</strong> para procesamiento de pagos y gestión
                de suscripciones.
              </li>
              <li>
                <strong>Lovable Cloud (infraestructura backend):</strong> para
                almacenamiento de datos y autenticación.
              </li>
              <li>
                <strong>Programas de afiliados de terceros</strong> (por
                ejemplo, enlaces a productos recomendados): podrán colocar
                cookies en tu navegador para registrar referidos. No
                compartimos información personal identificable con ellos.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Compartir información</h2>
            <p>
              No vendemos tus datos personales. Solo compartimos información
              con los proveedores estrictamente necesarios para operar el
              Servicio (pagos, infraestructura, correo, analítica) y bajo sus
              respectivos acuerdos de tratamiento de datos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Tus derechos</h2>
            <p>
              Puedes solicitar acceso, rectificación, eliminación o
              portabilidad de tus datos personales en cualquier momento
              escribiéndonos al correo de soporte. Responderemos dentro de los
              plazos que establezca la legislación aplicable (GDPR, LGPD u
              otras según tu país de residencia).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Conservación</h2>
            <p>
              Conservamos tu información mientras tu cuenta esté activa o
              mientras sea necesario para cumplir con obligaciones legales.
              Puedes solicitar la eliminación de tu cuenta en cualquier
              momento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Seguridad</h2>
            <p>
              Aplicamos medidas técnicas y organizativas razonables para
              proteger tu información (cifrado en tránsito, control de acceso
              por roles, RLS en la base de datos). Ningún sistema es 100%
              seguro, pero hacemos nuestro mayor esfuerzo por mantenerla
              protegida.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">10. Cambios en esta política</h2>
            <p>
              Podemos actualizar esta política ocasionalmente. Cuando lo
              hagamos, actualizaremos la fecha al inicio del documento y, si
              los cambios son significativos, te avisaremos por correo o
              dentro de la app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">11. Contacto</h2>
            <p>
              Si tienes preguntas sobre esta política o sobre cómo tratamos tus
              datos, escríbenos a{" "}
              <a
                href="mailto:soporte@desayunofitapp.com"
                className="underline"
              >
                soporte@desayunofitapp.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
