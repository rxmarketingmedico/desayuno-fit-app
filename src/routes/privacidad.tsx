import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/logo.webp";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de Privacidad — Desayuno Fit" },
      {
        name: "description",
        content:
          "Política de privacidad de Desayuno Fit: cómo recopilamos, usamos y protegemos tus datos. Información sobre cookies y servicios de terceros.",
      },
      { property: "og:title", content: "Política de Privacidad — Desayuno Fit" },
      {
        property: "og:description",
        content:
          "Cómo recopilamos, usamos y protegemos tus datos en Desayuno Fit.",
      },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: PrivacidadPage,
});

function PrivacidadPage() {
  const lastUpdate = "23 de abril de 2026";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="Desayuno Fit">
            <img src={logo} alt="Desayuno Fit" className="h-10 w-10 object-contain" />
            <span className="font-display font-semibold text-secondary">Desayuno Fit</span>
          </Link>
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            ← Volver al inicio
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-secondary">
          Política de Privacidad
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última actualización: {lastUpdate}
        </p>

        <div className="prose prose-sm md:prose-base mt-8 space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold text-secondary mb-3">
              1. Introducción
            </h2>
            <p>
              En <strong>Desayuno Fit</strong> respetamos tu privacidad y nos
              comprometemos a proteger los datos personales que compartes con
              nosotros. Esta política describe qué información recopilamos, cómo
              la usamos y qué derechos tienes sobre ella.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-secondary mb-3">
              2. Información que recopilamos
            </h2>
            <p>Recopilamos los siguientes datos cuando usas nuestro servicio:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Datos de cuenta:</strong> nombre, correo electrónico y
                contraseña cifrada al registrarte.
              </li>
              <li>
                <strong>Preferencias:</strong> recetas favoritas, plan semanal,
                lista de compras y respuestas del onboarding.
              </li>
              <li>
                <strong>Datos de pago:</strong> los procesa Hotmart; nosotros
                solo recibimos confirmación de la compra.
              </li>
              <li>
                <strong>Datos técnicos:</strong> dirección IP, tipo de
                dispositivo, navegador y páginas visitadas.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-secondary mb-3">
              3. Cómo usamos tu información
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Para darte acceso a las recetas y a tu plan personalizado.</li>
              <li>Para enviarte correos relacionados con tu cuenta y compra.</li>
              <li>Para mejorar el servicio y prevenir fraudes.</li>
              <li>Para cumplir obligaciones legales.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-secondary mb-3">
              4. Cookies y tecnologías similares
            </h2>
            <p>
              Usamos cookies y tecnologías similares (almacenamiento local,
              pixels) para mantener tu sesión iniciada, recordar tus
              preferencias y medir el desempeño de nuestras campañas.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-secondary mb-3">
              5. Servicios de terceros
            </h2>
            <p>
              Trabajamos con proveedores externos que pueden mostrar contenido,
              recopilar datos y usar cookies en nuestros visitantes para
              proporcionar funcionalidad esencial, analítica y publicidad. Entre
              ellos:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Hotmart:</strong> procesamiento de pagos y gestión de
                suscripciones.
              </li>
              <li>
                <strong>Meta (Facebook/Instagram):</strong> medición de
                conversiones publicitarias mediante el Meta Pixel.
              </li>
              <li>
                <strong>Google (Tag Manager / Analytics):</strong> análisis de
                tráfico y comportamiento del sitio.
              </li>
              <li>
                <strong>Proveedor de infraestructura backend:</strong>{" "}
                almacenamiento seguro de datos de cuenta y autenticación.
              </li>
              <li>
                <strong>Programas de afiliados de terceros:</strong> podemos
                incluir enlaces a tiendas externas (por ejemplo, programas de
                afiliados de marketplaces). Estos terceros pueden colocar
                cookies y recopilar información sobre tu actividad para atribuir
                comisiones y mostrar anuncios personalizados.
              </li>
            </ul>
            <p className="mt-3">
              Cada uno de estos terceros opera bajo su propia política de
              privacidad, sobre la cual no tenemos control.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-secondary mb-3">
              6. Conservación de datos
            </h2>
            <p>
              Conservamos tus datos mientras tengas una cuenta activa. Si
              cancelas, mantenemos cierta información por obligaciones fiscales
              y legales durante el plazo que la ley exija.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-secondary mb-3">
              7. Tus derechos
            </h2>
            <p>
              Puedes solicitar en cualquier momento acceder, corregir, eliminar
              o portar tus datos, así como retirar tu consentimiento al
              tratamiento. Para ejercer estos derechos, escríbenos al correo
              indicado abajo.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-secondary mb-3">
              8. Seguridad
            </h2>
            <p>
              Aplicamos medidas técnicas y organizativas razonables para
              proteger tus datos: cifrado en tránsito (HTTPS), contraseñas
              hasheadas y controles de acceso a la base de datos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-secondary mb-3">
              9. Cambios en esta política
            </h2>
            <p>
              Podemos actualizar esta política periódicamente. Publicaremos la
              versión vigente en esta misma página con su fecha de
              actualización.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-secondary mb-3">
              10. Contacto
            </h2>
            <p>
              Si tienes preguntas sobre esta política o sobre el tratamiento de
              tus datos, escríbenos a{" "}
              <a
                href="mailto:hola@desayunofitapp.com"
                className="text-primary hover:underline"
              >
                hola@desayunofitapp.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center">
          <Link
            to="/"
            className="text-sm text-primary hover:underline font-medium"
          >
            ← Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
