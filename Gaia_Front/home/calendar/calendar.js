/* O 'index.global.min.js' carrega o objeto FullCalendar
   com todos os plugins (como dayGridPlugin e Draggable) nele.
*/

/* 1. Tornar as tarefas da lista arrastáveis */
var taskListEl = document.getElementById('external-tasks');
new FullCalendar.Draggable(taskListEl, {
    itemSelector: '.task-item',
    eventData: function(eventEl) {
        let data = JSON.parse(eventEl.getAttribute('data-event'));
        return {
            title: data.title,
            allDay: true 
        };
    }
});

/* 2. Inicializar o Calendário */
var calendarEl = document.getElementById('calendar');

const today = new Date();
// Define o primeiro dia do mês atual como data de início
const startOfMonth = today.toISOString().slice(0, 8) + '01';

var calendar = new FullCalendar.Calendar(calendarEl, {
    // Agora o FullCalendar.dayGridPlugin e interactionPlugin 
    // estarão definidos e disponíveis.
    plugins: [ FullCalendar.dayGridPlugin, FullCalendar.interactionPlugin ],
    
    initialView: 'dayGridMonth', 
    locale: 'pt-br', 
    headerToolbar: {
        left: 'today', 
        center: 'title', 
        right: 'next' // Apenas o botão de próximo
    },
    buttonText: {
        today: 'Mês Atual'
    },
    height: '100%', 
    initialDate: new Date(), // Começa no mês atual
    
    // Impede a navegação para meses anteriores
    validRange: {
        start: startOfMonth 
    },

    droppable: true, // Permite "soltar" tarefas
    editable: true,  // Permite arrastar tarefas dentro do calendário

    // Função chamada quando uma tarefa da lista é solta
    drop: function(info) {
        console.log(`Tarefa "${info.draggedEl.innerText}" arrastada para ${info.dateStr}`);
        // Se quiser que a tarefa suma da lista da esquerda:
        // info.draggedEl.remove(); 
    },

    // Função chamada quando se clica em uma tarefa no calendário
    eventClick: function(info) {
        alert('Tarefa: ' + info.event.title);
    }
});

// Finalmente, renderiza o calendário
calendar.render();