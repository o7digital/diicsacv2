const clientesMenuItem = `
<li id="menu-item-clientes" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-clientes">
  <a href="/clientes/"><span class="pxl-menu-item-text">Clientes<i class="caseicon-angle-arrow-down pxl-hide"></i><span class="pxl-item-menu-icon pxl-hide "></span></span></a>
</li>`;

const footerCredit = `<span style="color: rgba(255,255,255,.88);">Sitio realizado por <a href="https://www.o7digital.com/" target="_blank" rel="noopener" style="color: #ffffff; font-weight: 800; text-decoration: underline; text-underline-offset: 3px;">o7Digital</a></span>`;

export const applySiteHtml = (html) => {
  let next = html.replace(
    "DIICSA offers both emergency roof leak and non-emergency roof repair services to both commercial.",
    "DIICSA ejecuta obra civil, rehabilitacion y mantenimiento general con personal capacitado y seguimiento en cada proyecto."
  );

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
