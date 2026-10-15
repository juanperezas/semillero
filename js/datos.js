/* datos.js
   Carga data/categorias.json y data/matriculados.csv, y deja todo
   disponible en window.DATOS para que filtros.js y graficas.js lo usen.
*/

window.DATOS = { categorias: null, columnas: null, filas: null, indiceColumna: null };

async function cargarDatos() {
  const [catRes, csvRes] = await Promise.all([
    fetch("data/categorias.json"),
    fetch("data/matriculados.csv"),
  ]);
  const categorias = await catRes.json();
  const csvTexto = await csvRes.text();

  const lineas = csvTexto.trim().split("\n");
  const columnas = lineas[0].split(",");
  const filas = new Array(lineas.length - 1);
  for (let i = 1; i < lineas.length; i++) {
    filas[i - 1] = lineas[i].split(",").map(Number);
  }

  const indiceColumna = Object.fromEntries(columnas.map((c, i) => [c, i]));

  window.DATOS = { categorias, columnas, filas, indiceColumna };
  document.dispatchEvent(new CustomEvent("datosCargados"));
}

cargarDatos();
