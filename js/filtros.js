/* filtros.js
   Construye el panel desplegable de filtros a partir de categorias.json
   y dispara el evento "filtrosAplicados" con los códigos seleccionados.
*/

const ETIQUETAS_COLUMNA = {
  "Sexo": "Sexo",
  "Sede": "Sede",
  "Facultad": "Facultad",
  "Area Conocimiento": "Área del conocimiento",
  "Nombre Programa": "Programa / carrera",
  "Modalidad": "Modalidad",
  "Tipo Programa": "Tipo de programa",
  "Tipo Inscripcion": "Tipo de inscripción",
  "Id Estrato": "Estrato",
  "Ciudad Nacimiento": "Ciudad de nacimiento",
  "Pais Nacimiento": "País de nacimiento",
};

window.FILTRO_ACTIVO = {}; // { "Sexo": Set([0,1]), ... } -> solo columnas con selección

function construirPanelFiltros() {
  const cont = document.getElementById("contenedorFiltros");
  const { categorias, columnas } = DATOS;
  cont.innerHTML = "";

  columnas.forEach((col) => {
    const valores = categorias[col]
      .map((texto, codigo) => ({ texto, codigo }))
      .sort((a, b) => a.texto.localeCompare(b.texto, "es"));

    const grupo = document.createElement("div");
    grupo.className = "filtro-grupo";
    grupo.innerHTML = `
      <label>${ETIQUETAS_COLUMNA[col] || col}</label>
      <input type="text" class="filtro-buscar" placeholder="Buscar...">
      <select multiple size="6" data-col="${col}">
        ${valores.map((v) => `<option value="${v.codigo}">${v.texto}</option>`).join("")}
      </select>
    `;
    cont.appendChild(grupo);

    const input = grupo.querySelector(".filtro-buscar");
    const select = grupo.querySelector("select");
    input.addEventListener("input", () => {
      const texto = input.value.toLowerCase();
      Array.from(select.options).forEach((op) => {
        op.hidden = !op.textContent.toLowerCase().includes(texto);
      });
    });
  });
}

function leerSeleccionActual() {
  const filtro = {};
  document.querySelectorAll("#contenedorFiltros select").forEach((select) => {
    const seleccionados = Array.from(select.selectedOptions).map((op) => Number(op.value));
    if (seleccionados.length) filtro[select.dataset.col] = new Set(seleccionados);
  });
  return filtro;
}

function actualizarBadge() {
  const badge = document.getElementById("badgeFiltros");
  const n = Object.keys(FILTRO_ACTIVO).length;
  badge.textContent = n;
  badge.hidden = n === 0;
}

function abrirPanel() {
  document.getElementById("panelFiltros").classList.add("abierto");
  document.getElementById("panelFiltros").setAttribute("aria-hidden", "false");
  document.getElementById("overlayFiltros").hidden = false;
  document.getElementById("btnFiltros").setAttribute("aria-expanded", "true");
}
function cerrarPanel() {
  document.getElementById("panelFiltros").classList.remove("abierto");
  document.getElementById("panelFiltros").setAttribute("aria-hidden", "true");
  document.getElementById("overlayFiltros").hidden = true;
  document.getElementById("btnFiltros").setAttribute("aria-expanded", "false");
}

document.addEventListener("datosCargados", () => {
  construirPanelFiltros();

  document.getElementById("btnFiltros").addEventListener("click", abrirPanel);
  document.getElementById("btnCerrarFiltros").addEventListener("click", cerrarPanel);
  document.getElementById("overlayFiltros").addEventListener("click", cerrarPanel);

  document.getElementById("btnAplicar").addEventListener("click", () => {
    FILTRO_ACTIVO = leerSeleccionActual();
    actualizarBadge();
    cerrarPanel();
    document.dispatchEvent(new CustomEvent("filtrosAplicados"));
  });

  document.getElementById("btnLimpiar").addEventListener("click", () => {
    document.querySelectorAll("#contenedorFiltros select").forEach((s) => s.selectedIndex = -1);
    document.querySelectorAll(".filtro-buscar").forEach((i) => (i.value = ""));
    document.querySelectorAll("#contenedorFiltros option").forEach((o) => (o.hidden = false));
    FILTRO_ACTIVO = {};
    actualizarBadge();
    document.dispatchEvent(new CustomEvent("filtrosAplicados"));
  });

  // Primer render, sin filtros
  document.dispatchEvent(new CustomEvent("filtrosAplicados"));
});
