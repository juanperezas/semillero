/* graficas.js
   Con los datos ya cargados y el filtro activo, calcula las filas que
   cumplen el filtro, actualiza los KPIs y (re)dibuja todas las gráficas.
*/

const COLORES = ["#2f6fed", "#15181c", "#7aa7f0", "#9aa5b1", "#c3d7fb", "#3b4450", "#aec8fa"];
const instanciasChart = {}; // para destruir y volver a crear al reaplicar filtros

function filasQueCumplenFiltro() {
  const { filas, indiceColumna } = DATOS;
  const entradas = Object.entries(FILTRO_ACTIVO); // [ [col, Set(codigos)], ... ]
  if (!entradas.length) return filas;

  return filas.filter((fila) =>
    entradas.every(([col, codigos]) => codigos.has(fila[indiceColumna[col]]))
  );
}

function contarPorColumna(filasFiltradas, col, topN = null) {
  const idx = DATOS.indiceColumna[col];
  const etiquetas = DATOS.categorias[col];
  const conteo = new Map();
  filasFiltradas.forEach((fila) => {
    const codigo = fila[idx];
    conteo.set(codigo, (conteo.get(codigo) || 0) + 1);
  });
  let resultado = Array.from(conteo.entries())
    .map(([codigo, total]) => ({ nombre: etiquetas[codigo], total }))
    .sort((a, b) => b.total - a.total);
  if (topN) resultado = resultado.slice(0, topN);
  return resultado;
}

function dibujarDona(idCanvas, idLeyenda, datos, totalFilas) {
  const el = document.getElementById(idCanvas);
  if (instanciasChart[idCanvas]) instanciasChart[idCanvas].destroy();
  instanciasChart[idCanvas] = new Chart(el, {
    type: "doughnut",
    data: {
      labels: datos.map((d) => d.nombre),
      datasets: [{ data: datos.map((d) => d.total), backgroundColor: COLORES }],
    },
    options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } } } },
  });
  pintarLeyenda(idLeyenda, datos, totalFilas);
}

function dibujarBarras(idCanvas, datos, horizontal = false) {
  const el = document.getElementById(idCanvas);
  if (instanciasChart[idCanvas]) instanciasChart[idCanvas].destroy();
  instanciasChart[idCanvas] = new Chart(el, {
    type: "bar",
    data: {
      labels: datos.map((d) => d.nombre),
      datasets: [{ data: datos.map((d) => d.total), backgroundColor: "#2f6fed" }],
    },
    options: {
      indexAxis: horizontal ? "y" : "x",
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } },
    },
  });
}

function pintarLeyenda(idLeyenda, datos, totalFilas) {
  const ul = document.getElementById(idLeyenda);
  if (!ul) return;
  ul.innerHTML = datos
    .map((d) => {
      const pct = totalFilas ? ((d.total / totalFilas) * 100).toFixed(1) : "0.0";
      return `<li><span>${d.nombre}</span><span>${d.total.toLocaleString("es-CO")} (${pct}%)</span></li>`;
    })
    .join("");
}

function actualizarKpis(filasFiltradas) {
  const total = filasFiltradas.length;
  const porc = (col, valor) => {
    const idx = DATOS.indiceColumna[col];
    const codigo = DATOS.categorias[col].indexOf(valor);
    if (!total || codigo === -1) return "0%";
    const n = filasFiltradas.filter((f) => f[idx] === codigo).length;
    return ((n / total) * 100).toFixed(1) + "%";
  };
  const facultadTop = contarPorColumna(filasFiltradas, "Facultad", 1)[0];

  document.getElementById("kpiTotal").textContent = total.toLocaleString("es-CO");
  document.getElementById("kpiMujeres").textContent = porc("Sexo", "Femenino");
  document.getElementById("kpiPregrado").textContent = porc("Tipo Programa", "Pregrado");
  document.getElementById("kpiPresencial").textContent = porc("Modalidad", "Presencial");
  document.getElementById("kpiFacultadTop").textContent = facultadTop ? facultadTop.nombre : "—";

  document.getElementById("contadorFiltrados").textContent =
    total.toLocaleString("es-CO") + " estudiantes";
}

function renderizarTodo() {
  const filasFiltradas = filasQueCumplenFiltro();
  const total = filasFiltradas.length;

  actualizarKpis(filasFiltradas);

  dibujarDona("chartSexo", "leyendaSexo", contarPorColumna(filasFiltradas, "Sexo"), total);
  dibujarBarras("chartEstrato", contarPorColumna(filasFiltradas, "Id Estrato"));
  pintarLeyenda("leyendaEstrato", contarPorColumna(filasFiltradas, "Id Estrato"), total);

  dibujarDona("chartFacultad", "leyendaFacultad", contarPorColumna(filasFiltradas, "Facultad"), total);
  dibujarDona("chartArea", "leyendaArea", contarPorColumna(filasFiltradas, "Area Conocimiento"), total);
  dibujarDona("chartModalidad", "leyendaModalidad", contarPorColumna(filasFiltradas, "Modalidad"), total);
  dibujarDona("chartTipoPrograma", "leyendaTipoPrograma", contarPorColumna(filasFiltradas, "Tipo Programa"), total);

  dibujarBarras("chartProgramas", contarPorColumna(filasFiltradas, "Nombre Programa", 10), true);
  dibujarBarras("chartSedes", contarPorColumna(filasFiltradas, "Sede", 10), true);
  dibujarBarras("chartCiudades", contarPorColumna(filasFiltradas, "Ciudad Nacimiento", 10), true);
  dibujarBarras("chartPaises", contarPorColumna(filasFiltradas, "Pais Nacimiento", 10), true);
}

document.addEventListener("filtrosAplicados", renderizarTodo);
