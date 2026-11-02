// Datos simulados complementarios (no vienen en data.js). Solo enriquecen el detalle; no alteran los datos base.
export const OWNERS = ['Ana López', 'Carlos Ruiz', 'Laura Díaz', 'Mateo Gil'];
export const STAGES = ['Contacto', 'Calificación', 'Propuesta', 'Negociación'];
export const CHANNELS = ['Outbound', 'Referidos', 'Inbound'];
export const ROLE = {
  'Ana López': 'Ejecutiva comercial', 'Carlos Ruiz': 'Ejecutivo comercial',
  'Laura Díaz': 'Ejecutiva comercial', 'Mateo Gil': 'Ejecutivo comercial',
};

export const COMPANY = {
  'Grupo Andino': { last: 'Llamada', contact: 'María Gómez', desc: 'Calificación de necesidades para una plataforma de gestión de flotas.' },
  'Clínica Horizonte': { last: 'Correo', contact: 'Felipe Rojas', desc: 'Propuesta de servicio integral para tres sedes de la clínica.' },
  'Alimentos del Norte': { last: 'Reunión', contact: 'Sandra Peña', desc: 'Negociación de contrato anual para suministro de alimentos.' },
  'Hotel Central': { last: 'Llamada', contact: 'Julián Cortés', desc: 'Primer contacto tras una solicitud recibida por el formulario web.' },
  'Logística Pacífico': { last: 'Correo', contact: 'Andrés Mejía', desc: 'Propuesta para optimizar rutas de distribución en la costa.' },
  'Textiles Aurora': { last: 'Reunión', contact: 'Paula Ortiz', desc: 'Evaluando volumen de pedidos y requisitos de integración.' },
  'Mercado Verde': { last: 'Llamada', contact: 'Camilo Vargas', desc: 'Contacto inicial por recomendación de un cliente actual.' },
  'Industrias Atlas': { last: 'Correo', contact: 'Diana Salazar', desc: 'Negociación de términos para un contrato multianual de planta.' },
};

const LAST_TITLE = { Llamada: 'Llamada realizada', Correo: 'Correo enviado', Reunión: 'Reunión con el cliente' };
export const baseActivity = (last, owner) => [
  { t: LAST_TITLE[last] || 'Contacto registrado', s: 'Se presentó la propuesta final.', w: 'hace 2 días', o: owner },
  { t: 'Correo enviado', s: 'Envío de términos y condiciones.', w: 'hace 5 días', o: owner },
  { t: 'Llamada', s: 'Seguimiento inicial.', w: 'hace 1 semana', o: owner },
];
