document.addEventListener('DOMContentLoaded', () => {

    const addTaskBtn = document.querySelector('.action-button.add-task');
    const modalOverlay = document.getElementById('add-task-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-task-btn');
    const taskForm = document.getElementById('add-task-form');
    const taskNameInput = document.getElementById('task-name');
    const todoList = document.getElementById('todo-list'); 

    function openModal() {
        if (!modalOverlay || !taskNameInput) return;
        
        modalOverlay.classList.add('active');
        modalOverlay.setAttribute('aria-hidden', 'false');
        taskNameInput.focus(); 
    }

    function closeModal() {
        if (!modalOverlay || !taskForm) return;

        modalOverlay.classList.remove('active');
        modalOverlay.setAttribute('aria-hidden', 'true');
        taskForm.reset(); 
    }

    function handleAddTask(event) {
        event.preventDefault(); 
        const taskName = taskNameInput.value.trim();
        
        if (taskName === '') return; 

        const newTaskCard = document.createElement('li');
        newTaskCard.classList.add('task-card');
        newTaskCard.setAttribute('draggable', 'true');
        newTaskCard.textContent = taskName;

        addDragEvents(newTaskCard); 
        
        if (todoList) {
            todoList.appendChild(newTaskCard);
        }

        closeModal();
    }

    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', openModal);
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    if (taskForm) {
        taskForm.addEventListener('submit', handleAddTask);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });
    }


    const taskCards = document.querySelectorAll('.task-card');
    const taskLists = document.querySelectorAll('.task-list');
    let draggedItem = null; 
    taskCards.forEach(addDragEvents);

    function addDragEvents(card) {
        card.addEventListener('dragstart', () => {
            draggedItem = card;
            setTimeout(() => {
                card.style.opacity = '0.5';
            }, 0);
        });

        card.addEventListener('dragend', () => {
            if (draggedItem) {
                draggedItem.style.opacity = '1';
                draggedItem = null;
            }
        });
    }

    taskLists.forEach(list => {
        list.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            const afterElement = getDragAfterElement(list, e.clientY);
            if (draggedItem) {
                if (afterElement == null) {
                    list.appendChild(draggedItem);
                } else {
                    list.insertBefore(draggedItem, afterElement);
                }
            }
        });
    });
    
    function getDragAfterElement(list, y) {
        const draggableElements = [...list.querySelectorAll('.task-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

}); 