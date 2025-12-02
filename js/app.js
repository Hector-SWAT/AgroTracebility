// ============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initApplication();
});

async function initApplication() {
    console.log('🌱 Iniciando AgroTracebility v2.0...');
    
    try {
        // 1. Inicializar gestor de autocompletado
        window.autoCompleteManager = new AutoCompleteManager();
        
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
    document.getElementById('current-date').textContent = 
        now.toLocaleDateString('es-ES', options);
}

function loadInitialData() {
    // Cargar cultivos en dropdown
    populateCropsDropdown();
    
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
    
    // Crear contenedor de autocompletado
    plaguicidaContainer.innerHTML = `
        <div class="autocomplete-container">
            <input type="text" 
                   id="plaguicida-search" 
                   class="autocomplete-input" 
                   placeholder="Buscar plaguicida por nombre, tipo o uso..."
                   autocomplete="off">
            <div id="plaguicida-suggestions" class="autocomplete-suggestions"></div>
        </div>
        <input type="hidden" id="plaguicida-id" value="">
        <div id="plaguicida-details" class="pesticide-details" style="display: none;"></div>
    `;
    
    const searchInput = document.getElementById('plaguicida-search');
    const suggestionsDiv = document.getElementById('plaguicida-suggestions');
    const hiddenInput = document.getElementById('plaguicida-id');
    const detailsDiv = document.getElementById('plaguicida-details');
    
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
}

function showPesticideSuggestions(tipo, query) {
    const suggestionsDiv = document.getElementById('plaguicida-suggestions');
    let filteredPesticides;
    
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
                 data-pesticide='${JSON.stringify(pesticide)}'>
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
    const pesticide = JSON.parse(element.dataset.pesticide);
    const searchInput = document.getElementById('plaguicida-search');
    const hiddenInput = document.getElementById('plaguicida-id');
    const detailsDiv = document.getElementById('plaguicida-details');
    const suggestionsDiv = document.getElementById('plaguicida-suggestions');
    
    // Actualizar inputs
    searchInput.value = pesticide.nombre;
    hiddenInput.value = pesticide.id;
    
    // Mostrar detalles
    detailsDiv.innerHTML = generatePesticideDetails(pesticide);
    detailsDiv.style.display = 'block';
    
    // Ocultar sugerencias
    suggestionsDiv.classList.remove('active');
    
    // Actualizar recomendaciones según cultivo seleccionado
    updateRecommendations();
    
    // Validar compatibilidad con cultivo
    validateCompatibility();
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
                <div class="detail-item">
                    <i class="fas fa-exclamation-circle"></i>
                    <div>
                        <small>LMR</small>
                        <strong>${pesticide.lmr} ppm</strong>
                    </div>
                </div>
            </div>
            <div class="details-section">
                <h4><i class="fas fa-bugs"></i> Usos Principales</h4>
                <div class="tags-container">
                    ${pesticide.usos.map(uso => `<span class="tag">${uso}</span>`).join('')}
                </div>
            </div>
            <div class="details-section">
                <h4><i class="fas fa-user-shield"></i> EPI Requerido</h4>
                <div class="epi-icons">
                    ${pesticide.epiRequerido.map(epi => `
                        <div class="epi-item">
                            <i class="fas fa-${getEPIIcon(epi)}"></i>
                            <small>${epi}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function getEPIIcon(epi) {
    const icons = {
        'guantes': 'hand-paper',
        'mascarilla': 'head-side-mask',
        'overol': 'tshirt',
        'gafas': 'glasses',
        'botas': 'shoe-prints'
    };
    return icons[epi] || 'shield-alt';
}

// ============================================
// AUTOCOMPLETADO PARA CULTIVOS
// ============================================

function setupCropAutocomplete() {
    const cropContainer = document.getElementById('cultivo-container');
    
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
}

function showCropSuggestions(query) {
    const suggestionsDiv = document.getElementById('cultivo-suggestions');
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
                 data-crop='${JSON.stringify(crop)}'>
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
    let html = '';
    
    // Agrupar cultivos por tipo
    const cropsByType = {};
    CROPS_DB.forEach(crop => {
        if (!cropsByType[crop.tipo]) {
            cropsByType[crop.tipo] = [];
        }
        cropsByType[crop.tipo].push(crop);
    });
    
    // Mostrar por grupos
    Object.keys(cropsByType).forEach(tipo => {
        html += `
            <div class="suggestion-group">
                <div class="group-header">${tipo}</div>
        `;
        
        cropsByType[tipo].forEach(crop => {
            html += `
                <div class="autocomplete-suggestion" 
                     data-id="${crop.id}"
                     data-crop='${JSON.stringify(crop)}'>
                    <div class="suggestion-icon">
                        <i class="${crop.icono}"></i>
                    </div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">${crop.nombre}</div>
                        <div class="suggestion-subtitle">
                            <span>${crop.familia}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
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
    const crop = JSON.parse(element.dataset.crop);
    const searchInput = document.getElementById('cultivo-search');
    const hiddenInput = document.getElementById('cultivo-id');
    const detailsDiv = document.getElementById('cultivo-details');
    const suggestionsDiv = document.getElementById('cultivo-suggestions');
    
    // Actualizar inputs
    searchInput.value = crop.nombre;
    hiddenInput.value = crop.id;
    
    // Mostrar detalles
    detailsDiv.innerHTML = generateCropDetails(crop);
    detailsDiv.style.display = 'block';
    
    // Ocultar sugerencias
    suggestionsDiv.classList.remove('active');
    
    // Actualizar recomendaciones de plaguicidas
    updateRecommendations();
    
    // Validar compatibilidad con plaguicida seleccionado
    validateCompatibility();
}

function generateCropDetails(crop) {
    // Obtener plaguicidas recomendados para este cultivo
    const recommendedPesticides = window.autoCompleteManager.getRecommendations(crop.id);
    
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
            
            ${crop.restricciones && crop.restricciones.length > 0 ? `
                <div class="details-section warning">
                    <h4><i class="fas fa-exclamation-triangle"></i> Restricciones</h4>
                    <ul>
                        ${crop.restricciones.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${recommendedPesticides.length > 0 ? `
                <div class="details-section">
                    <h4><i class="fas fa-spray-can"></i> Plaguicidas Recomendados</h4>
                    <div class="recommended-pesticides">
                        ${recommendedPesticides.slice(0, 5).map(p => `
                            <div class="recommended-item" data-id="${p.id}">
                                <i class="${p.icono}"></i>
                                <span>${p.nombre}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// ============================================
// RECOMENDACIONES INTELIGENTES
// ============================================

function updateRecommendations() {
    const cropId = document.getElementById('cultivo-id').value;
    const pesticideId = document.getElementById('plaguicida-id').value;
    const recommendationsDiv = document.getElementById('recommendations-container');
    
    if (!cropId && !pesticideId) {
        recommendationsDiv.style.display = 'none';
        return;
    }
    
    let recommendations = [];
    
    if (cropId && !pesticideId) {
        // Mostrar plaguicidas recomendados para el cultivo
        const crop = CROPS_DB.find(c => c.id === parseInt(cropId));
        if (crop) {
            recommendations = window.autoCompleteManager.getRecommendations(crop.id);
        }
    } else if (pesticideId && !cropId) {
        // Mostrar cultivos compatibles con el plaguicida
        const pesticide = PESTICIDES_DB.find(p => p.id === parseInt(pesticideId));
        if (pesticide) {
            recommendations = CROPS_DB.filter(c => 
                pesticide.cultivosPermitidos.includes(c.id)
            );
        }
    }
    
    if (recommendations.length === 0) {
        recommendationsDiv.style.display = 'none';
        return;
    }
    
    recommendationsDiv.style.display = 'block';
    
    let html = `
        <div class="recommendations-header">
            <i class="fas fa-lightbulb"></i>
            <span>Recomendaciones</span>
        </div>
        <div class="recommendations-grid">
    `;
    
    recommendations.slice(0, 6).forEach(item => {
        if (item.dosisBase) {
            // Es un plaguicida
            html += `
                <div class="recommendation-card" data-id="${item.id}" data-type="pesticide">
                    <div class="recommendation-card-header">
                        <i class="${item.icono} recommendation-icon"></i>
                        <div class="recommendation-name">${item.nombre}</div>
                    </div>
                    <div class="recommendation-details">
                        <div>${item.dosisBase} ${item.unidad}</div>
                        <div class="toxicity-${item.toxicidad.toLowerCase()}">${item.toxicidad}</div>
                    </div>
                </div>
            `;
        } else {
            // Es un cultivo
            html += `
                <div class="recommendation-card" data-id="${item.id}" data-type="crop">
                    <div class="recommendation-card-header">
                        <i class="${item.icono} recommendation-icon"></i>
                        <div class="recommendation-name">${item.nombre}</div>
                    </div>
                    <div class="recommendation-details">
                        <div>${item.tipo}</div>
                        <div>Factor: ${item.factorDosis}</div>
                    </div>
                </div>
            `;
        }
    });
    
    html += `</div>`;
    recommendationsDiv.innerHTML = html;
    
    // Agregar eventos a las recomendaciones
    document.querySelectorAll('.recommendation-card').forEach(card => {
        card.addEventListener('click', function() {
            const id = this.dataset.id;
            const type = this.dataset.type;
            
            if (type === 'pesticide') {
                const pesticide = PESTICIDES_DB.find(p => p.id === parseInt(id));
                if (pesticide) {
                    // Seleccionar este plaguicida
                    document.getElementById('tipo-plaguicida').value = pesticide.tipo;
                    document.getElementById('tipo-plaguicida').dispatchEvent(new Event('change'));
                    
                    // Simular selección en autocompletado
                    setTimeout(() => {
                        document.getElementById('plaguicida-search').value = pesticide.nombre;
                        document.getElementById('plaguicida-id').value = pesticide.id;
                        document.getElementById('plaguicida-details').innerHTML = 
                            generatePesticideDetails(pesticide);
                        document.getElementById('plaguicida-details').style.display = 'block';
                    }, 100);
                }
            } else if (type === 'crop') {
                const crop = CROPS_DB.find(c => c.id === parseInt(id));
                if (crop) {
                    // Seleccionar este cultivo
                    document.getElementById('cultivo-search').value = crop.nombre;
                    document.getElementById('cultivo-id').value = crop.id;
                    document.getElementById('cultivo-details').innerHTML = 
                        generateCropDetails(crop);
                    document.getElementById('cultivo-details').style.display = 'block';
                }
            }
        });
    });
}

// ============================================
// VALIDACIÓN DE COMPATIBILIDAD
// ============================================

function validateCompatibility() {
    const pesticideId = document.getElementById('plaguicida-id').value;
    const cropId = document.getElementById('cultivo-id').value;
    const statusDiv = document.getElementById('compatibility-status');
    
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
// CÁLCULO DE DOSIS (MEJORADO)
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
        
        // Validar EPI
        validateEPI();
        
        // Habilitar botón de registrar
        document.getElementById('registrar-btn').disabled = false;
        
        // Mostrar alerta de éxito
        showAlert('✅ Cálculo completado correctamente', 'success');
        
    } catch (error) {
        showAlert(`❌ ${error.message}`, 'danger');
    }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function populateCropsDropdown() {
    // Esta función ya no se usa, pero la mantenemos por compatibilidad
    console.log('Dropdown de cultivos reemplazado por autocompletado');
}

function setupEventListeners() {
    // Botón calcular
    document.getElementById('calcular-btn').addEventListener('click', calculateDosis);
    
    // Botón registrar
    document.getElementById('registrar-btn').addEventListener('click', registerApplication);
    
    // Botón limpiar
    document.getElementById('limpiar-btn').addEventListener('click', clearForm);
    
    // Botón historial
    document.getElementById('historial-btn').addEventListener('click', showHistory);
    
    // Validación de EPI en tiempo real
    document.querySelectorAll('.epi-checkbox input').forEach(cb => {
        cb.addEventListener('change', validateEPI);
    });
    
    // Actualizar recomendaciones cuando cambie el área
    document.getElementById('area').addEventListener('input', updateCalculationPreview);
}

function setupRealTimeValidation() {
    // Validar clima en tiempo real
    ['temp-manual', 'hum-manual', 'wind-manual'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateWeatherRecommendation);
    });
    
    // Validar compatibilidad en tiempo real
    document.getElementById('plaguicida-id').addEventListener('change', validateCompatibility);
    document.getElementById('cultivo-id').addEventListener('change', validateCompatibility);
}

function updateCalculationPreview() {
    const area = parseFloat(document.getElementById('area').value);
    const pesticideId = document.getElementById('plaguicida-id').value;
    
    if (area && area > 0 && pesticideId) {
        const pesticide = PESTICIDES_DB.find(p => p.id === parseInt(pesticideId));
        if (pesticide) {
            const preview = document.getElementById('calculation-preview');
            if (preview) {
                preview.innerHTML = `
                    <small>Previsualización: ${pesticide.dosisBase} ${pesticide.unidad} × ${area} ha = 
                    ${(pesticide.dosisBase * area).toFixed(3)} ${pesticide.unidad.split('/')[0]}</small>
                `;
                preview.style.display = 'block';
            }
        }
    }
}

// ============================================
// ESTILOS DINÁMICOS PARA COMPATIBILIDAD
// ============================================

const compatibilityStyles = document.createElement('style');
compatibilityStyles.textContent = `
    .compatibility-status {
        padding: 0.75rem;
        border-radius: var(--radius-sm);
        margin: 1rem 0;
        display: none;
    }
    
    .compatibility-status.valid {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
    }
    
    .compatibility-status.invalid {
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
    }
    
    .compatibility-valid, .compatibility-invalid {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .pesticide-details, .crop-details {
        margin-top: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: var(--radius-sm);
        border-left: 4px solid var(--primary);
    }
    
    .details-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .details-icon {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        border-radius: 50%;
        font-size: 1.5rem;
        color: var(--primary);
    }
    
    .details-title h3 {
        margin: 0;
        font-size: 1.2rem;
    }
    
    .details-subtitle {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        font-size: 0.9rem;
        color: var(--dark-gray);
    }
    
    .toxicity-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        color: white;
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .details-body {
        font-size: 0.9rem;
    }
    
    .details-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--light-gray);
    }
    
    .detail-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .detail-item i {
        color: var(--primary);
        font-size: 1.2rem;
    }
    
    .detail-item small {
        display: block;
        color: var(--dark-gray);
        font-size: 0.8rem;
    }
    
    .details-section {
        margin-top: 1rem;
    }
    
    .details-section h4 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: var(--dark);
    }
    
    .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .tag {
        padding: 0.25rem 0.5rem;
        background: white;
        border: 1px solid var(--light-gray);
        border-radius: 12px;
        font-size: 0.8rem;
    }
    
    .epi-icons {
        display: flex;
        gap: 1rem;
    }
    
    .epi-item {
        text-align: center;
    }
    
    .epi-item i {
        display: block;
        font-size: 1.5rem;
        color: var(--primary);
        margin-bottom: 0.25rem;
    }
    
    .recommended-pesticides {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .recommended-item {
        padding: 0.5rem;
        background: white;
        border: 1px solid var(--light-gray);
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .recommended-item:hover {
        border-color: var(--primary);
        background: var(--light);
    }
    
    .suggestion-group {
        border-bottom: 1px solid var(--light-gray);
    }
    
    .suggestion-group:last-child {
        border-bottom: none;
    }
    
    .group-header {
        padding: 0.5rem 1rem;
        background: var(--light-gray);
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--dark);
    }
`;
document.head.appendChild(compatibilityStyles);

// ============================================
// INICIALIZAR LA APLICACIÓN
// ============================================

// Las funciones restantes (registerApplication, clearForm, showHistory, etc.)
// se mantienen igual que en la versión anterior pero ahora usan los nuevos IDs:
// - 'plaguicida-id' en lugar de 'plaguicida'
// - 'cultivo-id' en lugar de 'cultivo'

console.log('✨ AgroTracebility v2.0 con autocompletado cargado');