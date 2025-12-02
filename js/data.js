// ============================================
// BASE DE DATOS DE PLAGUICIDAS (20 PRINCIPALES)
// ============================================

const PESTICIDES_DB = [
    {
        id: 1,
        nombre: "Imidacloprid",
        tipo: "INSECTICIDA",
        dosisBase: 0.175,
        unidad: "L/ha",
        carenciaBase: 15,
        toxicidad: "Alta",
        clase: "Neonicotinoide",
        lmr: 0.5,
        epiRequerido: ["guantes", "mascarilla", "overol"],
        compatibilidad: ["FUNGICIDAS", "HERBICIDAS"],
        restricciones: ["NO usar en floración", "Prohibido cerca de fuentes de agua"],
        usos: ["Pulgón", "Mosca blanca", "Trips"],
        cultivosPermitidos: [1, 3, 4, 6, 11, 14], // IDs de cultivos
        icono: "fas fa-bug"
    },
    {
        id: 2,
        nombre: "Mancozeb",
        tipo: "FUNGICIDA",
        dosisBase: 2.0,
        unidad: "kg/ha",
        carenciaBase: 7,
        toxicidad: "Media",
        clase: "Ditiocarbamato",
        lmr: 0.2,
        epiRequerido: ["guantes", "mascarilla"],
        compatibilidad: ["INSECTICIDAS", "ACARICIDAS"],
        restricciones: ["No mezclar con aceites", "Evitar temperaturas >30°C"],
        usos: ["Tizón tardío", "Antracnosis", "Mildiu"],
        cultivosPermitidos: [1, 3, 4, 6, 7, 8, 9, 10],
        icono: "fas fa-fungus"
    },
    {
        id: 3,
        nombre: "Lambda cihalotrin",
        tipo: "INSECTICIDA",
        dosisBase: 0.05,
        unidad: "L/ha",
        carenciaBase: 14,
        toxicidad: "Media",
        clase: "Piretroide",
        lmr: 0.1,
        epiRequerido: ["guantes", "mascarilla"],
        compatibilidad: ["FUNGICIDAS", "ACARICIDAS"],
        restricciones: ["Evitar aplicación con viento fuerte"],
        usos: ["Gusano ejército", "Palomilla", "Trips"],
        cultivosPermitidos: [1, 2, 3, 4, 5, 6, 7],
        icono: "fas fa-spider"
    },
    {
        id: 4,
        nombre: "Clorpirifos",
        tipo: "INSECTICIDA",
        dosisBase: 1.25,
        unidad: "L/ha",
        carenciaBase: 21,
        toxicidad: "Alta",
        clase: "Organofosforado",
        lmr: 0.05,
        epiRequerido: ["guantes", "mascarilla", "overol", "botas"],
        compatibilidad: ["FUNGICIDAS"],
        restricciones: ["Prohibido en hortalizas", "No usar en floración"],
        usos: ["Gusano cogollero", "Gusano elotero", "Chapulín"],
        cultivosPermitidos: [2, 3, 5], // Solo granos
        icono: "fas fa-worm"
    },
    {
        id: 5,
        nombre: "Abamectina",
        tipo: "INSECTICIDA",
        dosisBase: 0.5,
        unidad: "L/ha",
        carenciaBase: 7,
        toxicidad: "Media",
        clase: "Avermectina",
        lmr: 0.01,
        epiRequerido: ["guantes", "mascarilla"],
        compatibilidad: ["FUNGICIDAS", "ACARICIDAS"],
        restricciones: ["Evitar temperaturas >35°C"],
        usos: ["Ácaros", "Minadores", "Trips"],
        cultivosPermitidos: [1, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        icono: "fas fa-mite"
    },
    {
        id: 6,
        nombre: "Spinosad",
        tipo: "INSECTICIDA",
        dosisBase: 0.3,
        unidad: "L/ha",
        carenciaBase: 3,
        toxicidad: "Baja",
        clase: "Espinosino",
        lmr: 0.02,
        epiRequerido: ["guantes"],
        compatibilidad: ["FUNGICIDAS", "HERBICIDAS"],
        restricciones: ["Biológico - usar en horas frescas"],
        usos: ["Gusano soldado", "Palomilla", "Trips"],
        cultivosPermitidos: [1, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        icono: "fas fa-leaf"
    },
    {
        id: 7,
        nombre: "Oxicloruro de cobre",
        tipo: "FUNGICIDA",
        dosisBase: 3.0,
        unidad: "kg/ha",
        carenciaBase: 7,
        toxicidad: "Baja",
        clase: "Cúprico",
        lmr: 5.0,
        epiRequerido: ["guantes", "mascarilla"],
        compatibilidad: ["INSECTICIDAS"],
        restricciones: ["No mezclar con fosfitos"],
        usos: ["Bacteriosis", "Antracnosis", "Mildiu"],
        cultivosPermitidos: [1, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        icono: "fas fa-shield-virus"
    },
    {
        id: 8,
        nombre: "Azoxystrobin",
        tipo: "FUNGICIDA",
        dosisBase: 0.5,
        unidad: "L/ha",
        carenciaBase: 14,
        toxicidad: "Baja",
        clase: "Estrobilurina",
        lmr: 0.2,
        epiRequerido: ["guantes"],
        compatibilidad: ["INSECTICIDAS", "HERBICIDAS"],
        restricciones: ["Alternar con otros fungicidas"],
        usos: ["Roya", "Mancha foliar", "Tizón"],
        cultivosPermitidos: [1, 2, 3, 4, 5, 6, 11, 13],
        icono: "fas fa-virus-slash"
    },
    {
        id: 9,
        nombre: "Tebuconazol",
        tipo: "FUNGICIDA",
        dosisBase: 0.75,
        unidad: "L/ha",
        carenciaBase: 21,
        toxicidad: "Media",
        clase: "Triazol",
        lmr: 0.05,
        epiRequerido: ["guantes", "mascarilla"],
        compatibilidad: ["INSECTICIDAS"],
        restricciones: ["No usar en etapas tempranas"],
        usos: ["Roya", "Oídio", "Fusarium"],
        cultivosPermitidos: [1, 2, 3, 4, 5, 6, 11, 13],
        icono: "fas fa-prescription-bottle"
    },
    {
        id: 10,
        nombre: "Glifosato",
        tipo: "HERBICIDA",
        dosisBase: 3.0,
        unidad: "L/ha",
        carenciaBase: 7,
        toxicidad: "Baja",
        clase: "Glifosato",
        lmr: 0.1,
        epiRequerido: ["guantes", "mascarilla"],
        compatibilidad: ["INSECTICIDAS", "FUNGICIDAS"],
        restricciones: ["Siempre con surfactante", "No aplicar con viento"],
        usos: ["Malezas anuales", "Malezas perennes"],
        cultivosPermitidos: [2, 3, 4, 5], // Solo granos pre-siembra
        icono: "fas fa-seedling"
    },
    {
        id: 11,
        nombre: "2,4-D",
        tipo: "HERBICIDA",
        dosisBase: 1.5,
        unidad: "L/ha",
        carenciaBase: 30,
        toxicidad: "Media",
        clase: "Fenoxi",
        lmr: 0.05,
        epiRequerido: ["guantes", "mascarilla"],
        compatibilidad: ["INSECTICIDAS"],
        restricciones: ["Solo post-emergencia temprana"],
        usos: ["Malezas hoja ancha"],
        cultivosPermitidos: [2, 3, 5], // Cereales
        icono: "fas fa-tree"
    },
    {
        id: 12,
        nombre: "Atrazina",
        tipo: "HERBICIDA",
        dosisBase: 2.0,
        unidad: "L/ha",
        carenciaBase: 90,
        toxicidad: "Alta",
        clase: "Triazina",
        lmr: 0.1,
        epiRequerido: ["guantes", "mascarilla", "overol"],
        compatibilidad: ["INSECTICIDAS"],
        restricciones: ["Solo en maíz", "No usar cerca de agua"],
        usos: ["Malezas pre-emergencia"],
        cultivosPermitidos: [3], // Solo maíz
        icono: "fas fa-ban"
    },
    {
        id: 13,
        nombre: "Paraquat",
        tipo: "HERBICIDA",
        dosisBase: 2.0,
        unidad: "L/ha",
        carenciaBase: 7,
        toxicidad: "Alta",
        clase: "Bipiridilio",
        lmr: 0.01,
        epiRequerido: ["guantes", "mascarilla", "overol", "botas"],
        compatibilidad: [],
        restricciones: ["Solo personal certificado", "Extrema precaución"],
        usos: ["Desecante", "Control rápido"],
        cultivosPermitidos: [2, 3, 4, 5], // Granos pre-siembra
        icono: "fas fa-skull-crossbones"
    },
    {
        id: 14,
        nombre: "Clethodim",
        tipo: "HERBICIDA",
        dosisBase: 0.75,
        unidad: "L/ha",
        carenciaBase: 30,
        toxicidad: "Media",
        clase: "Ciclohexanodiona",
        lmr: 0.05,
        epiRequerido: ["guantes", "mascarilla"],
        compatibilidad: ["FUNGICIDAS"],
        restricciones: ["Específico para gramíneas"],
        usos: ["Gramíneas en hoja ancha"],
        cultivosPermitidos: [1, 4, 6, 7, 8, 9, 10], // Hortalizas
        icono: "fas fa-grass"
    },
    {
        id: 15,
        nombre: "Hexitiazox",
        tipo: "ACARICIDA",
        dosisBase: 0.3,
        unidad: "L/ha",
        carenciaBase: 14,
        toxicidad: "Baja",
        clase: "Tiazolidinona",
        lmr: 0.5,
        epiRequerido: ["guantes"],
        compatibilidad: ["FUNGICIDAS"],
        restricciones: ["Específico para araña roja"],
        usos: ["Araña roja", "Tetranychus"],
        cultivosPermitidos: [11, 12, 13, 14], // Frutales
        icono: "fas fa-spider"
    },
    {
        id: 16,
        nombre: "Spirodiclofen",
        tipo: "ACARICIDA",
        dosisBase: 0.45,
        unidad: "L/ha",
        carenciaBase: 21,
        toxicidad: "Media",
        clase: "Tetrónico",
        lmr: 0.2,
        epiRequerido: ["guantes", "mascarilla"],
        compatibilidad: ["FUNGICIDAS"],
        restricciones: ["Rotar con otros acaricidas"],
        usos: ["Ácaros amplio espectro"],
        cultivosPermitidos: [11, 12, 13, 14],
        icono: "fas fa-bug"
    },
    {
        id: 17,
        nombre: "Azufre",
        tipo: "ACARICIDA",
        dosisBase: 4.0,
        unidad: "kg/ha",
        carenciaBase: 1,
        toxicidad: "Baja",
        clase: "Mineral",
        lmr: 50.0,
        epiRequerido: ["mascarilla"],
        compatibilidad: ["INSECTICIDAS"],
        restricciones: ["No aplicar con temperaturas >30°C"],
        usos: ["Oídio", "Ácaros", "Cochinilla"],
        cultivosPermitidos: [1, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        icono: "fas fa-fire"
    },
    {
        id: 18,
        nombre: "Oxamil",
        tipo: "NEMATICIDA",
        dosisBase: 15.0,
        unidad: "L/ha",
        carenciaBase: 60,
        toxicidad: "Alta",
        clase: "Oxima",
        lmr: 0.01,
        epiRequerido: ["guantes", "mascarilla", "overol", "botas"],
        compatibilidad: [],
        restricciones: ["Aplicación al suelo", "Larga carencia"],
        usos: ["Nematodos del suelo"],
        cultivosPermitidos: [1, 6, 7, 8, 9, 10, 11, 14],
        icono: "fas fa-microscope"
    },
    {
        id: 19,
        nombre: "Fenamifos",
        tipo: "NEMATICIDA",
        dosisBase: 20.0,
        unidad: "kg/ha",
        carenciaBase: 120,
        toxicidad: "Alta",
        clase: "Organofosforado",
        lmr: 0.01,
        epiRequerido: ["guantes", "mascarilla", "overol", "botas"],
        compatibilidad: [],
        restricciones: ["Granulado - aplicar al suelo"],
        usos: ["Nematodos + insectos suelo"],
        cultivosPermitidos: [11, 12, 13, 14], // Frutales
        icono: "fas fa-vial"
    },
    {
        id: 20,
        nombre: "Metalaxil",
        tipo: "FUNGICIDA",
        dosisBase: 1.5,
        unidad: "L/ha",
        carenciaBase: 14,
        toxicidad: "Media",
        clase: "Acetamida",
        lmr: 0.05,
        epiRequerido: ["guantes", "mascarilla"],
        compatibilidad: ["INSECTICIDAS"],
        restricciones: ["Específico para mildiu"],
        usos: ["Mildiu", "Phytophthora"],
        cultivosPermitidos: [1, 6, 11, 14], // Tomate, Papa, Viña
        icono: "fas fa-virus"
    }
];

// ============================================
// BASE DE DATOS DE CULTIVOS
// ============================================

const CROPS_DB = [
    {
        id: 1,
        nombre: "Tomate",
        familia: "Solanaceae",
        factorDosis: 1.2,
        cicloDias: 120,
        tipo: "Hortaliza",
        icono: "fas fa-apple-alt",
        plagasComunes: [1, 3, 5, 6], // IDs de plaguicidas recomendados
        restricciones: ["NO Atrazina", "NO Clorpirifos en floración"]
    },
    {
        id: 2,
        nombre: "Trigo",
        familia: "Poaceae",
        factorDosis: 1.0,
        cicloDias: 180,
        tipo: "Grano",
        icono: "fas fa-wheat",
        plagasComunes: [3, 8, 9, 10, 11],
        restricciones: []
    },
    {
        id: 3,
        nombre: "Maíz",
        familia: "Poaceae",
        factorDosis: 1.0,
        cicloDias: 120,
        tipo: "Grano",
        icono: "fas fa-corn",
        plagasComunes: [1, 3, 4, 8, 9, 10, 11, 12],
        restricciones: ["Atrazina solo en maíz"]
    },
    {
        id: 4,
        nombre: "Soya",
        familia: "Fabaceae",
        factorDosis: 1.1,
        cicloDias: 110,
        tipo: "Grano",
        icono: "fas fa-seedling",
        plagasComunes: [1, 3, 5, 6, 8, 9, 10],
        restricciones: []
    },
    {
        id: 5,
        nombre: "Arroz",
        familia: "Poaceae",
        factorDosis: 1.2,
        cicloDias: 130,
        tipo: "Grano",
        icono: "fas fa-rice",
        plagasComunes: [1, 3, 4, 10, 13],
        restricciones: ["Cuidado con herbicidas en etapas tempranas"]
    },
    {
        id: 6,
        nombre: "Papa",
        familia: "Solanaceae",
        factorDosis: 1.2,
        cicloDias: 100,
        tipo: "Tubérculo",
        icono: "fas fa-potato",
        plagasComunes: [2, 3, 5, 7, 9, 20],
        restricciones: ["Prioridad fungicidas para tizón"]
    },
    {
        id: 7,
        nombre: "Cebolla",
        familia: "Amaryllidaceae",
        factorDosis: 1.1,
        cicloDias: 120,
        tipo: "Hortaliza",
        icono: "fas fa-onion",
        plagasComunes: [2, 5, 6, 7, 17],
        restricciones: ["Solo baja toxicidad"]
    },
    {
        id: 8,
        nombre: "Zanahoria",
        familia: "Apiaceae",
        factorDosis: 1.2,
        cicloDias: 80,
        tipo: "Hortaliza",
        icono: "fas fa-carrot",
        plagasComunes: [5, 6, 7, 17],
        restricciones: ["Solo baja toxicidad"]
    },
    {
        id: 9,
        nombre: "Lechuga",
        familia: "Asteraceae",
        factorDosis: 1.4,
        cicloDias: 60,
        tipo: "Hortaliza",
        icono: "fas fa-leaf",
        plagasComunes: [5, 6, 7, 17],
        restricciones: ["SOLO productos baja toxicidad"]
    },
    {
        id: 10,
        nombre: "Brócoli",
        familia: "Brassicaceae",
        factorDosis: 1.2,
        cicloDias: 75,
        tipo: "Hortaliza",
        icono: "fas fa-broccoli",
        plagasComunes: [1, 3, 5, 6, 7],
        restricciones: ["Cuidado con residuos"]
    },
    {
        id: 11,
        nombre: "Naranjo",
        familia: "Rutaceae",
        factorDosis: 0.7,
        cicloDias: 365,
        tipo: "Frutal",
        icono: "fas fa-orange",
        plagasComunes: [1, 5, 7, 15, 16, 17, 18],
        restricciones: ["Carencias largas (30+ días)"]
    },
    {
        id: 12,
        nombre: "Aguacate",
        familia: "Lauraceae",
        factorDosis: 0.6,
        cicloDias: 365,
        tipo: "Frutal",
        icono: "fas fa-avocado",
        plagasComunes: [5, 7, 15, 16, 17, 19],
        restricciones: ["Ácaros principal problema"]
    },
    {
        id: 13,
        nombre: "Café",
        familia: "Rubiaceae",
        factorDosis: 0.8,
        cicloDias: 365,
        tipo: "Frutal",
        icono: "fas fa-coffee",
        plagasComunes: [1, 7, 8, 9, 17, 19],
        restricciones: ["Roya principal preocupación"]
    },
    {
        id: 14,
        nombre: "Plátano",
        familia: "Musaceae",
        factorDosis: 1.0,
        cicloDias: 365,
        tipo: "Frutal",
        icono: "fas fa-banana",
        plagasComunes: [1, 7, 18, 20],
        restricciones: ["Nematodos común"]
    }
];

// ============================================
// OPERACIONES DE CÁLCULO
// ============================================

const CALCULATION_OPERATIONS = {
    // Factores ambientales
    temperatureFactors: {
        "<10°C": 1.3,
        "10-15°C": 1.2,
        "15-20°C": 1.1,
        "20-25°C": 1.0,
        "25-30°C": 0.9,
        "30-35°C": 0.8,
        ">35°C": 0.6
    },
    
    humidityFactors: {
        "<40%": 1.2,
        "40-60%": 1.1,
        "60-80%": 1.0,
        "80-85%": 0.9,
        ">85%": 0.8
    },
    
    windFactors: {
        "<5 km/h": 1.0,
        "5-10 km/h": 0.9,
        "10-15 km/h": 0.7,
        ">15 km/h": 0.0
    },
    
    // Factores por tipo de cultivo
    cropTypeFactors: {
        "Hortaliza": 1.2,
        "Grano": 1.0,
        "Frutal": 1.5,
        "Tubérculo": 1.3
    },
    
    // Factores por toxicidad (carencia mínima)
    toxicityMinDays: {
        "Alta": 21,
        "Media": 14,
        "Baja": 7
    },
    
    // Factor por tipo de plaguicida
    pesticideTypeFactors: {
        "INSECTICIDA": 1.0,
        "FUNGICIDA": 1.0,
        "HERBICIDA": 1.0,
        "ACARICIDA": 1.0,
        "NEMATICIDA": 1.0
    }
};

// ============================================
// FUNCIONES DE AUTOCOMPLETADO
// ============================================

class AutoCompleteManager {
    constructor() {
        this.cache = {
            pesticides: {},
            crops: {}
        };
    }
    
    // Autocompletado para plaguicidas por tipo
    getPesticidesByType(type) {
        if (this.cache.pesticides[type]) {
            return this.cache.pesticides[type];
        }
        
        const filtered = PESTICIDES_DB.filter(p => p.tipo === type);
        this.cache.pesticides[type] = filtered;
        return filtered;
    }
    
    // Autocompletado para plaguicidas por cultivo
    getPesticidesByCrop(cropId) {
        const crop = CROPS_DB.find(c => c.id === cropId);
        if (!crop) return [];
        
        const cacheKey = `crop_${cropId}`;
        if (this.cache.pesticides[cacheKey]) {
            return this.cache.pesticides[cacheKey];
        }
        
        // Filtrar plaguicidas permitidos para este cultivo
        const filtered = PESTICIDES_DB.filter(p => 
            p.cultivosPermitidos.includes(cropId)
        );
        
        // Ordenar por toxicidad (baja primero)
        filtered.sort((a, b) => {
            const toxicityOrder = { "Baja": 1, "Media": 2, "Alta": 3 };
            return toxicityOrder[a.toxicidad] - toxicityOrder[b.toxicidad];
        });
        
        this.cache.pesticides[cacheKey] = filtered;
        return filtered;
    }
    
    // Autocompletado para cultivos por tipo
    getCropsByType(type) {
        if (this.cache.crops[type]) {
            return this.cache.crops[type];
        }
        
        const filtered = CROPS_DB.filter(c => c.tipo === type);
        this.cache.crops[type] = filtered;
        return filtered;
    }
    
    // Búsqueda inteligente de plaguicidas
    searchPesticides(query) {
        const lowerQuery = query.toLowerCase();
        return PESTICIDES_DB.filter(p => 
            p.nombre.toLowerCase().includes(lowerQuery) ||
            p.tipo.toLowerCase().includes(lowerQuery) ||
            p.clase.toLowerCase().includes(lowerQuery) ||
            p.usos.some(uso => uso.toLowerCase().includes(lowerQuery))
        ).slice(0, 10); // Limitar a 10 resultados
    }
    
    // Búsqueda inteligente de cultivos
    searchCrops(query) {
        const lowerQuery = query.toLowerCase();
        return CROPS_DB.filter(c => 
            c.nombre.toLowerCase().includes(lowerQuery) ||
            c.tipo.toLowerCase().includes(lowerQuery) ||
            c.familia.toLowerCase().includes(lowerQuery)
        ).slice(0, 10);
    }
    
    // Obtener recomendaciones basadas en cultivo seleccionado
    getRecommendations(cropId, problem) {
        const crop = CROPS_DB.find(c => c.id === cropId);
        if (!crop) return [];
        
        // Si hay un problema específico, filtrar por usos
        if (problem) {
            const lowerProblem = problem.toLowerCase();
            return PESTICIDES_DB.filter(p => 
                p.cultivosPermitidos.includes(cropId) &&
                p.usos.some(uso => uso.toLowerCase().includes(lowerProblem))
            );
        }
        
        // Si no hay problema, devolver plaguicidas comunes para el cultivo
        const commonPesticideIds = crop.plagasComunes || [];
        return PESTICIDES_DB.filter(p => 
            commonPesticideIds.includes(p.id)
        );
    }
}

// ============================================
// ALMACENAMIENTO LOCAL
// ============================================

const STORAGE_KEYS = {
    REGISTROS: 'agro_registros',
    CONFIG: 'agro_config',
    FAVORITOS: 'agro_favoritos',
    ESTADISTICAS: 'agro_estadisticas'  // Agregar esta línea
};

let registros = JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTROS)) || [];
let configuracion = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG)) || {
    unidadPredeterminada: 'ha',
    ajusteAutomatico: true,
    mostrarAdvertencias: true
};
let favoritos = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITOS)) || [];

// Exportar para uso global
window.PESTICIDES_DB = PESTICIDES_DB;
window.CROPS_DB = CROPS_DB;
window.CALCULATION_OPERATIONS = CALCULATION_OPERATIONS;
window.AutoCompleteManager = AutoCompleteManager;
window.STORAGE_KEYS = STORAGE_KEYS;
window.registros = registros;
window.configuracion = configuracion;
window.favoritos = favoritos;