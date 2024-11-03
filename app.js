const nombreTarea = document.getElementById('nombreTarea');
const prioridadTarea = document.getElementById('prioridadTarea');
const fechaVencimiento = document.getElementById('fechaVencimiento');
const agregarTarea = document.getElementById('agregarTarea');
const listadoTareas = document.getElementById('listadoTareas');
const tareasPendientes = document.getElementById('tareasPendientes');

const tareas = JSON.parse(localStorage.getItem('tareas')) || [];

let proximoId = tareas.length > 0 ? tareas[tareas.length - 1].id + 1 : 1;

const renderizarTareas = () => {
  listadoTareas.innerHTML = '';

  tareas.forEach((tarea) => {
    const itemTarea = document.createElement('li');
    itemTarea.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-center'
    );

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = tarea.completada;
    checkbox.addEventListener('change', () =>
      marcarComoCompletada(checkbox, tarea.id)
    );

    const infoTarea = document.createElement('span');
    infoTarea.innerHTML = `
     <strong> ${tarea.nombre}</strong>
     Prioridad: ${tarea.prioridad}
     <strong>Vencimiento : ${tarea.vencimiento}</strong>`;

    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.classList.add('btn', 'btn-danger');
    botonEliminar.addEventListener('click', () => eliminarTarea(tarea.id));

    const botonVerVencimiento = document.createElement('button');
    botonVerVencimiento.textContent = 'Ver vencimiento';
    botonVerVencimiento.classList.add('btn', 'btn-secondary');
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

renderizarTareas();
agregarTarea.addEventListener('click', agregarTareas);
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
      mensaje += `${tarea.nombre} - EXPIRO hace ${Math.abs(
        SegundosRestantes
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
