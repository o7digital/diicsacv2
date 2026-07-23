const clientesMenuItem = `
<li id="menu-item-clientes" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-clientes">
  <a href="/clientes/"><span class="pxl-menu-item-text">Clientes<i class="caseicon-angle-arrow-down pxl-hide"></i><span class="pxl-item-menu-icon pxl-hide "></span></span></a>
</li>`;

const footerCredit = `<span style="color: rgba(255,255,255,.88);">Copyright © 2024 DIICSA. Todos los derechos reservados. Sitio realizado por <a href="https://www.o7digital.com/" target="_blank" rel="noopener" style="color: #ffffff; font-weight: 800; text-decoration: underline; text-underline-offset: 3px;">o7Digital</a></span>`;
const diicsaLogoImage = `<img width="2048" height="2048" src="/wp-content/uploads/2024/08/diccsA.png" class="attachment-full diicsa-header-logo" alt="DIICSA" style="width:180px !important;height:180px !important;max-width:none !important;object-fit:contain !important;" />`;

const textReplacements = [
  ["DIICSA offers both emergency roof leak and non-emergency roof repair services to both commercial.", "DIICSA ejecuta obra civil, rehabilitacion y mantenimiento general con personal capacitado y seguimiento en cada proyecto."],
  ["5 Electrica Safety Tips To Stay Safe This Summer", "Seguridad electrica para trabajar sin riesgos"],
  ["Panelized Construction Streamlines Construction Process", "Construccion industrial con procesos eficientes"],
  ["Home Renovations Width No Fuss", "Renovaciones sin complicaciones"],
  ["Home Renovations Width No Fuss Good", "Renovaciones sin complicaciones"],
  ["read the article", "Lee el articulo"],
  ["No Comments", "Sin comentarios"],
  ["Call Us 24/7", "Telefono"],
  ["send mail us", "Correo"],
  ["37 San Juan Lane", "Horario"],
  ["Graaf Florisstraat 22A,3021 CH", "Lunes a Viernes, 8 a 17h"],
  ["language", "Idioma"],
  ["English", "Espanol"],
  ["Get A Quote", "Cotizacion"],
  ["Service Details", "Detalle del servicio"],
  ["Project Details", "Detalle del proyecto"],
  ["Blog Details", "Articulo"],
  ["Blog Standard", "Blog"],
  ["Blog Full Width", "Blog"],
  ["Blog Grid", "Blog"],
  ["Project Style", "Proyecto"],
  ["Projects", "Proyectos"],
  ["Services", "Servicios"],
  ["Shop Detail", "Detalle"],
  ["Page 404", "Pagina 404"],
  ["Why Choose Us", "Por que elegirnos"],
  ["What We Do Detail", "Detalle de servicios"],
  ["What We Do", "Que hacemos"],
  ["Working Process", "Proceso de trabajo"],
  ["Testimonials", "Testimonios"],
  ["Team Details", "Detalle del equipo"],
  ["Equipo Details", "Detalle del equipo"],
  ["CINCINNATI, September 26, 2023 (Newswire.com) &#8211; STACK Construction Technologies, a pioneering cloud-based construction platform, announced today a strategic partnership with PCL Construction, a globally renowned 6 billion-dollar USD in work per year General Contractor.", "En DIICSA cada proyecto se analiza desde su alcance real: necesidades tecnicas, tiempos de ejecucion, seguridad en sitio, materiales y seguimiento operativo."],
  ["As we broaden our capabilities and move further into the GC space, this partnership validates that STACK is a serious player in construction technology,” said Phil Ogilby, CEO and Co-Founder of STACK. “STACK is one of the most intuitive and collaborative preconstruction platforms in existence today.", "Nuestro equipo integra planeacion, obra y mantenimiento para entregar soluciones claras a clientes que necesitan construir, rehabilitar o conservar sus instalaciones en operacion."],
  ["Amvic’s SilveRbord", "Proceso DIICSA"],
  ["The partnership is underscored by PCL and STACK’s commitment to innovation in the construction industry. After a rigorous evaluation of the market and multiple competitor software solutions, PCL chose STACK based on the platform’s data availability, cloud collaboration, data security, and integration capabilities.", "Trabajamos con comunicacion directa, control documental y supervision constante para que cada etapa avance con orden, trazabilidad y decisiones oportunas."],
  ["Factory conditions mean that walls are built to a high quality standard", "Planeacion clara antes de iniciar cada frente de trabajo"],
  ["Panelized homes can be constructed in a very short amount of time which means", "Ejecucion supervisada con personal capacitado"],
  ["Panelization allows for a number of variations in home design", "Entrega con seguimiento, mantenimiento y soluciones practicas"],
  ["To integrate the entire building lifecycle into a seamless platform to redefine how the world builds. Vel altera malorum ei. Eam at erat dicat vocent, vel et magna vitae principes, et sea dicit eripuit.", "Construimos con orden, seguridad y responsabilidad para que cada proyecto tenga una ruta clara desde el diagnostico hasta la entrega."],
  ["Barbra Streisand", "DIICSA"],
  ["By leveraging STACK&#8217;s open API, PCL is able to seamlessly integrate their existing workflow to produce better estimating data. Through the cloud-based platform, PCL will have unparalleled flexibility and accessible data, increasing the precision of estimates, minimizing manual processes.", "Nuestro metodo reduce improvisaciones: documentamos avances, coordinamos especialidades y mantenemos al cliente informado durante todo el proceso."],
  ["The Advantages of Panalized Systems", "Ventajas de trabajar con DIICSA"],
  ["A key decision criterion for PCL was based on the fact that STACK is built on a modern cloud technology platform which enables improved collaboration during the quantity takeoff process.", "La experiencia tecnica y la supervision en campo permiten anticipar riesgos, cuidar recursos y entregar resultados alineados con las necesidades del cliente."]
];

const applySharedReplacements = (html) => {
  let next = html;

  for (const [from, to] of textReplacements) {
    next = next.split(from).join(to);
  }

  next = next
    .replace(/<span>\.by<\/span>/gi, "<span>.por</span>")
    .replace(/\.By\s+Osteineur/gi, ".Por Osteineur")
    .replace(/\.by\s*/gi, ".por ")
    .replace(/\bBy&nbsp;/gi, "Por ")
    .replace(/\bBy\s*<\/span>/gi, "Por</span>")
    .replace(/\bVIEW MORE\b/g, "VER MAS")
    .replace(/<img\b(?=[^>]*src=["']\/wp-content\/uploads\/(?:2023\/11|2024\/01)\/logo-1\.png["'])[^>]*>/gi, diicsaLogoImage);

  return next;
};

export const applySiteHead = applySharedReplacements;

export const applySiteHtml = (html) => {
  let next = applySharedReplacements(html);

  next = next.replace(
    /Copyright\s*(?:©|&copy;)\s*2024\s*diicsacv\s*por\s*(?:<a[^>]*>)?o7Digital(?:<\/a>)?\.\s*Todos los derechos reservados\./gi,
    footerCredit
  );

  next = next
    .replace(/<li id="menu-item-14595"[\s\S]*?<\/li>\s*/g, "")
    .replace(/<li id="menu-item-14596"[\s\S]*?<\/li>\s*/g, "");

  if (!next.includes("menu-item-clientes")) {
    next = next.replace(/(<li id="menu-item-14664"[\s\S]*?<\/li>)/g, `${clientesMenuItem}$1`);
  }

  return next;
};
