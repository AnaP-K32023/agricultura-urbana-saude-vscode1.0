/* Mapa interativo das hortas */
let map;
let markerCluster;
let geojsonData;

function initMap() {
  map = L.map('map').setView([-27.59, -48.55], 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  loadData();
}

async function loadData() {
  try {
    const response = await fetch('/api/hortas');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    geojsonData = await response.json();
    addMarkers(geojsonData);
  } catch (error) {
    console.error('Erro ao carregar as hortas:', error);
  }
}

function criarIcone(ativa) {
  const color = ativa ? '#4CAF50' : '#dc3545';
  const iconType = ativa ? 'fa-seedling' : 'fa-times-circle';

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color:${color};width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,.3)"><i class="fas ${iconType}" style="color:white;font-size:14px"></i></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
}

function addMarkers(data) {
  if (markerCluster) map.removeLayer(markerCluster);

  markerCluster = L.markerClusterGroup({ maxClusterRadius: 50 });

  data.features.forEach((feature) => {
    const props = feature.properties;
    const [lon, lat] = feature.geometry.coordinates;

    const grupo = props.dia_grupo_horta
      ? `<p><span class="badge-grupo"><i class="fas fa-users me-1"></i>${props.dia_grupo_horta}</span></p>`
      : '';

    const mutirao = props.mutirao && props.mutirao !== 'Não'
      ? `<p><span class="badge-multirao"><i class="fas fa-calendar me-1"></i>${props.mutirao}</span></p>`
      : '';

    const popupContent = `
      <div style="min-width:200px">
        <h6 style="color:#2E7D32;font-weight:600">${props.nome}</h6>
        <p><strong>Região:</strong> ${props.regiao}</p>
        <p><strong>Status:</strong> ${props.ativa ? '✅ Ativa' : '❌ Inativa'}</p>
        <p><strong>Responsável:</strong> ${props.responsavel || '-'}</p>
        <p><strong>Plantas:</strong> ${props.plantas_medicinais || '-'}</p>
        ${grupo}${mutirao}
      </div>`;

    L.marker([lat, lon], { icon: criarIcone(props.ativa) })
      .bindPopup(popupContent, { maxWidth: 300 })
      .addTo(markerCluster);
  });

  map.addLayer(markerCluster);

  if (data.features.length) {
    const bounds = L.latLngBounds(data.features.map((f) => [f.geometry.coordinates[1], f.geometry.coordinates[0]]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }
}

function applyFilter(filter) {
  if (!geojsonData) return;

  const features = geojsonData.features.filter((feature) => {
    if (filter === 'all') return true;
    if (filter === 'ativa') return feature.properties.ativa === true;
    if (filter === 'inativa') return feature.properties.ativa === false;
    return feature.properties.regiao === filter;
  });

  addMarkers({ ...geojsonData, features });
}

document.addEventListener('DOMContentLoaded', () => {
  initMap();

  const container = document.querySelector('[data-filter-group="mapa"]');
  if (!container) return;

  container.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });
});
