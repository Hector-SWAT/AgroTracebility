// ============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================

// Función global para alertas (debe estar AL INICIO)
window.showAlert = function(message, type = 'info') {
    // Eliminar alertas existentes
    document.querySelectorAll('.alert').forEach(alert => alert.remove());
    
    // Crear alerta
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    
    // Icono según tipo
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    if (type === 'danger') icon = 'times-circle';
    
    alertDiv.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Estilos para la alerta
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        background: white;
        box-shadow: 0 8px 16px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 300px;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
        border-left: 4px solid ${type === 'success' ? '#28A745' : type === 'warning' ? '#FFC107' : type === 'danger' ? '#DC3545' : '#17A2B8'};
        color: ${type === 'success' ? '#155724' : type === 'warning' ? '#856404' : type === 'danger' ? '#721c24' : '#0c5460'};
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.style.opacity = '0';
            alertDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 300);
        }
    }, 5000);
};

// Asegurar que las animaciones CSS estén definidas
const alertStyle = document.createElement('style');
alertStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(alertStyle);

document.addEventListener('DOMContentLoaded', function() {
    initApplication();
});

async function initApplication() {
    console.log('🌱 Iniciando AgroTracebility v2.0...');
    
    try {
        // 1. Inicializar gestor de autocompletado
        if (typeof AutoCompleteManager !== 'undefined') {
            window.autoCompleteManager = new AutoCompleteManager();
            console.log('✅ AutoCompleteManager inicializado');
        } else {
            console.warn('⚠️ AutoCompleteManager no está disponible');
        }
        
        // 2. Configurar fecha y hora
        updateDateTime();
        setInterval(updateDateTime, 60000); // Actualizar cada minuto
        
        // 3. Cargar datos iniciales
        loadInitialData();
        
        // 4. Configurar eventos
        setupEventListeners();
        
        // 5. Inicializar componentes
        initComponents();
        
        // 6. Cargar estadísticas
        updateStatistics();
        
        // 7. Configurar validaciones en tiempo real
        setupRealTimeValidation();
        
        console.log('✅ AgroTracebility inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error al inicializar:', error);
        showAlert('Error al iniciar la aplicación', 'danger');
    }
}

// ============================================
// FUNCIONES DE INICIALIZACIÓN
// ============================================

function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('es-ES', options);
    }
}

function loadInitialData() {
    // Configurar autocompletado para plaguicidas
    setupPesticideAutocomplete();
    
    // Configurar autocompletado para cultivos
    setupCropAutocomplete();
}

function initComponents() {
    // Inicializar tooltips
    initTooltips();
    
    // Inicializar validaciones
    initValidations();
    
    // Cargar favoritos si existen
    loadFavorites();
}

// ============================================
// AUTOCOMPLETADO PARA PLAGUICIDAS
// ============================================

function setupPesticideAutocomplete() {
    const tipoSelect = document.getElementById('tipo-plaguicida');
    const plaguicidaContainer = document.getElementById('plaguicida-container');
    
    if (!plaguicidaContainer) {
        console.error('❌ No se encuentra #plaguicida-container');
        return;
    }
    
    console.log('🔧 Configurando autocompletado para plaguicidas...');
    
    // Crear contenedor de autocompletado
    plaguicidaContainer.innerHTML = `
        <div class="autocomplete-container">
            <input type="text" 
                   id="plaguicida-search" 
                   class="autocomplete-input" 
                   placeholder="Seleccione tipo primero..."
                   autocomplete="off"
                   disabled>
            <div id="plaguicida-suggestions" class="autocomplete-suggestions"></div>
        </div>
        <input type="hidden" id="plaguicida-id" value="">
        <div id="plaguicida-details" class="pesticide-details" style="display: none;"></div>
    `;
    
    const searchInput = document.getElementById('plaguicida-search');
    const suggestionsDiv = document.getElementById('plaguicida-suggestions');
    const hiddenInput = document.getElementById('plaguicida-id');
    const detailsDiv = document.getElementById('plaguicida-details');
    
    if (!searchInput || !suggestionsDiv) {
        console.error('❌ Error creando elementos de autocompletado');
        return;
    }
    
    // Evento cuando cambia el tipo
    tipoSelect.addEventListener('change', function() {
        const tipo = this.value;
        searchInput.value = '';
        hiddenInput.value = '';
        detailsDiv.style.display = 'none';
        
        if (tipo) {
            searchInput.placeholder = `Buscar ${tipo.toLowerCase()}...`;
            searchInput.disabled = false;
            showPesticideSuggestions(tipo, '');
        } else {
            searchInput.placeholder = 'Seleccione tipo primero';
            searchInput.disabled = true;
            suggestionsDiv.innerHTML = '';
            suggestionsDiv.classList.remove('active');
        }
    });
    
    // Evento de búsqueda en tiempo real
    searchInput.addEventListener('input', function() {
        const tipo = tipoSelect.value;
        const query = this.value;
        
        if (tipo && query.length >= 2) {
            showPesticideSuggestions(tipo, query);
        } else if (tipo) {
            showPesticideSuggestions(tipo, '');
        } else {
            suggestionsDiv.innerHTML = '';
            suggestionsDiv.classList.remove('active');
        }
    });
    
    // Evento de foco
    searchInput.addEventListener('focus', function() {
        const tipo = tipoSelect.value;
        if (tipo && this.value.length === 0) {
            showPesticideSuggestions(tipo, '');
        }
    });
    
    // Evento para cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!plaguicidaContainer.contains(e.target)) {
            suggestionsDiv.classList.remove('active');
        }
    });
    
    console.log('✅ Autocompletado de plaguicidas configurado');
}

function showPesticideSuggestions(tipo, query) {
    const suggestionsDiv = document.getElementById('plaguicida-suggestions');
    if (!suggestionsDiv) {
        console.error('❌ No se encuentra #plaguicida-suggestions');
        return;
    }
    
    // Verificar que autoCompleteManager existe
    if (!window.autoCompleteManager) {
        suggestionsDiv.innerHTML = `
            <div class="autocomplete-no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Sistema de búsqueda no disponible</p>
            </div>
        `;
        suggestionsDiv.classList.add('active');
        return;
    }
    
    let filteredPesticides = [];
    
    if (query) {
        // Búsqueda inteligente
        filteredPesticides = window.autoCompleteManager.searchPesticides(query)
            .filter(p => p.tipo === tipo);
    } else {
        // Todos los del tipo seleccionado
        filteredPesticides = window.autoCompleteManager.getPesticidesByType(tipo);
    }
    
    if (filteredPesticides.length === 0) {
        suggestionsDiv.innerHTML = `
            <div class="autocomplete-no-results">
                <i class="fas fa-search"></i>
                <p>No se encontraron plaguicidas</p>
            </div>
        `;
        suggestionsDiv.classList.add('active');
        return;
    }
    
    let html = '';
    
    filteredPesticides.forEach(pesticide => {
        const toxicityClass = pesticide.toxicidad.toLowerCase();
        
        html += `
            <div class="autocomplete-suggestion" 
                 data-id="${pesticide.id}"
                 data-name="${pesticide.nombre}">
                <div class="suggestion-icon">
                    <i class="${pesticide.icono}"></i>
                </div>
                <div class="suggestion-content">
                    <div class="suggestion-title">${pesticide.nombre}</div>
                    <div class="suggestion-subtitle">
                        <span class="info-badge badge-type">${pesticide.clase}</span>
                        <span class="info-badge badge-toxicity ${toxicityClass}">
                            <i class="fas fa-exclamation-triangle"></i> ${pesticide.toxicidad}
                        </span>
                        <span class="info-badge badge-dosis">
                            ${pesticide.dosisBase} ${pesticide.unidad}
                        </span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
        <div class="autocomplete-count">
            ${filteredPesticides.length} resultado${filteredPesticides.length !== 1 ? 's' : ''}
        </div>
    `;
    
    suggestionsDiv.innerHTML = html;
    suggestionsDiv.classList.add('active');
    
    // Agregar eventos a las sugerencias
    document.querySelectorAll('.autocomplete-suggestion').forEach(suggestion => {
        suggestion.addEventListener('click', function() {
            selectPesticide(this);
        });
        
        suggestion.addEventListener('mouseenter', function() {
            document.querySelectorAll('.autocomplete-suggestion').forEach(s => {
                s.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}

function selectPesticide(element) {
    const pesticideId = element.dataset.id;
    const pesticideName = element.dataset.name;
    const searchInput = document.getElementById('plaguicida-search');
    const hiddenInput = document.getElementById('plaguicida-id');
    const detailsDiv = document.getElementById('plaguicida-details');
    const suggestionsDiv = document.getElementById('plaguicida-suggestions');
    
    if (!searchInput || !hiddenInput) {
        console.error('❌ Error: Elementos de formulario no encontrados');
        return;
    }
    
    // Buscar el plaguicida en la base de datos
    const pesticide = PESTICIDES_DB.find(p => p.id === parseInt(pesticideId));
    if (!pesticide) {
        showAlert('Plaguicida no encontrado', 'danger');
        return;
    }
    
    // Actualizar inputs
    searchInput.value = pesticideName;
    hiddenInput.value = pesticideId;
    
    // Mostrar detalles
    if (detailsDiv) {
        detailsDiv.innerHTML = generatePesticideDetails(pesticide);
        detailsDiv.style.display = 'block';
    }
    
    // Ocultar sugerencias
    if (suggestionsDiv) {
        suggestionsDiv.classList.remove('active');
    }
    
    // Validar compatibilidad con cultivo
    validateCompatibility();
    
    showAlert(`✅ ${pesticideName} seleccionado`, 'success');
}

function generatePesticideDetails(pesticide) {
    const toxicityColor = {
        'Alta': '#dc3545',
        'Media': '#ffc107',
        'Baja': '#28a745'
    };
    
    return `
        <div class="details-header">
            <div class="details-icon">
                <i class="${pesticide.icono}"></i>
            </div>
            <div class="details-title">
                <h3>${pesticide.nombre}</h3>
                <div class="details-subtitle">
                    <span class="toxicity-badge" style="background: ${toxicityColor[pesticide.toxicidad]}">
                        ${pesticide.toxicidad}
                    </span>
                    <span>${pesticide.clase}</span>
                </div>
            </div>
        </div>
        <div class="details-body">
            <div class="details-row">
                <div class="detail-item">
                    <i class="fas fa-prescription-bottle"></i>
                    <div>
                        <small>Dosis Base</small>
                        <strong>${pesticide.dosisBase} ${pesticide.unidad}</strong>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="far fa-calendar-times"></i>
                    <div>
                        <small>Carencia Base</small>
                        <strong>${pesticide.carenciaBase} días</strong>
                    </div>
                </div>
            </div>
            ${pesticide.usos && pesticide.usos.length > 0 ? `
                <div class="details-section">
                    <h4><i class="fas fa-bugs"></i> Usos Principales</h4>
                    <div class="tags-container">
                        ${pesticide.usos.map(uso => `<span class="tag">${uso}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// ============================================
// AUTOCOMPLETADO PARA CULTIVOS
// ============================================

function setupCropAutocomplete() {
    const cropContainer = document.getElementById('cultivo-container');
    
    if (!cropContainer) {
        console.error('❌ No se encuentra #cultivo-container');
        return;
    }
    
    console.log('🔧 Configurando autocompletado para cultivos...');
    
    // Crear contenedor de autocompletado
    cropContainer.innerHTML = `
        <div class="autocomplete-container">
            <input type="text" 
                   id="cultivo-search" 
                   class="autocomplete-input" 
                   placeholder="Buscar cultivo por nombre o tipo..."
                   autocomplete="off">
            <div id="cultivo-suggestions" class="autocomplete-suggestions"></div>
        </div>
        <input type="hidden" id="cultivo-id" value="">
        <div id="cultivo-details" class="crop-details" style="display: none;"></div>
    `;
    
    const searchInput = document.getElementById('cultivo-search');
    const suggestionsDiv = document.getElementById('cultivo-suggestions');
    const hiddenInput = document.getElementById('cultivo-id');
    const detailsDiv = document.getElementById('cultivo-details');
    
    if (!searchInput || !suggestionsDiv) {
        console.error('❌ Error creando elementos de autocompletado');
        return;
    }
    
    // Evento de búsqueda en tiempo real
    searchInput.addEventListener('input', function() {
        const query = this.value;
        
        if (query.length >= 2) {
            showCropSuggestions(query);
        } else {
            suggestionsDiv.innerHTML = '';
            suggestionsDiv.classList.remove('active');
        }
    });
    
    // Evento de foco
    searchInput.addEventListener('focus', function() {
        if (this.value.length === 0) {
            showAllCrops();
        }
    });
    
    // Evento para cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!cropContainer.contains(e.target)) {
            suggestionsDiv.classList.remove('active');
        }
    });
    
    console.log('✅ Autocompletado de cultivos configurado');
}

function showCropSuggestions(query) {
    const suggestionsDiv = document.getElementById('cultivo-suggestions');
    if (!suggestionsDiv) return;
    
    // Verificar que autoCompleteManager existe
    if (!window.autoCompleteManager) {
        suggestionsDiv.innerHTML = `
            <div class="autocomplete-no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Sistema de búsqueda no disponible</p>
            </div>
        `;
        suggestionsDiv.classList.add('active');
        return;
    }
    
    const filteredCrops = window.autoCompleteManager.searchCrops(query);
    
    if (filteredCrops.length === 0) {
        suggestionsDiv.innerHTML = `
            <div class="autocomplete-no-results">
                <i class="fas fa-search"></i>
                <p>No se encontraron cultivos</p>
            </div>
        `;
        suggestionsDiv.classList.add('active');
        return;
    }
    
    let html = '';
    
    filteredCrops.forEach(crop => {
        html += `
            <div class="autocomplete-suggestion" 
                 data-id="${crop.id}"
                 data-name="${crop.nombre}">
                <div class="suggestion-icon">
                    <i class="${crop.icono}"></i>
                </div>
                <div class="suggestion-content">
                    <div class="suggestion-title">${crop.nombre}</div>
                    <div class="suggestion-subtitle">
                        <span class="info-badge badge-type">${crop.tipo}</span>
                        <span class="info-badge">${crop.familia}</span>
                        <span class="info-badge">Factor: ${crop.factorDosis}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
        <div class="autocomplete-count">
            ${filteredCrops.length} resultado${filteredCrops.length !== 1 ? 's' : ''}
        </div>
    `;
    
    suggestionsDiv.innerHTML = html;
    suggestionsDiv.classList.add('active');
    
    // Agregar eventos a las sugerencias
    document.querySelectorAll('.autocomplete-suggestion').forEach(suggestion => {
        suggestion.addEventListener('click', function() {
            selectCrop(this);
        });
        
        suggestion.addEventListener('mouseenter', function() {
            document.querySelectorAll('.autocomplete-suggestion').forEach(s => {
                s.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}

function showAllCrops() {
    const suggestionsDiv = document.getElementById('cultivo-suggestions');
    if (!suggestionsDiv) return;
    
    let html = '';
    
    // Mostrar todos los cultivos
    CROPS_DB.forEach(crop => {
        html += `
            <div class="autocomplete-suggestion" 
                 data-id="${crop.id}"
                 data-name="${crop.nombre}">
                <div class="suggestion-icon">
                    <i class="${crop.icono}"></i>
                </div>
                <div class="suggestion-content">
                    <div class="suggestion-title">${crop.nombre}</div>
                    <div class="suggestion-subtitle">
                        <span>${crop.tipo}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
        <div class="autocomplete-count">
            ${CROPS_DB.length} cultivos disponibles
        </div>
    `;
    
    suggestionsDiv.innerHTML = html;
    suggestionsDiv.classList.add('active');
    
    // Agregar eventos
    document.querySelectorAll('.autocomplete-suggestion').forEach(suggestion => {
        suggestion.addEventListener('click', function() {
            selectCrop(this);
        });
    });
}

function selectCrop(element) {
    const cropId = element.dataset.id;
    const cropName = element.dataset.name;
    const searchInput = document.getElementById('cultivo-search');
    const hiddenInput = document.getElementById('cultivo-id');
    const detailsDiv = document.getElementById('cultivo-details');
    const suggestionsDiv = document.getElementById('cultivo-suggestions');
    
    if (!searchInput || !hiddenInput) {
        console.error('❌ Error: Elementos de formulario no encontrados');
        return;
    }
    
    // Buscar el cultivo en la base de datos
    const crop = CROPS_DB.find(c => c.id === parseInt(cropId));
    if (!crop) {
        showAlert('Cultivo no encontrado', 'danger');
        return;
    }
    
    // Actualizar inputs
    searchInput.value = cropName;
    hiddenInput.value = cropId;
    
    // Mostrar detalles
    if (detailsDiv) {
        detailsDiv.innerHTML = generateCropDetails(crop);
        detailsDiv.style.display = 'block';
    }
    
    // Ocultar sugerencias
    if (suggestionsDiv) {
        suggestionsDiv.classList.remove('active');
    }
    
    // Validar compatibilidad con plaguicida seleccionado
    validateCompatibility();
    
    showAlert(`✅ ${cropName} seleccionado`, 'success');
}

function generateCropDetails(crop) {
    return `
        <div class="details-header">
            <div class="details-icon">
                <i class="${crop.icono}"></i>
            </div>
            <div class="details-title">
                <h3>${crop.nombre}</h3>
                <div class="details-subtitle">
                    <span>${crop.familia}</span>
                    <span>•</span>
                    <span>${crop.tipo}</span>
                </div>
            </div>
        </div>
        <div class="details-body">
            <div class="details-row">
                <div class="detail-item">
                    <i class="fas fa-calculator"></i>
                    <div>
                        <small>Factor Dosis</small>
                        <strong>${crop.factorDosis}</strong>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="far fa-calendar"></i>
                    <div>
                        <small>Ciclo</small>
                        <strong>${crop.cicloDias} días</strong>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// VALIDACIÓN DE COMPATIBILIDAD
// ============================================

function validateCompatibility() {
    const pesticideId = document.getElementById('plaguicida-id').value;
    const cropId = document.getElementById('cultivo-id').value;
    const statusDiv = document.getElementById('compatibility-status');
    
    if (!statusDiv) return true;
    
    if (!pesticideId || !cropId) {
        statusDiv.style.display = 'none';
        return true;
    }
    
    const pesticide = PESTICIDES_DB.find(p => p.id === parseInt(pesticideId));
    const crop = CROPS_DB.find(c => c.id === parseInt(cropId));
    
    if (!pesticide || !crop) {
        statusDiv.style.display = 'none';
        return true;
    }
    
    // Verificar si el cultivo está en los permitidos
    const isCompatible = pesticide.cultivosPermitidos.includes(crop.id);
    
    statusDiv.style.display = 'block';
    
    if (isCompatible) {
        statusDiv.innerHTML = `
            <div class="compatibility-valid">
                <i class="fas fa-check-circle"></i>
                <span>Compatible: ${pesticide.nombre} puede usarse en ${crop.nombre}</span>
            </div>
        `;
        statusDiv.className = 'compatibility-status valid';
        return true;
    } else {
        statusDiv.innerHTML = `
            <div class="compatibility-invalid">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Incompatible: ${pesticide.nombre} NO está recomendado para ${crop.nombre}</span>
            </div>
        `;
        statusDiv.className = 'compatibility-status invalid';
        return false;
    }
}

// ============================================
// CÁLCULO DE DOSIS
// ============================================

function calculateDosis() {
    try {
        // Obtener datos
        const pesticideId = document.getElementById('plaguicida-id').value;
        const cropId = document.getElementById('cultivo-id').value;
        const area = parseFloat(document.getElementById('area').value);
        
        // Validaciones
        if (!pesticideId || !cropId || !area || area <= 0) {
            throw new Error('Complete todos los campos requeridos');
        }
        
        // Validar compatibilidad
        if (!validateCompatibility()) {
            const proceed = confirm('⚠️ Producto no recomendado para este cultivo. ¿Desea continuar?');
            if (!proceed) return;
        }
        
        // Obtener datos completos
        const pesticide = PESTICIDES_DB.find(p => p.id === parseInt(pesticideId));
        const crop = CROPS_DB.find(c => c.id === parseInt(cropId));
        
        if (!pesticide || !crop) {
            throw new Error('Datos no encontrados');
        }
        
        // Obtener condiciones ambientales
        const temp = parseFloat(document.getElementById('temp-manual').value) || 25;
        const humidity = parseFloat(document.getElementById('hum-manual').value) || 60;
        const wind = parseFloat(document.getElementById('wind-manual').value) || 5;
        
        // 1. Calcular dosis base ajustada por cultivo
        let dosisAjustada = pesticide.dosisBase * crop.factorDosis;
        
        // 2. Ajustar por condiciones ambientales
        const factorAmbiental = calculateEnvironmentalFactor(temp, humidity, wind);
        dosisAjustada *= factorAmbiental;
        
        // 3. Calcular cantidad total
        const cantidadTotal = dosisAjustada * area;
        
        // 4. Calcular carencia final
        const carenciaFinal = calculateFinalCarency(
            pesticide.carenciaBase,
            crop.tipo,
            temp,
            pesticide.toxicidad
        );
        
        // 5. Calcular próxima aplicación
        const nextApplication = calculateNextApplication(carenciaFinal);
        
        // Guardar cálculo en estado
        window.currentCalculation = {
            pesticide: pesticide,
            crop: crop,
            area: area,
            dosisAjustada: dosisAjustada,
            cantidadTotal: cantidadTotal,
            carenciaFinal: carenciaFinal,
            nextApplication: nextApplication,
            condiciones: { temp, humidity, wind },
            timestamp: new Date().toISOString()
        };
        
        // Mostrar resultados
        displayResults(dosisAjustada, cantidadTotal, carenciaFinal, nextApplication, pesticide);
        
        // Habilitar botón de registrar
        document.getElementById('registrar-btn').disabled = false;
        
        // Mostrar alerta de éxito
        showAlert('✅ Cálculo completado correctamente', 'success');
        
    } catch (error) {
        showAlert(`❌ ${error.message}`, 'danger');
    }
}

// ============================================
// FUNCIONES AUXILIARES DE CÁLCULO
// ============================================

function calculateEnvironmentalFactor(temp, humidity, wind) {
    let factor = 1.0;
    
    // Factor temperatura
    if (temp < 10) factor *= 1.3;
    else if (temp <= 15) factor *= 1.2;
    else if (temp <= 20) factor *= 1.1;
    else if (temp <= 25) factor *= 1.0;
    else if (temp <= 30) factor *= 0.9;
    else if (temp <= 35) factor *= 0.8;
    else factor *= 0.6;
    
    // Factor humedad
    if (humidity < 40) factor *= 1.2;
    else if (humidity <= 60) factor *= 1.1;
    else if (humidity <= 80) factor *= 1.0;
    else if (humidity <= 85) factor *= 0.9;
    else factor *= 0.8;
    
    // Factor viento
    if (wind < 5) factor *= 1.0;
    else if (wind <= 10) factor *= 0.9;
    else if (wind <= 15) factor *= 0.7;
    else factor *= 0.0; // No aplicar con viento fuerte
    
    return factor;
}

function calculateFinalCarency(carenciaBase, cropType, temp, toxicidad) {
    let carencia = carenciaBase;
    
    // Ajustar por tipo de cultivo
    const cropFactors = {
        "Hortaliza": 1.2,
        "Grano": 1.0,
        "Frutal": 1.5,
        "Tubérculo": 1.3
    };
    carencia *= cropFactors[cropType] || 1.0;
    
    // Ajustar por temperatura
    if (temp > 30) carencia *= 1.1;
    if (temp > 35) carencia *= 1.2;
    
    // Ajustar por toxicidad (mínimo)
    const minDays = {
        "Alta": 21,
        "Media": 14,
        "Baja": 7
    };
    carencia = Math.max(carencia, minDays[toxicidad] || 7);
    
    return Math.ceil(carencia);
}

function calculateNextApplication(carenciaFinal) {
    const today = new Date();
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + carenciaFinal);
    
    return nextDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function displayResults(dosisAjustada, cantidadTotal, carenciaFinal, nextApplication, pesticide) {
    const resultsContainer = document.getElementById('results-container');
    const dosisResult = document.getElementById('dosis-result');
    const totalResult = document.getElementById('total-result');
    const carenciaResult = document.getElementById('carencia-result');
    const proximaAplicacion = document.getElementById('proxima-aplicacion');
    const statusMessage = document.getElementById('status-message');
    
    if (!resultsContainer || !dosisResult) {
        console.error('❌ Elementos de resultados no encontrados');
        return;
    }
    
    // Mostrar resultados
    dosisResult.textContent = `${dosisAjustada.toFixed(3)} ${pesticide.unidad}`;
    totalResult.textContent = `${cantidadTotal.toFixed(3)} ${pesticide.unidad.split('/')[0]}`;
    carenciaResult.textContent = `${carenciaFinal} días`;
    proximaAplicacion.textContent = nextApplication;
    
    // Actualizar mensaje de estado
    if (statusMessage) {
        statusMessage.textContent = 'Cálculo validado y listo para registrar';
    }
    
    // Mostrar contenedor de resultados
    resultsContainer.style.display = 'block';
}

// ============================================
// CONFIGURACIÓN DE EVENTOS
// ============================================

function setupEventListeners() {
    // Botón calcular
    const calcularBtn = document.getElementById('calcular-btn');
    if (calcularBtn) {
        calcularBtn.addEventListener('click', calculateDosis);
    }
    
    // Botón registrar (usando función local temporal)
    const registrarBtn = document.getElementById('registrar-btn');
    if (registrarBtn) {
        registrarBtn.addEventListener('click', function() {
            // Función temporal hasta que storage.js cargue
            if (window.registerApplication) {
                window.registerApplication();
            } else {
                showAlert('Sistema de almacenamiento no disponible temporalmente', 'warning');
            }
        });
    }
    
    // Botón limpiar
    const limpiarBtn = document.getElementById('limpiar-btn');
    if (limpiarBtn) {
        limpiarBtn.addEventListener('click', clearForm);
    }
    
    // Botón historial
    const historialBtn = document.getElementById('historial-btn');
    if (historialBtn) {
        historialBtn.addEventListener('click', function() {
            showAlert('Funcionalidad de historial en desarrollo', 'info');
        });
    }
    
    // Botón NFC
    const nfcBtn = document.getElementById('nfc-simulate');
    if (nfcBtn) {
        nfcBtn.addEventListener('click', simulateNFCScan);
    }
    
    // Validación de EPI en tiempo real
    document.querySelectorAll('.epi-checkbox input').forEach(cb => {
        cb.addEventListener('change', validateEPI);
    });
}

function setupRealTimeValidation() {
    // Validar clima en tiempo real
    ['temp-manual', 'hum-manual', 'wind-manual'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateWeatherRecommendation);
        }
    });
}

function updateWeatherRecommendation() {
    const temp = parseFloat(document.getElementById('temp-manual').value) || 25;
    const wind = parseFloat(document.getElementById('wind-manual').value) || 5;
    const adviceElement = document.getElementById('weather-advice');
    
    if (!adviceElement) return;
    
    let recommendation = '✅ Condiciones favorables para aplicación';
    
    if (temp > 35) {
        recommendation = '⚠️ Temperatura muy alta - Evitar aplicación';
    } else if (temp > 30) {
        recommendation = '⚠️ Temperatura alta - Aplicar en horas frescas';
    } else if (wind > 15) {
        recommendation = '❌ Viento fuerte - NO APLICAR';
    } else if (wind > 10) {
        recommendation = '⚠️ Viento moderado - Usar boquillas antideriva';
    }
    
    adviceElement.textContent = recommendation;
}

function validateEPI() {
    const pesticideId = document.getElementById('plaguicida-id').value;
    if (!pesticideId) return;
    
    const pesticide = PESTICIDES_DB.find(p => p.id === parseInt(pesticideId));
    if (!pesticide) return;
    
    // Verificar EPIs marcados
    const epiRequired = pesticide.epiRequerido || [];
    let missingEPI = [];
    
    epiRequired.forEach(epi => {
        const checkbox = document.getElementById(`epi-${epi}`);
        if (checkbox && !checkbox.checked) {
            missingEPI.push(epi);
        }
    });
    
    // Mostrar advertencia si falta EPI
    if (missingEPI.length > 0) {
        const message = `⚠️ EPI requerido no marcado: ${missingEPI.join(', ')}`;
        showAlert(message, 'warning');
    }
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

function clearForm() {
    // Limpiar autocompletado de plaguicida
    const tipoSelect = document.getElementById('tipo-plaguicida');
    if (tipoSelect) tipoSelect.value = '';
    
    const plaguicidaSearch = document.getElementById('plaguicida-search');
    if (plaguicidaSearch) {
        plaguicidaSearch.value = '';
        plaguicidaSearch.disabled = true;
        plaguicidaSearch.placeholder = 'Seleccione tipo primero';
    }
    
    document.getElementById('plaguicida-id').value = '';
    const plaguicidaDetails = document.getElementById('plaguicida-details');
    if (plaguicidaDetails) {
        plaguicidaDetails.style.display = 'none';
        plaguicidaDetails.innerHTML = '';
    }
    
    // Limpiar autocompletado de cultivo
    const cultivoSearch = document.getElementById('cultivo-search');
    if (cultivoSearch) cultivoSearch.value = '';
    
    document.getElementById('cultivo-id').value = '';
    const cultivoDetails = document.getElementById('cultivo-details');
    if (cultivoDetails) {
        cultivoDetails.style.display = 'none';
        cultivoDetails.innerHTML = '';
    }
    
    // Limpiar otros campos
    const areaInput = document.getElementById('area');
    if (areaInput) areaInput.value = '1.0';
    
    const observaciones = document.getElementById('observaciones');
    if (observaciones) observaciones.value = '';
    
    const tempInput = document.getElementById('temp-manual');
    if (tempInput) tempInput.value = '25';
    
    const humInput = document.getElementById('hum-manual');
    if (humInput) humInput.value = '60';
    
    const windInput = document.getElementById('wind-manual');
    if (windInput) windInput.value = '5';
    
    const tiempoInput = document.getElementById('tiempo-exposicion');
    if (tiempoInput) tiempoInput.value = '120';
    
    // Limpiar resultados
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) resultsContainer.style.display = 'none';
    
    const registrarBtn = document.getElementById('registrar-btn');
    if (registrarBtn) registrarBtn.disabled = true;
    
    // Limpiar EPI
    document.querySelectorAll('.epi-checkbox input').forEach(cb => {
        cb.checked = false;
    });
    
    // Limpiar estado de compatibilidad
    const compatibilityStatus = document.getElementById('compatibility-status');
    if (compatibilityStatus) {
        compatibilityStatus.style.display = 'none';
        compatibilityStatus.innerHTML = '';
    }
    
    showAlert('Formulario limpiado correctamente', 'info');
}

function initTooltips() {
    // Tooltips simples para íconos
    const tooltipElements = document.querySelectorAll('[title]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.title;
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 0.5rem 0.75rem;
                border-radius: 4px;
                font-size: 0.8rem;
                z-index: 10000;
                white-space: nowrap;
                pointer-events: none;
                transform: translate(-50%, -100%);
                top: ${e.clientY - 10}px;
                left: ${e.clientX}px;
            `;
            document.body.appendChild(tooltip);
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mousemove', function(e) {
            if (this._tooltip) {
                this._tooltip.style.top = (e.clientY - 10) + 'px';
                this._tooltip.style.left = e.clientX + 'px';
            }
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                document.body.removeChild(this._tooltip);
                this._tooltip = null;
            }
        });
    });
}

function initValidations() {
    // Validación de campos numéricos
    const numericInputs = document.querySelectorAll('input[type="number"]');
    numericInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const value = parseFloat(this.value);
            if (isNaN(value) || value < 0) {
                showAlert('Valor inválido. Ingrese un número positivo.', 'warning');
                this.value = this.defaultValue || '0';
            }
        });
    });
}

function updateStatistics() {
    try {
        // Actualizar contadores en el footer
        const totalRegistros = document.getElementById('total-registros');
        const aplicacionesHoy = document.getElementById('aplicaciones-hoy');
        
        if (totalRegistros) totalRegistros.textContent = '0';
        if (aplicacionesHoy) aplicacionesHoy.textContent = '0';
        
    } catch (error) {
        console.error('Error al actualizar estadísticas:', error);
    }
}

function loadFavorites() {
    // Función temporal
    console.log('Favoritos: Funcionalidad en desarrollo');
}

// ============================================
// SIMULACIÓN NFC
// ============================================

function simulateNFCScan() {
    const nfcBtn = document.getElementById('nfc-simulate');
    const nfcStatus = document.getElementById('nfc-status');
    const nfcInfo = document.getElementById('nfc-info');
    const loteId = document.getElementById('lote-id');
    const loteCultivo = document.getElementById('lote-cultivo');
    const loteArea = document.getElementById('lote-area');
    
    if (!nfcBtn || !nfcStatus) return;
    
    // Simular escaneo
    nfcBtn.disabled = true;
    nfcBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Escaneando...';
    
    setTimeout(() => {
        // Datos simulados
        const cultivos = ['Maíz', 'Trigo', 'Soya', 'Tomate', 'Papa'];
        const cultivoAleatorio = cultivos[Math.floor(Math.random() * cultivos.length)];
        const areaAleatoria = (Math.random() * 4 + 1).toFixed(1);
        
        // Actualizar UI
        if (loteId) loteId.textContent = `LT-${Math.floor(Math.random() * 9000 + 1000)}`;
        if (loteCultivo) loteCultivo.textContent = cultivoAleatorio;
        if (loteArea) loteArea.textContent = `${areaAleatoria} ha`;
        
        nfcStatus.textContent = 'Escaneado';
        nfcStatus.style.color = '#28A745';
        nfcStatus.style.fontWeight = 'bold';
        
        if (nfcInfo) nfcInfo.style.display = 'block';
        
        // Rellenar automáticamente el formulario
        const cultivoSearch = document.getElementById('cultivo-search');
        const areaInput = document.getElementById('area');
        
        if (cultivoSearch) cultivoSearch.value = cultivoAleatorio;
        if (areaInput) areaInput.value = areaAleatoria;
        
        // Buscar y seleccionar cultivo automáticamente
        const crop = CROPS_DB.find(c => c.nombre === cultivoAleatorio);
        if (crop) {
            document.getElementById('cultivo-id').value = crop.id;
            const detailsDiv = document.getElementById('cultivo-details');
            if (detailsDiv) {
                detailsDiv.innerHTML = generateCropDetails(crop);
                detailsDiv.style.display = 'block';
            }
        }
        
        nfcBtn.disabled = false;
        nfcBtn.innerHTML = '<i class="fas fa-qrcode"></i> Simular Escaneo NFC';
        
        showAlert(`Lote escaneado correctamente: ${cultivoAleatorio}`, 'success');
        
    }, 1500);
}

// ============================================
// INICIALIZACIÓN GLOBAL
// ============================================

// Función temporal para registro
window.registerApplication = function() {
    try {
        if (!window.currentCalculation) {
            throw new Error('Primero realice un cálculo');
        }
        
        // Simular guardado
        const registro = {
            ...window.currentCalculation,
            fechaAplicacion: new Date().toISOString(),
            observaciones: document.getElementById('observaciones').value || ''
        };
        
        // Mostrar en consola
        console.log('📋 Registro simulado:', registro);
        
        // Mostrar modal de éxito
        const modal = document.getElementById('successModal');
        const modalMessage = document.getElementById('modal-message');
        
        if (modalMessage) {
            modalMessage.textContent = `Aplicación registrada para ${registro.crop.nombre} con ${registro.pesticide.nombre}`;
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
        
        // Limpiar formulario después de registrar
        setTimeout(() => {
            clearForm();
            if (modal) {
                modal.style.display = 'none';
            }
        }, 3000);
        
        showAlert('✅ Aplicación registrada exitosamente', 'success');
        
    } catch (error) {
        showAlert(`❌ ${error.message}`, 'danger');
    }
};

console.log('✨ AgroTracebility v2.0 con autocompletado cargado');