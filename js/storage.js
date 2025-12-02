// ============================================
// MÓDULO DE ALMACENAMIENTO Y PERSISTENCIA
// ============================================

class StorageManager {
    constructor() {
        this.initializeStorage();
    }

    // Inicializar almacenamiento
    initializeStorage() {
        // Verificar si localStorage está disponible
        if (!this.isLocalStorageAvailable()) {
            console.warn('⚠️ localStorage no disponible, usando almacenamiento en memoria');
            this.useFallback = true;
            this.memoryStorage = {
                registros: [],
                configuracion: this.getDefaultConfig(),
                favoritos: []
            };
        } else {
            this.useFallback = false;
            this.initDefaultData();
        }
    }

    // Verificar si localStorage está disponible
    isLocalStorageAvailable() {
        try {
            const testKey = '__agro_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Configuración por defecto
    getDefaultConfig() {
        return {
            unidadPredeterminada: 'ha',
            ajusteAutomatico: true,
            mostrarAdvertencias: true,
            tema: 'claro',
            notificaciones: true,
            unidadTemperatura: '°C',
            unidadArea: 'ha',
            idioma: 'es',
            historicoDias: 365,
            backupAutomatico: true
        };
    }

    // Inicializar datos por defecto
    initDefaultData() {
        // Configuración
        if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
            localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.getDefaultConfig()));
        }

        // Registros
        if (!localStorage.getItem(STORAGE_KEYS.REGISTROS)) {
            localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify([]));
        }

        // Favoritos
        if (!localStorage.getItem(STORAGE_KEYS.FAVORITOS)) {
            localStorage.setItem(STORAGE_KEYS.FAVORITOS, JSON.stringify([]));
        }

        // Estadísticas
        if (!localStorage.getItem(STORAGE_KEYS.ESTADISTICAS)) {
            this.initStatistics();
        }
    }

    // ============================================
    // GESTIÓN DE REGISTROS
    // ============================================

    // Guardar un nuevo registro
    saveRegistro(registro) {
        try {
            // Validar registro
            if (!this.validateRegistro(registro)) {
                throw new Error('Registro inválido');
            }

            // Agregar metadatos
            const registroCompleto = {
                ...registro,
                id: this.generateId(),
                fechaCreacion: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString(),
                version: '2.0'
            };

            // Guardar en almacenamiento
            const registros = this.getRegistros();
            registros.unshift(registroCompleto); // Agregar al inicio
            this.setRegistros(registros);

            // Actualizar estadísticas
            this.updateStatistics(registroCompleto);

            // Notificar a la UI si es necesario
            this.notifyDataChange('registro-nuevo', registroCompleto);

            return registroCompleto.id;
        } catch (error) {
            console.error('❌ Error al guardar registro:', error);
            throw error;
        }
    }

    // Obtener todos los registros
    getRegistros(filtros = {}) {
        let registros;
        
        if (this.useFallback) {
            registros = this.memoryStorage.registros;
        } else {
            registros = JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTROS) || '[]');
        }

        // Aplicar filtros si existen
        return this.applyFilters(registros, filtros);
    }

    // Obtener registro por ID
    getRegistroById(id) {
        const registros = this.getRegistros();
        return registros.find(r => r.id === id);
    }

    // Actualizar registro
    updateRegistro(id, datosActualizados) {
        try {
            const registros = this.getRegistros();
            const index = registros.findIndex(r => r.id === id);
            
            if (index === -1) {
                throw new Error('Registro no encontrado');
            }

            // Preservar datos existentes y agregar actualización
            registros[index] = {
                ...registros[index],
                ...datosActualizados,
                fechaActualizacion: new Date().toISOString()
            };

            this.setRegistros(registros);
            this.notifyDataChange('registro-actualizado', registros[index]);

            return true;
        } catch (error) {
            console.error('❌ Error al actualizar registro:', error);
            return false;
        }
    }

    // Eliminar registro
    deleteRegistro(id) {
        try {
            let registros = this.getRegistros();
            registros = registros.filter(r => r.id !== id);
            this.setRegistros(registros);
            this.notifyDataChange('registro-eliminado', id);
            return true;
        } catch (error) {
            console.error('❌ Error al eliminar registro:', error);
            return false;
        }
    }

    // ============================================
    // GESTIÓN DE CONFIGURACIÓN
    // ============================================

    // Obtener configuración
    getConfig() {
        if (this.useFallback) {
            return this.memoryStorage.configuracion;
        }
        
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG) || '{}');
    }

    // Actualizar configuración
    updateConfig(nuevaConfig) {
        try {
            const configActual = this.getConfig();
            const configActualizada = {
                ...configActual,
                ...nuevaConfig,
                fechaActualizacion: new Date().toISOString()
            };

            if (this.useFallback) {
                this.memoryStorage.configuracion = configActualizada;
            } else {
                localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(configActualizada));
            }

            this.notifyDataChange('config-actualizada', configActualizada);
            return true;
        } catch (error) {
            console.error('❌ Error al actualizar configuración:', error);
            return false;
        }
    }

    // ============================================
    // GESTIÓN DE FAVORITOS
    // ============================================

    // Agregar a favoritos
    addFavorito(item) {
        try {
            const favoritos = this.getFavoritos();
            
            // Evitar duplicados
            if (!favoritos.some(f => f.id === item.id && f.type === item.type)) {
                favoritos.push({
                    ...item,
                    fechaAgregado: new Date().toISOString()
                });
                this.setFavoritos(favoritos);
            }

            return true;
        } catch (error) {
            console.error('❌ Error al agregar favorito:', error);
            return false;
        }
    }

    // Obtener favoritos
    getFavoritos() {
        if (this.useFallback) {
            return this.memoryStorage.favoritos;
        }
        
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITOS) || '[]');
    }

    // Eliminar de favoritos
    removeFavorito(id, type) {
        try {
            let favoritos = this.getFavoritos();
            favoritos = favoritos.filter(f => !(f.id === id && f.type === type));
            this.setFavoritos(favoritos);
            return true;
        } catch (error) {
            console.error('❌ Error al eliminar favorito:', error);
            return false;
        }
    }

    // Verificar si es favorito
    isFavorito(id, type) {
        const favoritos = this.getFavoritos();
        return favoritos.some(f => f.id === id && f.type === type);
    }

    // ============================================
    // ESTADÍSTICAS
    // ============================================

    // Inicializar estadísticas
    initStatistics() {
        const estadisticasIniciales = {
            totalAplicaciones: 0,
            cultivosMasUsados: {},
            plaguicidasMasUsados: {},
            volumenTotal: 0,
            ultimaActualizacion: new Date().toISOString(),
            historicoMensual: {}
        };

        if (!this.useFallback) {
            localStorage.setItem(STORAGE_KEYS.ESTADISTICAS, JSON.stringify(estadisticasIniciales));
        }
    }

    // Actualizar estadísticas
    updateStatistics(registro) {
        try {
            let estadisticas = this.getStatistics();
            const mes = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' });
            
            // Actualizar contadores
            estadisticas.totalAplicaciones++;
            estadisticas.volumenTotal += (registro.cantidadTotal || 0);
            
            // Actualizar cultivo más usado
            if (registro.cultivo) {
                const cultivoNombre = registro.cultivo.nombre;
                estadisticas.cultivosMasUsados[cultivoNombre] = 
                    (estadisticas.cultivosMasUsados[cultivoNombre] || 0) + 1;
            }
            
            // Actualizar plaguicida más usado
            if (registro.pesticide) {
                const pesticidaNombre = registro.pesticide.nombre;
                estadisticas.plaguicidasMasUsados[pesticidaNombre] = 
                    (estadisticas.plaguicidasMasUsados[pesticidaNombre] || 0) + 1;
            }
            
            // Actualizar histórico mensual
            if (!estadisticas.historicoMensual[mes]) {
                estadisticas.historicoMensual[mes] = 0;
            }
            estadisticas.historicoMensual[mes]++;
            
            estadisticas.ultimaActualizacion = new Date().toISOString();
            
            this.setStatistics(estadisticas);
        } catch (error) {
            console.error('❌ Error al actualizar estadísticas:', error);
        }
    }

    // Obtener estadísticas
    getStatistics() {
        if (this.useFallback) {
            return {
                totalAplicaciones: this.memoryStorage.registros.length,
                volumenTotal: this.memoryStorage.registros.reduce((sum, r) => sum + (r.cantidadTotal || 0), 0),
                cultivosMasUsados: {},
                plaguicidasMasUsados: {},
                historicoMensual: {}
            };
        }
        
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ESTADISTICAS) || '{}');
    }

    // ============================================
    // EXPORTACIÓN E IMPORTACIÓN
    // ============================================

    // Exportar datos
    exportData() {
        try {
            const data = {
                registros: this.getRegistros(),
                configuracion: this.getConfig(),
                favoritos: this.getFavoritos(),
                estadisticas: this.getStatistics(),
                metadata: {
                    version: '2.0',
                    fechaExportacion: new Date().toISOString(),
                    totalRegistros: this.getRegistros().length
                }
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `agrotracebility_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('❌ Error al exportar datos:', error);
            return false;
        }
    }

    // Importar datos
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    // Validar estructura del archivo
                    if (!this.validateImportData(data)) {
                        reject(new Error('Formato de archivo inválido'));
                        return;
                    }

                    // Realizar importación
                    if (data.registros) {
                        this.setRegistros(data.registros);
                    }
                    
                    if (data.configuracion) {
                        if (this.useFallback) {
                            this.memoryStorage.configuracion = data.configuracion;
                        } else {
                            localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(data.configuracion));
                        }
                    }
                    
                    if (data.favoritos) {
                        this.setFavoritos(data.favoritos);
                    }

                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsText(file);
        });
    }

    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================

    // Validar registro
    validateRegistro(registro) {
        const requiredFields = ['pesticide', 'cultivo', 'area'];
        return requiredFields.every(field => registro[field]);
    }

    // Generar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Aplicar filtros a registros
    applyFilters(registros, filtros) {
        let resultado = [...registros];

        // Filtrar por cultivo
        if (filtros.cultivoId) {
            resultado = resultado.filter(r => 
                r.cultivo && r.cultivo.id === filtros.cultivoId
            );
        }

        // Filtrar por plaguicida
        if (filtros.pesticideId) {
            resultado = resultado.filter(r => 
                r.pesticide && r.pesticide.id === filtros.pesticideId
            );
        }

        // Filtrar por fecha
        if (filtros.fechaInicio && filtros.fechaFin) {
            resultado = resultado.filter(r => {
                const fechaRegistro = new Date(r.fechaCreacion);
                return fechaRegistro >= new Date(filtros.fechaInicio) && 
                       fechaRegistro <= new Date(filtros.fechaFin);
            });
        }

        // Ordenar por fecha (más reciente primero)
        resultado.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

        return resultado;
    }

    // Establecer registros
    setRegistros(registros) {
        if (this.useFallback) {
            this.memoryStorage.registros = registros;
        } else {
            localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(registros));
        }
    }

    // Establecer favoritos
    setFavoritos(favoritos) {
        if (this.useFallback) {
            this.memoryStorage.favoritos = favoritos;
        } else {
            localStorage.setItem(STORAGE_KEYS.FAVORITOS, JSON.stringify(favoritos));
        }
    }

    // Establecer estadísticas
    setStatistics(estadisticas) {
        if (!this.useFallback) {
            localStorage.setItem(STORAGE_KEYS.ESTADISTICAS, JSON.stringify(estadisticas));
        }
    }

    // Validar datos de importación
    validateImportData(data) {
        return data && (
            Array.isArray(data.registros) || 
            data.configuracion || 
            Array.isArray(data.favoritos)
        );
    }

    // Notificar cambios en los datos
    notifyDataChange(eventType, data) {
        // Puedes implementar eventos personalizados aquí si es necesario
        console.log(`📢 Evento de datos: ${eventType}`, data);
        
        // Disparar evento personalizado
        const event = new CustomEvent('storage-changed', {
            detail: { type: eventType, data }
        });
        window.dispatchEvent(event);
    }

    // ============================================
    // LIMPIEZA Y MANTENIMIENTO
    // ============================================

    // Limpiar datos antiguos
    cleanupOldData(dias = 365) {
        try {
            const registros = this.getRegistros();
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - dias);
            
            const registrosActualizados = registros.filter(r => {
                const fechaRegistro = new Date(r.fechaCreacion);
                return fechaRegistro >= fechaLimite;
            });

            this.setRegistros(registrosActualizados);
            return registros.length - registrosActualizados.length;
        } catch (error) {
            console.error('❌ Error en limpieza de datos:', error);
            return 0;
        }
    }

    // Limpiar todos los datos
    clearAllData() {
        try {
            if (this.useFallback) {
                this.memoryStorage = {
                    registros: [],
                    configuracion: this.getDefaultConfig(),
                    favoritos: []
                };
            } else {
                localStorage.removeItem(STORAGE_KEYS.REGISTROS);
                localStorage.removeItem(STORAGE_KEYS.FAVORITOS);
                localStorage.removeItem(STORAGE_KEYS.ESTADISTICAS);
                this.initDefaultData();
            }
            return true;
        } catch (error) {
            console.error('❌ Error al limpiar datos:', error);
            return false;
        }
    }

    // Obtener información de almacenamiento
    getStorageInfo() {
        let size = 0;
        
        if (!this.useFallback) {
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    size += localStorage[key].length * 2; // UTF-16
                }
            }
        }

        return {
            usoFallback: this.useFallback,
            totalRegistros: this.getRegistros().length,
            totalFavoritos: this.getFavoritos().length,
            tamanioAproximado: size,
            fechaUltimaActualizacion: new Date().toISOString()
        };
    }
}

// ============================================
// FUNCIONES DE USUARIO PARA APP.JS
// ============================================

// Función para registrar aplicación (para usar desde app.js)
function registerApplication() {
    try {
        if (!window.currentCalculation) {
            throw new Error('Primero realice un cálculo');
        }

        const storageManager = window.storageManager || new StorageManager();
        
        const registro = {
            ...window.currentCalculation,
            fechaAplicacion: new Date().toISOString(),
            operador: document.getElementById('operador').value || 'Anónimo',
            equipo: document.getElementById('equipo').value || 'No especificado',
            observaciones: document.getElementById('observaciones').value || ''
        };

        const registroId = storageManager.saveRegistro(registro);
        
        if (registroId) {
            showAlert('✅ Aplicación registrada exitosamente', 'success');
            clearForm();
            updateStatistics();
            return registroId;
        } else {
            throw new Error('Error al guardar el registro');
        }
    } catch (error) {
        showAlert(`❌ ${error.message}`, 'danger');
        return null;
    }
}

// Función para mostrar historial
function showHistory() {
    try {
        const storageManager = window.storageManager || new StorageManager();
        const registros = storageManager.getRegistros();
        
        // Aquí implementarías la lógica para mostrar el historial
        // Por ejemplo, abrir un modal o cambiar de vista
        console.log('📜 Historial de aplicaciones:', registros);
        
        // Ejemplo básico: mostrar en consola
        if (registros.length === 0) {
            showAlert('No hay registros aún', 'info');
            return;
        }
        
        // Puedes implementar una interfaz más completa aquí
        displayHistoryTable(registros);
        
    } catch (error) {
        console.error('❌ Error al cargar historial:', error);
        showAlert('Error al cargar el historial', 'danger');
    }
}

// Función para cargar favoritos
function loadFavorites() {
    try {
        const storageManager = window.storageManager || new StorageManager();
        const favoritos = storageManager.getFavoritos();
        
        // Aquí implementarías la lógica para mostrar favoritos
        // Por ejemplo, en una sección especial de la interfaz
        console.log('⭐ Favoritos cargados:', favoritos);
        
        // Implementar actualización de UI con favoritos
        updateFavoritesUI(favoritos);
        
    } catch (error) {
        console.error('❌ Error al cargar favoritos:', error);
    }
}

// ============================================
// INICIALIZACIÓN GLOBAL
// ============================================

// Inicializar StorageManager cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    window.storageManager = new StorageManager();
    console.log('📦 StorageManager inicializado');
});

// Exportar para uso global
window.StorageManager = StorageManager;
window.registerApplication = registerApplication;
window.showHistory = showHistory;
window.loadFavorites = loadFavorites;

console.log('✨ Módulo de almacenamiento cargado');