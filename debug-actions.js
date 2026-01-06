// Script de diagnóstico para el problema de acciones en el módulo de máquinas
// Ejecutar en la consola del navegador cuando esté en la página de máquinas

console.log('🔍 DIAGNÓSTICO DE ACCIONES - MÓDULO DE MÁQUINAS');
console.log('================================================');

// 1. Verificar si Angular está cargado
if (typeof ng !== 'undefined') {
    console.log('✅ Angular DevTools disponible');
    
    // 2. Obtener el componente de máquinas
    const machinesComponent = ng.getComponent(document.querySelector('app-machines'));
    if (machinesComponent) {
        console.log('✅ Componente de máquinas encontrado');
        console.log('📊 Estado del componente:', {
            loading: machinesComponent.loading(),
            selectedMachine: machinesComponent.selectedMachineNumber(),
            programsCount: machinesComponent.programs().length,
            selectedPrograms: machinesComponent.selectedMachinePrograms().length
        });
        
        // 3. Verificar métodos de acción
        console.log('🔧 Métodos disponibles:');
        console.log('- changeStatus:', typeof machinesComponent.changeStatus);
        console.log('- suspendProgram:', typeof machinesComponent.suspendProgram);
        console.log('- printFF459:', typeof machinesComponent.printFF459);
        
        // 4. Verificar autenticación
        const authService = machinesComponent.authService;
        if (authService) {
            console.log('🔐 Estado de autenticación:');
            console.log('- isLoggedIn:', authService.isLoggedIn());
            console.log('- currentUser:', authService.getCurrentUser());
            console.log('- token exists:', !!authService.getToken());
        }
        
        // 5. Probar una acción manualmente
        if (machinesComponent.selectedMachinePrograms().length > 0) {
            const firstProgram = machinesComponent.selectedMachinePrograms()[0];
            console.log('🧪 Programa de prueba:', firstProgram);
            
            console.log('🎯 Probando changeStatus...');
            try {
                machinesComponent.changeStatus(firstProgram, 'LISTO');
                console.log('✅ changeStatus ejecutado sin errores inmediatos');
            } catch (error) {
                console.error('❌ Error ejecutando changeStatus:', error);
            }
        } else {
            console.log('⚠️ No hay programas para probar');
        }
        
    } else {
        console.log('❌ Componente de máquinas no encontrado');
    }
} else {
    console.log('❌ Angular DevTools no disponible');
    console.log('💡 Instala Angular DevTools o ejecuta en modo desarrollo');
}

// 6. Verificar errores en la consola
console.log('🔍 Verificando errores recientes...');
const originalError = console.error;
const errors = [];
console.error = function(...args) {
    errors.push(args);
    originalError.apply(console, args);
};

setTimeout(() => {
    console.log('📋 Errores capturados:', errors);
}, 1000);

// 7. Verificar conectividad con el backend
console.log('🌐 Probando conectividad con el backend...');
fetch('http://localhost:7003/api/maquinas/test-raw')
    .then(response => {
        console.log('✅ Backend responde:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('📡 Datos del backend:', data);
    })
    .catch(error => {
        console.error('❌ Error conectando con backend:', error);
    });

// 8. Verificar si hay botones deshabilitados
const actionButtons = document.querySelectorAll('.action-btn');
console.log(`🔘 Botones de acción encontrados: ${actionButtons.length}`);
actionButtons.forEach((button, index) => {
    console.log(`Botón ${index + 1}:`, {
        disabled: button.disabled,
        classes: button.className,
        tooltip: button.getAttribute('matTooltip')
    });
});

// 9. Verificar eventos de click
console.log('👆 Verificando eventos de click...');
actionButtons.forEach((button, index) => {
    button.addEventListener('click', function(event) {
        console.log(`🖱️ Click en botón ${index + 1}:`, {
            target: event.target,
            disabled: button.disabled,
            preventDefault: event.defaultPrevented
        });
    });
});

console.log('🏁 Diagnóstico completado. Revisa los resultados arriba.');
console.log('💡 Ahora intenta hacer click en un botón de acción y observa la consola.');