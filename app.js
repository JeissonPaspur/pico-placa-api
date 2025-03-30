const express = require('express');
const app = express();
app.use(express.json());

const DIGITOS = ["0 y 1", "2 y 3", "4 y 5", "6 y 7", "8 y 9"];

// Función para calcular la semana ISO
function getISOWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
}

// Lógica para Pasto
function getPastoRestriction(date) {
    // Asegurar fecha en UTC
    const referenceDate = new Date(Date.UTC(2024, 0, 1)); // 1 de enero 2024, UTC
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  
    const diffTime = utcDate - referenceDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    
    const baseIndex = diffWeeks % 5;
    const dayOfWeek = utcDate.getUTCDay(); // Día de la semana en UTC
  
    if (dayOfWeek === 0 || dayOfWeek === 6) return null;
    const dayIndex = dayOfWeek - 1;
    const restrictionIndex = (baseIndex + dayIndex) % 5;
  
    return DIGITOS[restrictionIndex];
  }

// Lógica para Popayán
function getPopayanRestriction(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const semester = month <= 6 ? 1 : 2;
  const deltaYears = year - 2023; // Ajusta según el año base
  let baseIndex = (deltaYears * 2 + (semester - 1)) % 5;
  if (baseIndex < 0) baseIndex += 5;
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return null; // Fin de semana
  const dayIndex = dayOfWeek - 1;
  const restrictionIndex = (baseIndex + dayIndex) % 5;
  return DIGITOS[restrictionIndex];
}

// Endpoint 1: Consulta con fecha (corregido)
app.post('/pico-placa/consulta', (req, res) => {
    const { ciudad, fecha } = req.body;
    
  
    // Validaciones
    if (!ciudad || !fecha) {
      return res.status(400).json({ error: "Faltan campos 'ciudad' o 'fecha'" });
    }
    if (ciudad !== 'Pasto' && ciudad !== 'Popayán') {
      return res.status(400).json({ error: "Ciudad no válida" });
    }
  
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: "Fecha no válida" });
    }
  
    // Calcular dígitos
    let digitos;
    let explicacion;
    if (ciudad === 'Pasto') {
      digitos = getPastoRestriction(date);
      
      // Nueva lógica para la explicación
      const referenceDate = new Date('2024-01-01');
      const diffTime = date - referenceDate;
      const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
      const baseIndex = diffWeeks % 5;
      
      explicacion = `Rotación semanal: Semana ${diffWeeks + 1} desde 2024, índice base ${baseIndex}.`;
    } else {
      // Lógica Popayán (sin cambios)
      digitos = getPopayanRestriction(date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const semester = month <= 6 ? 1 : 2;
      const deltaYears = year - 2023;
      const baseIndex = (deltaYears * 2 + (semester - 1)) % 5;
      explicacion = `Rotación semestral: Índice base ${baseIndex} para el ${semester === 1 ? 'primer' : 'segundo'} semestre del año.`;
    }
  
    res.json({
      ciudad,
      fecha: fecha,
      diaSemana: date.toLocaleDateString('es-ES', { weekday: 'long' }),
      digitosRestringidos: digitos || "No aplica (fin de semana)",
      explicacion
    });
  });

// Endpoint 2: Consulta hoy (corregido)
app.post('/pico-placa/hoy', (req, res) => {
    const { ciudad } = req.body;
    const date = new Date();
  
    // Validaciones
    if (!ciudad) {
      return res.status(400).json({ error: "Falta el campo 'ciudad'" });
    }
    if (ciudad !== 'Pasto' && ciudad !== 'Popayán') {
      return res.status(400).json({ error: "Ciudad no válida" });
    }
  
    // Calcular dígitos
    let digitos;
    let explicacion;
    if (ciudad === 'Pasto') {
      digitos = getPastoRestriction(date);
      
      // Nueva lógica para la explicación
      const referenceDate = new Date('2024-01-01');
      const diffTime = date - referenceDate;
      const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
      const baseIndex = diffWeeks % 5;
      
      explicacion = `Rotación semanal: Semana ${diffWeeks + 1} desde 2024, índice base ${baseIndex}.`;
    } else {
      // Lógica Popayán (sin cambios)
      digitos = getPopayanRestriction(date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const semester = month <= 6 ? 1 : 2;
      const deltaYears = year - 2023;
      const baseIndex = (deltaYears * 2 + (semester - 1)) % 5;
      explicacion = `Rotación semestral: Índice base ${baseIndex} para el ${semester === 1 ? 'primer' : 'segundo'} semestre del año.`;
    }
  
    res.json({
      ciudad,
      fecha: date.toISOString().split('T')[0],
      diaSemana: date.toLocaleDateString('es-ES', { weekday: 'long' }),
      digitosRestringidos: digitos || "No aplica (fin de semana)",
      explicacion
    });
  });

// Iniciar servidor
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});