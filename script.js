let datosEncuesta = [];
let chartGeneral, chartEdad;

const colores = ["Rojo", "Azul", "Verde", "Amarillo", "Naranja", "Morado"];

// Leer archivo JSON
fetch("data.json")
  .then(response => response.json())
  .then(data => {
    datosEncuesta = data;
    inicializarGraficos();
    document.getElementById("edadFiltro").addEventListener("change", actualizarPorEdad);
  })
  .catch(error => console.error("Error al cargar el archivo JSON:", error));

// Obtener rangos de edad seleccionados
function obtenerEdadesSeleccionadas() {
  const opciones = document.getElementById("edadFiltro").selectedOptions;
  return Array.from(opciones).map(option => option.value);
}

// Contar preferencias por color con filtro de edad
function contarColores(filtroEdades = []) {
  const conteo = Object.fromEntries(colores.map(c => [c, 0]));

  datosEncuesta.forEach(entry => {
    const edad = (typeof entry.edad === 'string' && entry.edad.trim() !== '')
      ? entry.edad.trim()
      : "Desconocido";

    if (filtroEdades.length === 0 || filtroEdades.includes(edad)) {
      if (conteo.hasOwnProperty(entry.color)) {
        conteo[entry.color]++;
      }
    }
  });

  return conteo;
}

// Inicializa gráficos
function inicializarGraficos() {
  const ctxGeneral = document.getElementById("chartGeneral").getContext("2d");
  const ctxEdad = document.getElementById("chartEdad").getContext("2d");

  // Datos generales
  const datosGenerales = contarColores();
  const totalGeneral = Object.values(datosGenerales).reduce((a, b) => a + b, 0);

  chartGeneral = new Chart(ctxGeneral, {
    type: "bar",
    data: {
      labels: colores,
      datasets: [{
        label: "Cantidad",
        data: Object.values(datosGenerales),
        backgroundColor: generarColores(colores.length)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Preferencias Generales de Color"
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.parsed.y;
              const porcentaje = totalGeneral > 0 ? ((value / totalGeneral) * 100).toFixed(1) : 0;
              return `${context.label}: ${value} votos (${porcentaje}%)`;
            }
          }
        }
      }
    }
  });

  // Gráfico por edad
  chartEdad = new Chart(ctxEdad, {
    type: "pie",
    data: {
      labels: colores,
      datasets: [{
        data: [],
        backgroundColor: generarColores(colores.length)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Preferencias por Rango de Edad"
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const value = context.parsed;
              const porcentaje = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${context.label}: ${value} votos (${porcentaje}%)`;
            }
          }
        }
      }
    }
  });

  actualizarPorEdad();
}

// Actualiza gráfico por edad
function actualizarPorEdad() {
  const edadesSeleccionadas = obtenerEdadesSeleccionadas();
  const datosFiltrados = contarColores(edadesSeleccionadas);
  const total = Object.values(datosFiltrados).reduce((a, b) => a + b, 0);

  chartEdad.data.datasets[0].data = Object.values(datosFiltrados);
  chartEdad.options.plugins.tooltip.callbacks.label = function (context) {
    const value = context.parsed;
    const porcentaje = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    return `${context.label}: ${value} votos (${porcentaje}%)`;
  };
  chartEdad.update();
}

// Generar colores base para las gráficas
function generarColores(n) {
  const base = ["#EF4444", "#3B82F6", "#10B981", "#FACC15", "#FB923C", "#A78BFA"];
  return base.slice(0, n);
}
