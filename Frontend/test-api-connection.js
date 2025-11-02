// Script de prueba para verificar la conexión del API desde el frontend
// Ejecutar en la consola del navegador

async function testApiConnection() {
    const apiUrl = 'http://localhost:7003/api';
    
    try {
        // 1. Probar login
        console.log('🔐 Probando login...');
        const loginResponse = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userCode: 'admin',
                password: 'admin123'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }
        
        const loginData = await loginResponse.json();
        console.log('✅ Login exitoso:', loginData);
        
        // 2. Probar endpoint de machine-programs
        console.log('📊 Probando endpoint de machine-programs...');
        const programsResponse = await fetch(`${apiUrl}/machine-programs`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!programsResponse.ok) {
            throw new Error(`Machine programs failed: ${programsResponse.status}`);
        }
        
        const programsData = await programsResponse.json();
        console.log('✅ Machine programs exitoso:', programsData);
        console.log(`📈 Total de programas: ${programsData.data?.length || 0}`);
        
        // 3. Verificar datos por máquina
        if (programsData.data && programsData.data.length > 0) {
            const machineNumbers = [...new Set(programsData.data.map(p => p.machineNumber))];
            console.log('🏭 Máquinas con datos:', machineNumbers);
            
            machineNumbers.forEach(machineNum => {
                const machinePrograms = programsData.data.filter(p => p.machineNumber === machineNum);
                console.log(`   Máquina ${machineNum}: ${machinePrograms.length} programas`);
            });
        }
        
        return {
            success: true,
            token: loginData.token,
            programs: programsData.data
        };
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Ejecutar la prueba
console.log('🚀 Iniciando prueba de conexión API...');
testApiConnection().then(result => {
    if (result.success) {
        console.log('🎉 Todas las pruebas pasaron exitosamente');
    } else {
        console.log('💥 Falló la prueba:', result.error);
    }
});