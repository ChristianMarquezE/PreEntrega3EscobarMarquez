const nombreTarea = document.getElementById('nombreTarea');
const prioridadTarea = document.getElementById('prioridadTarea');
const fechaVencimiento = document.getElementById('fechaVencimiento');
const agregarTarea = document.getElementById('agregarTarea');
const listadoTareas = document.getElementById('listadoTareas');
const tareasPendientes = document.getElementById('tareasPendientes');

const tareas = JSON.parse(localStorage.getItem('tareas')) || [];

let proximoId = tareas.length > 0 ? tareas[tareas.length - 1].id + 1 : 1;
let mostrarExpiradas = true; // Variable para controlar la visibilidad de las tareas expiradas
let fechaFiltro = null;

// Agregar evento al calendario de filtro
const filtroFecha = document.getElementById('filtroFecha');
filtroFecha.addEventListener('change', (e) => {
  fechaFiltro = e.target.value ? new Date(e.target.value) : null;
  renderizarTareas();
});
const renderizarTareas = () => {
  listadoTareas.innerHTML = '';

  const tareasOrdenadas = [...tareas].sort((a, b) => {
    // Primero ordenar por completada
    if (a.completada && !b.completada) return 1;
    if (!a.completada && b.completada) return -1;

    const fechaA = new Date(a.vencimiento);
    const fechaB = new Date(b.vencimiento);
    const hoy = new Date();

    // Si ambas están completadas, ordenar por fecha más futura primero
    if (a.completada && b.completada) {
      return fechaB - fechaA; // Orden inverso para mostrar las más futuras primero
    }

    // Si ninguna está completada
    if (!a.completada && !b.completada) {
      const aExpirada = fechaA < hoy;
      const bExpirada = fechaB < hoy;

      // Si una está expirada y la otra no
      if (aExpirada && !bExpirada) return -1;
      if (!aExpirada && bExpirada) return 1;

      // Si ambas están expiradas, ordenar por tiempo de caducidad (más reciente primero)
      if (aExpirada && bExpirada) {
        return fechaB - fechaA; // Orden inverso para mostrar las más recientes primero
      }

      // Si ninguna está expirada, ordenar por prioridad
      const prioridades = { Alta: 0, Media: 1, Baja: 2 };
      if (prioridades[a.prioridad] !== prioridades[b.prioridad]) {
        return prioridades[a.prioridad] - prioridades[b.prioridad];
      }
      // Si tienen la misma prioridad, ordenar por fecha
      return fechaA - fechaB;
    }

    // Este return no debería alcanzarse, pero lo dejamos por si acaso
    return fechaA - fechaB;
  });
  tareasOrdenadas.forEach((tarea) => {
    const fechaTarea = new Date(tarea.vencimiento);
    const hoy = new Date();
    const estaExpirada = fechaTarea < hoy;

    // Filtrar por fecha y hora si hay una fecha de filtro seleccionada
    if (fechaFiltro) {
      const fechaFiltroObj = new Date(fechaFiltro);
      const fechaTareaObj = new Date(tarea.vencimiento);

      // Comparar directamente los timestamps (incluye fecha y hora)
      if (fechaTareaObj > fechaFiltroObj) {
        return;
      }
    }

    // Si mostrarExpiradas es falso y la tarea está expirada, no la renderizamos
    if (!mostrarExpiradas && estaExpirada) return;

    // Resto del código para crear y mostrar la tarea...
    const itemTarea = document.createElement('li');
    itemTarea.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-center'
    );

    if (tarea.completada) {
      itemTarea.classList.add('bg-success', 'text-white');
    } else if (estaExpirada) {
      itemTarea.classList.add('bg-danger', 'text-white');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = tarea.completada;
    checkbox.addEventListener('change', () =>
      marcarComoCompletada(checkbox, tarea.id)
    );

    const infoTarea = document.createElement('span');
    infoTarea.innerHTML = `
     <strong>${tarea.nombre}</strong>
     Prioridad: ${tarea.prioridad}
     <strong>Vencimiento: ${tarea.vencimiento}</strong>
     ${
       estaExpirada
         ? '<span class="badge bg-warning text-dark ms-2">EXPIRADA</span>'
         : ''
     }
     ${
       tarea.completada
         ? '<span class="badge bg-info text-dark ms-2">COMPLETADA</span>'
         : estaExpirada
         ? '<span class="badge bg-danger text-white ms-2">NO COMPLETADA</span>'
         : ''
     }`;

    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.classList.add('btn', 'btn-danger', 'ms-2');
    botonEliminar.addEventListener('click', () => eliminarTarea(tarea.id));

    const botonVerVencimiento = document.createElement('button');
    botonVerVencimiento.textContent = estaExpirada
      ? 'Tiempo expirada'
      : 'Ver vencimiento';
    botonVerVencimiento.classList.add('btn', 'btn-secondary', 'ms-2');
    botonVerVencimiento.addEventListener('click', () =>
      mostrarVencimiento(tarea.id)
    );

    itemTarea.append(checkbox);
    itemTarea.append(infoTarea);
    itemTarea.append(botonEliminar);
    itemTarea.append(botonVerVencimiento);
    listadoTareas.append(itemTarea);
  });

  mostrarTareasPendientes();
};

const botonOcultarExpiradas = document.getElementById('ocultarExpiradas');
botonOcultarExpiradas.addEventListener('click', () => {
  mostrarExpiradas = !mostrarExpiradas;
  botonOcultarExpiradas.textContent = mostrarExpiradas
    ? 'Ocultar tareas expiradas'
    : 'Mostrar tareas expiradas';
  renderizarTareas();
});

const agregarTareas = () => {
  const nombre = nombreTarea.value;
  const prioridad = prioridadTarea.value;
  const vencimiento = fechaVencimiento.value;

  if (nombre && prioridad && vencimiento) {
    tareas.push({
      id: proximoId++,
      nombre: nombre,
      prioridad: prioridad,
      vencimiento: vencimiento,
      completada: false,
    });

    localStorage.setItem('tareas', JSON.stringify(tareas));
    renderizarTareas();

    // Limpiar los campos del formulario
    nombreTarea.value = '';
    prioridadTarea.value = 'Alta'; // O el valor por defecto que prefieras
    fechaVencimiento.value = '';

    // Mostrar alerta de éxito con SweetAlert2
    Swal.fire({
      title: '¡Éxito!',
      text: 'Tarea agregada correctamente',
      icon: 'success',
      confirmButtonText: 'Ok'
    });
  } else {
    // Alerta de error si no se rellenan todos los campos
    Swal.fire({
      title: 'Error',
      text: 'Por favor, rellena todos los campos',
      icon: 'error',
      confirmButtonText: 'Ok'
    });
  }
};
const eliminarTarea = (id) => {
  const indice = tareas.findIndex((tarea) => tarea.id === id);

  if (indice !== -1) {
    tareas.splice(indice, 1);
    localStorage.setItem('tareas', JSON.stringify(tareas));
    renderizarTareas();
  }
};

const mostrarTareasPendientes = () => {
  const pendientes = tareas.filter((tarea) => !tarea.completada).length;
  tareasPendientes.textContent = `Tareas pendientes: ${pendientes}`;
};

const marcarComoCompletada = (checkbox, id) => {
  const tarea = tareas.find((tarea) => tarea.id === id);

  if (tarea) {
    tarea.completada = checkbox.checked;
    localStorage.setItem('tareas', JSON.stringify(tareas));
    renderizarTareas();
  }
};

//Mostrar vencimiento
function mostrarVencimiento(id) {
  // Asegurarse de tener las tareas más recientes

  const tarea = tareas.find((t) => t.id === id);
  if (tarea) {
    const hoy = new Date();
    let mensaje = 'Tarea ';

    const fechaVencimiento = new Date(tarea.vencimiento);
    const diferencia = fechaVencimiento - hoy;

    const DiasRestantes = diferencia / (1000 * 60 * 60 * 24);
    const HorasRestantes = diferencia / (1000 * 60 * 60);
    const MinutosRestantes = diferencia / (1000 * 60);
    const SegundosRestantes = diferencia / 1000;
    const CeilSegundosRestantes = Math.floor(diferencia / 1000);
    const AbsMinutosRestantes = Math.floor(Math.abs(diferencia / (1000 * 60)));

    const DiasTruncado = Math.trunc(DiasRestantes);
    const HorasTruncado = Math.trunc(HorasRestantes);
    const MinutosTruncado = Math.trunc(MinutosRestantes);
    const AbsMinutosTruncado = Math.trunc(AbsMinutosRestantes);

    const HorasRestantesdeDia = (DiasRestantes - DiasTruncado) * 24;
    const MinutosRestantesdeDia =
      (HorasRestantesdeDia - Math.trunc(HorasRestantesdeDia)) * 60;

    if (
      DiasRestantes >= 1 &&
      HorasRestantesdeDia >= 1 &&
      MinutosRestantesdeDia < 1
    ) {
      mensaje += `${
        tarea.nombre
      } - Vence en ${DiasTruncado} días y ${Math.trunc(
        HorasRestantesdeDia
      )} horas\n`;
    } else if (
      DiasRestantes >= 1 &&
      MinutosRestantesdeDia >= 1 &&
      HorasRestantesdeDia < 1
    ) {
      mensaje += `${
        tarea.nombre
      } - Vence en ${DiasTruncado} días y ${Math.trunc(
        MinutosRestantesdeDia
      )} minutos\n`;
    } else if (
      DiasRestantes >= 1 &&
      MinutosRestantesdeDia < 1 &&
      HorasRestantesdeDia < 1
    ) {
      mensaje += `${tarea.nombre} - Vence en ${DiasTruncado} días\n`;
    } else if (DiasRestantes >= 1) {
      mensaje += `${tarea.nombre} - Vence en ${DiasTruncado} días, ${Math.trunc(
        HorasRestantesdeDia
      )} horas y ${Math.trunc(MinutosRestantesdeDia)} minutos\n`;
    }

    const MinutosRestantesdeHora = (HorasRestantes - HorasTruncado) * 60;
    const SegundosRestantesdeHora =
      (MinutosRestantesdeHora - Math.trunc(MinutosRestantesdeHora)) * 60;
    if (
      HorasRestantes >= 1 &&
      MinutosRestantesdeHora >= 1 &&
      SegundosRestantesdeHora < 1 &&
      HorasRestantes < 24
    ) {
      mensaje += `${
        tarea.nombre
      } - Vence en ${HorasTruncado} Horas y ${Math.trunc(
        MinutosRestantesdeHora
      )} minutos\n`;
    } else if (
      HorasRestantes >= 1 &&
      SegundosRestantesdeHora >= 1 &&
      MinutosRestantesdeDia < 1 &&
      HorasRestantes < 24
    ) {
      mensaje += `${
        tarea.nombre
      } - Vence en ${HorasTruncado} Horas y ${Math.trunc(
        SegundosRestantesdeHora
      )} segundos\n`;
    } else if (
      HorasRestantes >= 1 &&
      SegundosRestantesdeHora < 1 &&
      MinutosRestantesdeHora < 1 &&
      HorasRestantes < 24
    ) {
      mensaje += `${tarea.nombre} - Vence en ${HorasTruncado} Horas\n`;
    } else if (HorasRestantes >= 1 && HorasRestantes < 24) {
      mensaje += `${
        tarea.nombre
      } - Vence en ${HorasTruncado} horas, ${Math.trunc(
        MinutosRestantesdeHora
      )} minutos y ${Math.trunc(SegundosRestantesdeHora)} segundos\n`;
    }

    const SegundosRestantesdeMinuto = (MinutosRestantes - MinutosTruncado) * 60;
    if (
      MinutosRestantes >= 1 &&
      SegundosRestantesdeHora < 1 &&
      MinutosRestantes < 60 &&
      HorasRestantes < 24
    ) {
      mensaje += `${tarea.nombre} - Vence en ${MinutosTruncado} Minutos.\n`;
    } else if (
      MinutosRestantes >= 1 &&
      SegundosRestantesdeHora > 1 &&
      MinutosRestantes < 60
    ) {
      mensaje += `${
        tarea.nombre
      } - Vence en ${MinutosTruncado} Minutos y ${Math.trunc(
        SegundosRestantesdeMinuto
      )} segundos\n`;
    } else if (SegundosRestantes >= 1 && SegundosRestantes < 60) {
      mensaje += `${tarea.nombre} - Vence en ${CeilSegundosRestantes} segundos.\n`;
    }

    /* =====================================
=               EXPIRACIONES VENCIDAS               =
===================================== */

    if (
      DiasRestantes <= -1 &&
      HorasRestantesdeDia <= -1 &&
      MinutosRestantesdeDia > -1
    ) {
      mensaje += `${tarea.nombre} - EXPIRO hace ${Math.abs(
        DiasTruncado
      )} días y ${Math.abs(Math.trunc(HorasRestantesdeDia))} horas\n`;
    } else if (
      DiasRestantes <= -1 &&
      MinutosRestantesdeDia <= -1 &&
      HorasRestantesdeDia > -1
    ) {
      mensaje += `${tarea.nombre} - EXPIRO hace ${Math.abs(
        DiasTruncado
      )} días y ${Math.abs(
        Math.trunc(Math.trunc(MinutosRestantesdeDia))
      )} minutos\n`;
    } else if (
      DiasRestantes <= -1 &&
      MinutosRestantesdeDia > -1 &&
      HorasRestantesdeDia > -1
    ) {
      mensaje += `${tarea.nombre} - EXPIRO hace ${Math.abs(
        DiasTruncado
      )} días\n`;
    } else if (DiasRestantes <= -1) {
      mensaje += `${tarea.nombre} - EXPIRO hace ${Math.abs(
        DiasTruncado
      )} días, ${Math.abs(Math.trunc(HorasRestantesdeDia))} horas y ${Math.abs(
        Math.trunc(MinutosRestantesdeDia)
      )} minutos  \n`;
    } else if (
      HorasRestantes <= -1 &&
      MinutosRestantesdeHora <= -1 &&
      SegundosRestantesdeHora > -1 &&
      HorasRestantes > -24
    ) {
      mensaje += `${tarea.nombre} - EXPIRO hace ${Math.abs(
        HorasTruncado
      )} Horas y ${Math.abs(Math.trunc(MinutosRestantesdeHora))} minutos\n`;
    } else if (
      HorasRestantes <= -1 &&
      SegundosRestantesdeHora <= -1 &&
      MinutosRestantesdeDia > -1 &&
      HorasRestantes > -24
    ) {
      mensaje += `${tarea.nombre} - EXPIRO hace ${Math.abs(
        HorasTruncado
      )} Horas y ${Math.abs(Math.trunc(SegundosRestantesdeHora))} segundos\n`;
    } else if (
      HorasRestantes <= -1 &&
      SegundosRestantesdeHora > -1 &&
      MinutosRestantesdeHora > -1 &&
      HorasRestantes > -24
    ) {
      mensaje += `${tarea.nombre} - EXPIRO hace ${Math.abs(
        HorasTruncado
      )} Horas\n`;
    } else if (HorasRestantes <= -1 && HorasRestantes > -24) {
      mensaje += `${tarea.nombre} - EXPIRO hace ${Math.abs(
        HorasTruncado
      )} horas, ${Math.abs(
        Math.trunc(MinutosRestantesdeHora)
      )} minutos y ${Math.abs(Math.trunc(SegundosRestantesdeHora))} segundos\n`;
    } else if (
      MinutosRestantes <= -1 &&
      SegundosRestantesdeHora > -1 &&
      MinutosRestantes > -60 &&
      HorasRestantes > -24
    ) {
      mensaje += `${tarea.nombre} - EXPIRO hace ${AbsMinutosTruncado} Minutos\n`;
    } else if (
      MinutosRestantes <= -1 &&
      SegundosRestantesdeHora < -1 &&
      MinutosRestantes > -60
    ) {
      mensaje += `${
        tarea.nombre
      } - EXPIRO hace ${AbsMinutosTruncado} Minutos y ${Math.abs(
        Math.trunc(SegundosRestantesdeMinuto)
      )} segundos \n`;
    }

    //Segundos expirada
    else if (SegundosRestantes <= -1 && SegundosRestantes > -60) {
      mensaje += `${tarea.nombre} - EXPIRO hace ${Math.trunc(
        Math.abs(SegundosRestantes)
      )} segundos.\n`;
    }
    if (tareas.length >= 1) {
      document.getElementById('vencimientoModalBody').textContent = mensaje;
      const modal = new bootstrap.Modal(
        document.getElementById('vencimientoModal')
      );
      modal.show();
    } else {
      alert('No hay tareas.');
    }
  }
}

renderizarTareas();
agregarTarea.addEventListener('click', agregarTareas);
setInterval(() => {
  console.log('Actualizando lista de tareas...'); // Para verificar que se está ejecutando
  renderizarTareas();
}, 1000); // 1000 milisegundos = 1 segundos
