var taskListEl = document.getElementById('external-tasks');
if(taskListEl){
    const taskItems = taskListEl.querySelectorAll('.task-item');
    taskItems.forEach(item => {
        item.draggable = true;
        item.addEventListener('dragstart', (ev) => {
            const taskText = item.innerText.trim();
            ev.dataTransfer.effectAllowed = 'copy';
            ev.dataTransfer.setData('text/plain', taskText);
            ev.dataTransfer.setData('text/html', `<div class="task-item">${taskText}</div>`);
            ev.dataTransfer.setData('isExternalTask', 'true');
        });
    });
}

var calendarEl = document.getElementById('calendar');

const today = new Date();
const startOfMonth = today.toISOString().slice(0, 8) + '01';

var calendar = null;
try {
    calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: [ FullCalendar.dayGridPlugin, FullCalendar.interactionPlugin ],
    
    initialView: 'dayGridMonth', 
    locale: 'pt-br', 
    headerToolbar: {
        left: 'today', 
        center: 'title', 
        right: 'next' 
    },
    buttonText: {
        today: 'Mês Atual'
    },
    height: '100%', 
    initialDate: new Date(), 
    
    validRange: {
        start: startOfMonth 
    },

    droppable: true, 
    editable: true,  

    drop: function(info) {
        console.log(`Tarefa "${info.draggedEl.innerText}" arrastada para ${info.dateStr}`);
    },

    eventClick: function(info) {
        alert('Tarefa: ' + info.event.title);
    }
    });

    calendar.render();
} catch (err) {
    console.error('Erro ao inicializar o FullCalendar:', err);
}

const monthsGrid = document.getElementById('months-grid');
const yearLabel = document.getElementById('year-label');
const prevYearBtn = document.getElementById('prev-year');
const nextYearBtn = document.getElementById('next-year');

let overviewYear = (new Date()).getFullYear();

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function renderYearOverview(year){
    if(!monthsGrid) return;
    monthsGrid.innerHTML = '';
    yearLabel.textContent = year;
    for(let m=0;m<12;m++){
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'month-tile';
        tile.dataset.month = m;
        tile.innerHTML = `<div class="month-name">${MONTH_NAMES[m]}</div><div class="mini-grid" aria-hidden="true"></div>`;
        const mini = tile.querySelector('.mini-grid');
        const first = new Date(year, m, 1);
        const days = new Date(year, m+1, 0).getDate();
        const startWeekday = first.getDay(); 
        for(let b=0;b<startWeekday;b++){
            const d = document.createElement('div'); d.className='day'; d.textContent=''; mini.appendChild(d);
        }
        for(let d=1; d<=days; d++){
            const dd = document.createElement('div'); dd.className='day'; dd.textContent = d;
            // highlight today
            const today = new Date();
            if(today.getFullYear()===year && today.getMonth()===m && today.getDate()===d) dd.classList.add('today');
            mini.appendChild(dd);
        }

        tile.addEventListener('click', ()=>{
            if (calendar && typeof calendar.gotoDate === 'function') {
                calendar.gotoDate(new Date(year, m, 1));
                try { calendar.changeView('dayGridMonth'); } catch(e){}
            } else {
                console.warn('Calendar instance not available to navigate to month.');
            }
            showMonthView(year, m);
            const calEl = document.getElementById('calendar');
            if (calEl) calEl.scrollIntoView({behavior:'smooth'});
        });

        monthsGrid.appendChild(tile);
    }
}

if(prevYearBtn) prevYearBtn.style.display = 'none';
if(nextYearBtn) nextYearBtn.style.display = 'none';

renderYearOverview(overviewYear);

(function(){
    const monthSidebar = document.getElementById('month-sidebar');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarMonthsList = document.getElementById('sidebar-months');

    function populateSidebarMonths(year){
        if(!sidebarMonthsList) return;
        sidebarMonthsList.innerHTML = '';
        for(let m=0;m<12;m++){
            const li = document.createElement('li');
            li.className = 'sidebar-month';
            li.tabIndex = 0;
            li.dataset.month = m;
            li.textContent = MONTH_NAMES[m];
            li.addEventListener('click', ()=>{
                if(calendar && typeof calendar.gotoDate === 'function'){
                    calendar.gotoDate(new Date(year, m, 1));
                    try{ calendar.changeView('dayGridMonth'); }catch(e){}
                }
                showMonthView(year, m);
                document.querySelectorAll('.sidebar-month').forEach(n=>n.classList.remove('active'));
                li.classList.add('active');
            });
            sidebarMonthsList.appendChild(li);
        }
    }

    populateSidebarMonths(overviewYear);
})();

(function(){
    const monthView = document.getElementById('month-view');
    const monthViewTitle = document.getElementById('month-view-title');
    const daysGrid = document.getElementById('days-grid');
    const backBtn = document.getElementById('back-to-overview');
    const yearOverview = document.getElementById('year-overview');

    let monthlyTasks = {};
    const STORAGE_KEY = 'gaia_monthly_tasks';
    
    function loadTasks(){
        const stored = localStorage.getItem(STORAGE_KEY);
        monthlyTasks = stored ? JSON.parse(stored) : {};
    }
    
    function saveTasks(){
        localStorage.setItem(STORAGE_KEY, JSON.stringify(monthlyTasks));
    }

    function renderMonthView(year, month){
        if(!monthView || !daysGrid) return;
        
        const first = new Date(year, month, 1);
        const days = new Date(year, month+1, 0).getDate();
        const startWeekday = first.getDay();
        const prevMonthDays = new Date(year, month, 0).getDate();

        monthViewTitle.textContent = `${MONTH_NAMES[month]} ${year}`;

        daysGrid.innerHTML = '';

        for(let d = prevMonthDays - startWeekday + 1; d <= prevMonthDays; d++){
            const cell = createDayCell(year, month-1, d, true);
            daysGrid.appendChild(cell);
        }

        const today = new Date();
        for(let d = 1; d <= days; d++){
            const isToday = today.getFullYear()===year && today.getMonth()===month && today.getDate()===d;
            const cell = createDayCell(year, month, d, false, isToday);
            daysGrid.appendChild(cell);
        }

        const totalCells = daysGrid.children.length;
        const remaining = 42 - totalCells; 
        for(let d = 1; d <= remaining; d++){
            const cell = createDayCell(year, month+1, d, true);
            daysGrid.appendChild(cell);
        }

        monthView.style.display = 'flex';
        yearOverview.style.display = 'none';

        if(taskListEl){
            const taskItems = taskListEl.querySelectorAll('.task-item');
            taskItems.forEach(item => {
                item.draggable = true;
                const newItem = item.cloneNode(true);
                item.parentNode.replaceChild(newItem, item);
            });
            const taskItems2 = taskListEl.querySelectorAll('.task-item');
            taskItems2.forEach(item => {
                item.addEventListener('dragstart', (ev) => {
                    const taskText = item.innerText.trim();
                    ev.dataTransfer.effectAllowed = 'copy';
                    ev.dataTransfer.setData('text/plain', taskText);
                    ev.dataTransfer.setData('text/html', `<div class="task-item">${taskText}</div>`);
                    ev.dataTransfer.setData('isExternalTask', 'true');
                });
            });
        }
    }

    function createDayCell(year, month, day, isOtherMonth, isToday){
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        if(isOtherMonth) cell.classList.add('other-month');
        if(isToday) cell.classList.add('today');

        const dayNum = document.createElement('div');
        dayNum.className = 'day-number';
        dayNum.textContent = day;
        cell.appendChild(dayNum);

        const taskList = document.createElement('div');
        taskList.className = 'day-tasks';
        cell.appendChild(taskList);

        const dateKey = `${year}-${month+1}-${day}`;
        const tasksForDay = monthlyTasks[dateKey] || [];
        
        tasksForDay.forEach(taskText => {
            const taskEl = document.createElement('div');
            taskEl.className = 'day-task-item';
            taskEl.draggable = true;
            
            const textSpan = document.createElement('div');
            textSpan.className = 'day-task-text';
            textSpan.textContent = taskText;
            taskEl.appendChild(textSpan);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'day-task-remove';
            removeBtn.textContent = '✕';
            removeBtn.type = 'button';
            removeBtn.addEventListener('click', (ev)=>{
                ev.stopPropagation();
                if(monthlyTasks[dateKey]){
                    monthlyTasks[dateKey] = monthlyTasks[dateKey].filter(t => t !== taskText);
                    saveTasks();
                    renderMonthView(year, month);
                }
            });
            taskEl.appendChild(removeBtn);
            
            taskEl.addEventListener('dragstart', (ev)=>{
                ev.dataTransfer.effectAllowed = 'move';
                ev.dataTransfer.setData('text/plain', taskText);
                ev.dataTransfer.setData('sourceDate', dateKey);
            });

            taskList.appendChild(taskEl);
        });

        cell.addEventListener('dragover', (ev)=>{
            ev.preventDefault();
            ev.dataTransfer.dropEffect = 'copy';
            cell.style.background = 'rgba(216,196,255,0.15)';
        });

        cell.addEventListener('dragleave', (ev)=>{
            if(ev.target === cell) cell.style.background = '';
        });

        cell.addEventListener('drop', (ev)=>{
            ev.preventDefault();
            cell.style.background = '';

            let taskText = ev.dataTransfer.getData('text/plain');
            const sourceDate = ev.dataTransfer.getData('sourceDate');
            const isExternal = ev.dataTransfer.getData('isExternalTask') === 'true';
            
            if(taskText) taskText = taskText.trim();

            const dateKey = `${year}-${month+1}-${day}`;

            console.log('Drop event:', { taskText, sourceDate, isExternal, dateKey, isOtherMonth });

            if(!isOtherMonth && taskText && taskText.length > 0){
                if(sourceDate && sourceDate !== dateKey && monthlyTasks[sourceDate]){
                    monthlyTasks[sourceDate] = monthlyTasks[sourceDate].filter(t => t !== taskText);
                }

                if(!monthlyTasks[dateKey]) monthlyTasks[dateKey] = [];
                if(!monthlyTasks[dateKey].includes(taskText)){
                    monthlyTasks[dateKey].push(taskText);
                    console.log('Task added:', taskText, 'to', dateKey);
                }

                saveTasks();
                renderMonthView(year, month);
            }
        });

        return cell;
    }

    if(backBtn){
        backBtn.addEventListener('click', ()=>{
            if(monthView) monthView.style.display = 'none';
            if(yearOverview) yearOverview.style.display = 'block';
        });
    }

    window.showMonthView = function(year, month){
        renderMonthView(year, month);
    };

    loadTasks();
})();