const nombreTarea = document.getElementById('nombreTarea');
const prioridadTarea = document.getElementById('prioridadTarea');
const fechaVencimiento = document.getElementById('fechaVencimiento');
const agregarTarea = document.getElementById('agregarTarea');
const listadoTareas = document.getElementById('listadoTareas');
const tareasPendientes = document.getElementById('tareasPendientes');

let tareas = JSON.parse(localStorage.getItem('tareas')) || [];

let proximoId = tareas.length > 0 ? tareas[tareas.length - 1].id + 1 : 1;
// Agregar esta nueva función de ordenamiento
const ordenarTareas = (tareas) => {
  const ahora = new Date();
  const prioridadValor = {
      'Alta': 1,
      'Media': 2,
      'Baja': 3
  };

  return tareas.sort((a, b) => {
      const aExpirada = new Date(a.vencimiento) < ahora;
      const bExpirada = new Date(b.vencimiento) < ahora;

      // Si ambas están expiradas, ordenar por fecha de vencimiento (más reciente primero)
      if (aExpirada && bExpirada) {
          return new Date(b.vencimiento) - new Date(a.vencimiento);
      }

      // Si solo una está expirada, esa va después
      if (aExpirada) return 1;
      if (bExpirada) return -1;

      // Si una tarea está completada y la otra no, la completada va al final
      if (a.completada && !b.completada) return 1;
      if (!a.completada && b.completada) return -1;

      // Si ambas están en el mismo estado (completadas o no completadas)
      if (a.completada === b.completada) {
          // Ordenar por prioridad si están pendientes
          if (!a.completada) {
              if (prioridadValor[a.prioridad] !== prioridadValor[b.prioridad]) {
                  return prioridadValor[a.prioridad] - prioridadValor[b.prioridad];
              }
          }
          // Si tienen la misma prioridad o están completadas, ordenar por fecha
          return new Date(a.vencimiento) - new Date(b.vencimiento);
      }
      return 0;
  });
};

const renderizarTareas = () => {
  listadoTareas.innerHTML = '';
  
  const tareasOrdenadas = [...tareas].sort((a, b) => {
    const ahora = new Date();
    const aExpirada = new Date(a.vencimiento) < ahora;
    const bExpirada = new Date(b.vencimiento) < ahora;
    
    // Si una está completada y la otra no
    if (a.completada !== b.completada) {
      return a.completada ? 1 : -1;
    }

    // Si ambas están completadas, ordenar por fecha más alejada primero
    if (a.completada && b.completada) {
      return new Date(b.vencimiento) - new Date(a.vencimiento);
    }

    // Para tareas no completadas
    if (!a.completada && !b.completada) {
      // Si ambas están expiradas, ordenar por fecha de vencimiento (más próxima primero)
      if (aExpirada && bExpirada) {
        return new Date(a.vencimiento) - new Date(b.vencimiento);
      }
      
      // Si solo una está expirada, esa va primero
      if (aExpirada) return -1;
      if (bExpirada) return 1;
      
      // Si ninguna está expirada, ordenar por prioridad
      const prioridadValor = {
        'Alta': 1,
        'Media': 2,
        'Baja': 3
      };
      
      if (prioridadValor[a.prioridad] !== prioridadValor[b.prioridad]) {
        return prioridadValor[a.prioridad] - prioridadValor[b.prioridad];
      }
      
      // Si tienen la misma prioridad, ordenar por fecha
      return new Date(a.vencimiento) - new Date(b.vencimiento);
    }
    
    return 0;
  });

  tareasOrdenadas.forEach((tarea) => {
    const itemTarea = document.createElement('li');
    // El resto de tu código para crear los elementos permanece igual
    const estaExpirada = new Date(tarea.vencimiento) < new Date();

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
     ${estaExpirada 
       ? '<span class="badge bg-warning text-dark ms-2">EXPIRADA</span>' 
       : ''}
     ${tarea.completada
       ? '<span class="badge bg-info text-dark ms-2">COMPLETADA</span>'
       : estaExpirada
         ? '<span class="badge bg-danger text-white ms-2">NO COMPLETADA</span>'
         : ''}`;

    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.classList.add('btn', 'btn-danger', 'ms-2');
    botonEliminar.addEventListener('click', () => eliminarTarea(tarea.id));

    const botonVerVencimiento = document.createElement('button');
    botonVerVencimiento.textContent = 'Ver vencimiento';
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
const agregarTareas = () => {
  const nombre = nombreTarea.value;
  const prioridad = prioridadTarea.value;
  const vencimiento = fechaVencimiento.value;

  /* if (nombre && prioridad && vencimiento) {
    tareas.push({
      id: proximoId++,
      nombre: nombre,
      prioridad: prioridad,
      vencimiento: vencimiento,
      completada: false,
    });

    localStorage.setItem("tareas", JSON.stringify(tareas));
    renderizarTareas();
  } else {
    alert("Rellena todos los campos");
  } */

  nombre && prioridad && vencimiento
    ? tareas.push({
        id: proximoId++,
        nombre: nombre,
        prioridad: prioridad,
        vencimiento: vencimiento,
        completada: false,
      })
    : alert('Rellena todos los campos');
  localStorage.setItem('tareas', JSON.stringify(tareas));
  renderizarTareas();
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
      mensaje += `${tarea.nombre} - EXPIRO hace ${Math.trunc(Math.abs(
        SegundosRestantes)
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
