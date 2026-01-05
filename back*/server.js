// web_motos/backend/server.js - VERSIÓN CORREGIDA Y SIMPLIFICADA

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456xd',
    database: 'web_motos'
});

// Conectar
db.connect((error) => {
    if (error) {
        console.error('❌ Error MySQL:', error.message);
    } else {
        console.log('✅ Conectado a MySQL - web_motos');
    }
});

// ==================== FUNCIONES AUXILIARES ====================

// Función para procesar campos JSON de MySQL
const procesarMoto = (moto) => {
    // Función segura para parsear JSON
    const parsearSiEsNecesario = (dato) => {
        if (!dato) return null;
        
        // Si ya es objeto, devolverlo
        if (typeof dato === 'object' && dato !== null) {
            return dato;
        }
        
        // Si es string, intentar parsear
        if (typeof dato === 'string') {
            // Verificar si parece JSON
            if (dato.trim().startsWith('{') || dato.trim().startsWith('[')) {
                try {
                    return JSON.parse(dato);
                } catch (e) {
                    console.warn(`No se pudo parsear: ${dato.substring(0, 30)}...`);
                    return null;
                }
            }
        }
        
        return dato;
    };
    
    return {
        id: moto.id,
        marca: moto.marca,
        modelo: moto.modelo,
        ano: moto.ano,
        precio: parseFloat(moto.precio),
        descuento: parseFloat(moto.descuento),
        imagen: moto.imagen,
        imagenes_galeria: parsearSiEsNecesario(moto.imagenes_galeria) || [], 
        categoria: moto.categoria,
        destacado: Boolean(moto.destacado),
        descripcion: moto.descripcion,
        especificaciones: parsearSiEsNecesario(moto.especificaciones) || {},
        colores: parsearSiEsNecesario(moto.colores) || [],
        caracteristicas: parsearSiEsNecesario(moto.caracteristicas) || []
    };
};

// ==================== RUTAS API ====================

// 1. Obtener TODAS las motos
app.get('/api/motos', (req, res) => {
    console.log('📡 GET /api/motos');
    
    const sql = 'SELECT * FROM motos ORDER BY id';
    
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error MySQL:', error.message);
            return res.status(500).json({ error: error.message });
        }
        
        const motos = results.map(procesarMoto);
        console.log(`✅ Enviando ${motos.length} motos`);
        res.json(motos);
    });
});

// 2. Obtener motos DESTACADAS
app.get('/api/motos/destacadas', (req, res) => {
    console.log('📡 GET /api/motos/destacadas');
    
    const sql = 'SELECT * FROM motos WHERE destacado = TRUE ORDER BY id';
    
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error MySQL:', error.message);
            return res.status(500).json({ error: error.message });
        }
        
        const motos = results.map(procesarMoto);
        console.log(`✅ Enviando ${motos.length} motos destacadas`);
        res.json(motos);
    });
});

// 3. Obtener por CATEGORÍA
app.get('/api/motos/categoria/:categoria', (req, res) => {
    const categoria = req.params.categoria;
    console.log(`📡 GET /api/motos/categoria/${categoria}`);
    
    const sql = 'SELECT * FROM motos WHERE categoria = ? ORDER BY id';
    
    db.query(sql, [categoria], (error, results) => {
        if (error) {
            console.error('Error MySQL:', error.message);
            return res.status(500).json({ error: error.message });
        }
        
        const motos = results.map(procesarMoto);
        console.log(`✅ Enviando ${motos.length} motos de categoría ${categoria}`);
        res.json(motos);
    });
});

// 4. Obtener todas las CATEGORÍAS
app.get('/api/categorias', (req, res) => {
    console.log('📡 GET /api/categorias');
    
    const sql = 'SELECT DISTINCT categoria FROM motos ORDER BY categoria';
    
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error MySQL:', error.message);
            return res.status(500).json({ error: error.message });
        }
        
        const categorias = results.map(r => r.categoria);
        console.log(`✅ Enviando ${categorias.length} categorías`);
        res.json(categorias);
    });
});

// 5. Obtener moto por ID
app.get('/api/motos/:id', (req, res) => {
    const id = req.params.id;
    console.log(`📡 GET /api/motos/${id}`);
    
    const sql = 'SELECT * FROM motos WHERE id = ?';
    
    db.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Error MySQL:', error.message);
            return res.status(500).json({ error: error.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Moto no encontrada' });
        }
        
        const moto = procesarMoto(results[0]);
        console.log(`✅ Enviando moto ${moto.marca} ${moto.modelo}`);
        res.json(moto);
    });
});

// 6. Página principal de API
app.get('/', (req, res) => {
    res.json({
        mensaje: '🏍️ API Tienda de Motos',
        version: '1.0',
        base_datos: 'web_motos',
        rutas: [
            { metodo: 'GET', ruta: '/api/motos', descripcion: 'Todas las motos' },
            { metodo: 'GET', ruta: '/api/motos/destacadas', descripcion: 'Motos destacadas' },
            { metodo: 'GET', ruta: '/api/categorias', descripcion: 'Todas las categorías' },
            { metodo: 'GET', ruta: '/api/motos/categoria/:nombre', descripcion: 'Motos por categoría' },
            { metodo: 'GET', ruta: '/api/motos/:id', descripcion: 'Moto por ID' }
        ]
    });
});

// 7. Endpoint de prueba
app.get('/api/test', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        total_motos: 12
    });
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 API TIENDA DE MOTOS');
    console.log('='.repeat(50));
    console.log(`📡 Servidor: http://localhost:${PORT}`);
    console.log('\n✨ Endpoints listos:');
    console.log(`   http://localhost:${PORT}/api/motos`);
    console.log(`   http://localhost:${PORT}/api/motos/destacadas`);
    console.log(`   http://localhost:${PORT}/api/categorias`);
    console.log('='.repeat(50) + '\n');
});