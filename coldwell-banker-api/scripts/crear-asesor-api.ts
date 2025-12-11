
// Usamos fetch nativo (Node 18+)
// No se necesita importar nada

async function crearAsesor() {
  const url = 'https://api-inmobiliaria-production.up.railway.app/auth/register';
  
  const usuario = {
    nombre: 'Asesor Prueba',
    email: 'asesor@coldwellbanker.com.ar',
    password: 'asesor123',
    rol: 'ASESOR'
  };

  console.log('🚀 Creando usuario asesor en:', url);
  console.log('Detalles:', usuario);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usuario)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ ÉXITO! Usuario creado:');
      console.log(data);
    } else {
      console.error('❌ ERROR al crear usuario:');
      console.log('Status:', response.status);
      console.log('Error:', data);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
}

crearAsesor();
