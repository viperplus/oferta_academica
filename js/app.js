// Configuración del mapa
const MAP_CONFIG = {
  center: [-40.5, -68.0],
  zoom: 6,
  minZoom: 5,
  maxZoom: 18
};

// Configurar iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'images/marker-icon.png',
  iconRetinaUrl: 'images/marker-icon-2x.png',
  shadowUrl: 'images/marker-shadow.png'
});

// Variables globales
let map;
let markers = [];
let anexosMarkers = [];
let selectedAnexo = null;
let radioBusqueda = 100; // km por defecto

// Inicializar el mapa
function initMap() {
  map = L.map('map', {
    center: MAP_CONFIG.center,
    zoom: MAP_CONFIG.zoom,
    minZoom: MAP_CONFIG.minZoom,
    maxZoom: MAP_CONFIG.maxZoom,
    zoomControl: false
  });

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // Mapa base con estilo más limpio
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
  }).addTo(map);

  addAnexosMarkers();
  addLocalidadesMarkers();
}

// Icono mejorado para anexos ESRN - GRANDE y VISIBLE
function createAnexoIcon(anexo) {
  const nombreCorto = anexo.localidad.substring(0, 10);
  return L.divIcon({
    className: 'anexo-marker',
    html: `
      <div class="anexo-pin">
        <div class="anexo-icono">📚</div>
      </div>
      <div class="anexo-label">${nombreCorto}</div>
    `,
    iconSize: [120, 50],
    iconAnchor: [60, 50],
    popupAnchor: [0, -45]
  });
}

// Icono para localidades principales
function createLocalidadIcon(localidad) {
  const size = Math.min(35, Math.max(20, localidad.cursos / 4));
  return L.divIcon({
    className: 'localidad-marker',
    html: `
      <div class="localidad-pin" style="width: ${size}px; height: ${size}px;">
        <span class="localidad-numero">${localidad.cursos}</span>
      </div>
    `,
    iconSize: [size + 10, size + 25],
    iconAnchor: [(size + 10) / 2, size + 25],
    popupAnchor: [0, -(size + 20)]
  });
}

// Agregar marcadores de anexos ESRN
function addAnexosMarkers() {
  ANEXOS_ESRN.forEach(anexo => {
    const icon = createAnexoIcon(anexo);
    const marker = L.marker([anexo.lat, anexo.lng], { icon })
      .addTo(map)
      .bindPopup(createAnexoPopup(anexo), {
        maxWidth: 340,
        maxHeight: Math.max(280, window.innerHeight - 200),
        autoPanPadding: [50, 50]
      });

    marker.anexoData = anexo;
    marker.on('click', () => selectAnexo(anexo));
    anexosMarkers.push(marker);
  });
}

// Agregar marcadores de localidades
function addLocalidadesMarkers() {
  LOCALIDADES_OFERTA.forEach(localidad => {
    const icon = createLocalidadIcon(localidad);
    const marker = L.marker([localidad.lat, localidad.lng], { icon })
      .addTo(map)
      .bindPopup(createLocalidadPopup(localidad));

    marker.localidadData = localidad;
    markers.push(marker);
  });
}

// Popup mejorado para anexo ESRN con paginación
function createAnexoPopup(anexo) {
  const cursosCercanos = findCursosCercanos(anexo.lat, anexo.lng, radioBusqueda);

  // Agrupar por institución
  const porInstitucion = {};
  cursosCercanos.forEach(c => {
    if (!porInstitucion[c.institucion]) {
      porInstitucion[c.institucion] = [];
    }
    porInstitucion[c.institucion].push(c);
  });

  const instituciones = Object.entries(porInstitucion);
  const totalInstituciones = instituciones.length;
  const porPagina = 2;
  const totalPaginas = Math.ceil(totalInstituciones / porPagina);

  // Guardar datos para paginación
  const popupId = `popup-${anexo.id}`;

  return `
    <div class="popup-anexo" id="${popupId}">
      <div class="popup-header-anexo">
        <span class="popup-icono">📚</span>
        <div>
          <div class="popup-titulo">${anexo.nombre}</div>
          <div class="popup-subtitulo">${anexo.localidad}</div>
        </div>
      </div>
      <div class="popup-body">
        <div class="popup-info-row">
          <span class="info-icono">📍</span>
          <span>${anexo.departamento}</span>
        </div>
        <div class="popup-info-row">
          <span class="info-icono">📋</span>
          <span>${anexo.orientaciones.join(' • ')}</span>
        </div>
        <div class="popup-info-row">
          <span class="info-icono">📏</span>
          <span>${anexo.descripcion}</span>
        </div>
        <div class="popup-cursos-section">
          <div class="popup-cursos-titulo">
            🎓 Carreras cercanas (${cursosCercanos.length} en ${radioBusqueda}km)
          </div>
          <div id="${popupId}-carreras" class="popup-carreras-container">
            ${renderizarPagina(instituciones, 0, porPagina)}
          </div>
          ${totalPaginas > 1 ? `
            <div class="popup-paginacion">
              <button onclick="cambiarPagina('${popupId}', -1, ${porPagina}, ${totalPaginas})" id="${popupId}-btn-anterior" class="btn-pag btn-pag-anterior" disabled>◀ Anterior</button>
              <span id="${popupId}-pagina" class="pagina-actual">1/${totalPaginas}</span>
              <button onclick="cambiarPagina('${popupId}', 1, ${porPagina}, ${totalPaginas})" id="${popupId}-btn-siguiente" class="btn-pag btn-pag-siguiente">Siguiente ▶</button>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// Renderizar una página de carreras
function renderizarPagina(instituciones, pagina, porPagina) {
  const inicio = pagina * porPagina;
  const fin = inicio + porPagina;
  const institucionesPagina = instituciones.slice(inicio, fin);

  if (institucionesPagina.length === 0) {
    return '<p class="sin-cursos">No hay más carreras</p>';
  }

  let html = '';
  for (const [inst, cursos] of institucionesPagina) {
    html += `
      <div class="institucion-grupo">
        <div class="institucion-nombre">🏫 ${inst}</div>
        ${cursos.map(c => `
          <div class="curso-item">
            <span class="curso-badge ${c.tipo.toLowerCase()}">${c.tipo.substring(0, 3)}</span>
            <span class="curso-nombre">${c.carrera}</span>
            <span class="curso-localidad">📍 ${c.localidad}</span>
            <span class="curso-duracion">${c.duracion}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  return html;
}

// Cambiar página en popup
function cambiarPagina(popupId, direccion, porPagina, totalPaginas) {
  const paginaActualEl = document.getElementById(`${popupId}-pagina`);
  const carrerasEl = document.getElementById(`${popupId}-carreras`);
  const btnAnterior = document.getElementById(`${popupId}-btn-anterior`);
  const btnSiguiente = document.getElementById(`${popupId}-btn-siguiente`);

  if (!paginaActualEl) return;

  let paginaActual = parseInt(paginaActualEl.textContent.split('/')[0]);
  let nuevaPagina = paginaActual + direccion;

  if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;

  // Obtener instituciones del popup
  const anexoId = popupId.replace('popup-', '');
  const anexo = ANEXOS_ESRN.find(a => a.id == anexoId);
  if (!anexo) return;

  const cursosCercanos = findCursosCercanos(anexo.lat, anexo.lng, radioBusqueda);
  const porInstitucion = {};
  cursosCercanos.forEach(c => {
    if (!porInstitucion[c.institucion]) porInstitucion[c.institucion] = [];
    porInstitucion[c.institucion].push(c);
  });

  const instituciones = Object.entries(porInstitucion);
  carrerasEl.innerHTML = renderizarPagina(instituciones, nuevaPagina - 1, porPagina);
  paginaActualEl.textContent = `${nuevaPagina}/${totalPaginas}`;

  btnAnterior.disabled = nuevaPagina === 1;
  btnSiguiente.disabled = nuevaPagina === totalPaginas;
}

// Popup mejorado para localidad
function createLocalidadPopup(localidad) {
  const cursos = OFERTAS_EDUCATIVAS.filter(c => c.localidad === localidad.nombre);

  const cursosHTML = cursos.slice(0, 8).map(c => `
    <div class="curso-item">
      <span class="curso-badge ${c.tipo.toLowerCase()}">${c.tipo.substring(0, 3)}</span>
      <span class="curso-nombre">${c.carrera}</span>
    </div>
  `).join('');

  return `
    <div class="popup-localidad">
      <div class="popup-header-localidad">
        <span class="popup-icono">🏙️</span>
        <div>
          <div class="popup-titulo">${localidad.nombre}</div>
          <div class="popup-subtitulo">${localidad.zona}</div>
        </div>
      </div>
      <div class="popup-body">
        <div class="popup-stats">
          <div class="stat-box">
            <div class="stat-numero">${localidad.cursos}</div>
            <div class="stat-texto">Carreras</div>
          </div>
          <div class="stat-box">
            <div class="stat-numero">${cursos.length}</div>
            <div class="stat-texto">En el mapa</div>
          </div>
        </div>
        <div class="popup-cursos-section">
          <div class="popup-cursos-titulo">Algunas carreras disponibles:</div>
          ${cursosHTML || '<p class="sin-cursos">Ver detalles en el panel lateral</p>'}
        </div>
      </div>
    </div>
  `;
}

// Encontrar cursos cercanos
function findCursosCercanos(lat, lng, radioKm) {
  return OFERTAS_EDUCATIVAS.filter(curso => {
    const distancia = calcularDistancia(lat, lng, curso.lat, curso.lng);
    return distancia <= radioKm;
  }).sort((a, b) => {
    const distA = calcularDistancia(lat, lng, a.lat, a.lng);
    const distB = calcularDistancia(lat, lng, b.lat, b.lng);
    return distA - distB;
  });
}

// Calcular distancia Haversine
function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// Seleccionar un anexo
function selectAnexo(anexo) {
  selectedAnexo = anexo;

  document.querySelectorAll('.anexo-card').forEach(card => {
    card.classList.remove('active');
    if (card.dataset.id == anexo.id) {
      card.classList.add('active');
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  map.setView([anexo.lat, anexo.lng], 9, { animate: false });

  const marker = anexosMarkers.find(m => m.anexoData.id === anexo.id);
  if (marker) {
    // Actualizar contenido del popup con el nuevo radio
    marker.setPopupContent(createAnexoPopup(anexo));
    marker.openPopup();
  }

  updateInfoPanel(anexo);
}

// Actualizar panel de información
function updateInfoPanel(anexo) {
  const cursosCercanos = findCursosCercanos(anexo.lat, anexo.lng, radioBusqueda);
  const panel = document.getElementById('info-panel');

  if (panel) {
    panel.innerHTML = `
      <div class="panel-anexo-activo">
        <div class="panel-header-activo">
          <span>📚</span>
          <h3>${anexo.nombre}</h3>
        </div>
        <p class="panel-localidad">${anexo.localidad}, ${anexo.departamento}</p>
        <div class="panel-stats-activos">
          <div class="panel-stat">
            <span class="panel-stat-num">${cursosCercanos.length}</span>
            <span class="panel-stat-label">carreras en ${radioBusqueda}km</span>
          </div>
        </div>
        <div class="panel-orientaciones">
          ${anexo.orientaciones.map(o => `<span class="orientacion-tag">${o}</span>`).join('')}
        </div>
      </div>
    `;
  }
}

// Renderizar lista de anexos mejorada
function renderAnexosList() {
  const container = document.getElementById('anexos-list');
  if (!container) return;

  container.innerHTML = ANEXOS_ESRN.map(anexo => {
    const cursosCercanos = findCursosCercanos(anexo.lat, anexo.lng, radioBusqueda);
    return `
      <div class="anexo-card" data-id="${anexo.id}" onclick="selectAnexo(ANEXOS_ESRN.find(a => a.id === ${anexo.id}))">
        <div class="anexo-card-header">
          <div class="anexo-card-icono">📚</div>
          <div class="anexo-card-info">
            <div class="anexo-card-nombre">${anexo.nombre}</div>
            <div class="anexo-card-localidad">${anexo.localidad}</div>
          </div>
          <div class="anexo-card-badge">${anexo.id}</div>
        </div>
        <div class="anexo-card-meta">
          <span>📍 ${anexo.departamento}</span>
          <span>🎓 ${cursosCercanos.length} carreras</span>
        </div>
      </div>
    `;
  }).join('');
}

// Búsqueda
function busquedaRapida(query) {
  if (!query) {
    markers.forEach(m => m.setOpacity(1));
    anexosMarkers.forEach(m => m.setOpacity(1));
    return;
  }

  const queryLower = query.toLowerCase();

  anexosMarkers.forEach(marker => {
    const anexo = marker.anexoData;
    const match = anexo.localidad.toLowerCase().includes(queryLower) ||
                  anexo.nombre.toLowerCase().includes(queryLower) ||
                  anexo.departamento.toLowerCase().includes(queryLower);
    marker.setOpacity(match ? 1 : 0.2);
  });

  markers.forEach(marker => {
    const localidad = marker.localidadData;
    const match = localidad.nombre.toLowerCase().includes(queryLower);
    marker.setOpacity(match ? 1 : 0.2);
  });
}

// Geolocalización
function geolocalizar() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 10);

        let anexoCercano = null;
        let distanciaMinima = Infinity;

        ANEXOS_ESRN.forEach(anexo => {
          const distancia = calcularDistancia(latitude, longitude, anexo.lat, anexo.lng);
          if (distancia < distanciaMinima) {
            distanciaMinima = distancia;
            anexoCercano = anexo;
          }
        });

        if (anexoCercano) {
          selectAnexo(anexoCercano);
        }
      },
      error => {
        alert('No se pudo obtener tu ubicación');
      }
    );
  }
}

// Centrar en la provincia
function centrarProvincia() {
  map.setView(MAP_CONFIG.center, MAP_CONFIG.zoom);
  document.getElementById('busqueda').value = '';
  busquedaRapida('');
  selectedAnexo = null;
  document.querySelectorAll('.anexo-card').forEach(card => {
    card.classList.remove('active');
  });
  const panel = document.getElementById('info-panel');
  if (panel) {
    panel.innerHTML = `
      <h3>Seleccioná un anexo</h3>
      <p>Hacé clic en un marcador del mapa o en la lista para ver las carreras cercanas.</p>
    `;
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderAnexosList();

  document.getElementById('busqueda')?.addEventListener('input', (e) => {
    busquedaRapida(e.target.value);
  });

  // Slider de kilómetros (PC y móvil sincronizados)
  const slidersKm = [
    { slider: document.getElementById('filtro-km'), label: document.getElementById('km-valor') },
    { slider: document.getElementById('filtro-km-mobile'), label: document.getElementById('km-valor-mobile') }
  ].filter(s => s.slider && s.label);

  function actualizarRadio(valor, origen) {
    radioBusqueda = parseInt(valor);
    slidersKm.forEach(({ slider, label }) => {
      label.textContent = radioBusqueda;
      if (slider !== origen) slider.value = radioBusqueda;
    });
    // Actualizar lista de anexos
    renderAnexosList();
    if (selectedAnexo) {
      selectAnexo(selectedAnexo);
    }
  }

  slidersKm.forEach(({ slider }) => {
    slider.addEventListener('input', (e) => actualizarRadio(e.target.value, slider));
  });

  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
  }, 500);
});

// Cerrar pantalla de bienvenida
function cerrarBienvenida() {
  const welcome = document.getElementById('welcome-screen');
  if (welcome) {
    welcome.style.animation = 'fadeOut 0.4s ease forwards';
    setTimeout(() => {
      welcome.style.display = 'none';
      abrirTutorial();
    }, 400);
  }
}

// Tutorial
let tutorialActual = 0;
const TOTAL_TUTORIAL = 3;

function abrirTutorial() {
  const overlay = document.getElementById('tutorial-overlay');
  if (overlay) {
    tutorialActual = 0;
    overlay.style.display = 'flex';
    actualizarTutorial();
  }
}

function saltarTutorial() {
  const overlay = document.getElementById('tutorial-overlay');
  if (overlay) overlay.style.display = 'none';
}

function tutorialSiguiente() {
  if (tutorialActual >= TOTAL_TUTORIAL - 1) {
    saltarTutorial();
    return;
  }
  tutorialActual++;
  actualizarTutorial();
}

function tutorialAnterior() {
  if (tutorialActual <= 0) return;
  tutorialActual--;
  actualizarTutorial();
}

function actualizarTutorial() {
  document.querySelectorAll('.tutorial-slide').forEach(slide => {
    slide.classList.toggle('activo', parseInt(slide.dataset.slide) === tutorialActual);
  });
  document.querySelectorAll('.tutorial-dot').forEach(dot => {
    dot.classList.toggle('activo', parseInt(dot.dataset.dot) === tutorialActual);
  });
  const btn = document.querySelector('.tutorial-btn-siguiente');
  if (btn) btn.textContent = tutorialActual === TOTAL_TUTORIAL - 1 ? 'Empezar' : 'Siguiente ▶';
}

// Abrir orientador vocacional
function abrirOrientador() {
  const overlay = document.getElementById('orientador-overlay');
  if (overlay) overlay.style.display = 'flex';
}

// Cerrar orientador vocacional
function cerrarOrientador() {
  const overlay = document.getElementById('orientador-overlay');
  if (overlay) overlay.style.display = 'none';
}
