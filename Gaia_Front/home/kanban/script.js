(function () {
  const API_URL = 'http://localhost:3000/api';
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Verificar autenticação
  if (!token) {
    alert('Você precisa estar logado para acessar o kanban');
    window.location.href = '../../login/index.html';
    return;
  }

  // Atualizar informações do usuário na sidebar
  const profileInfo = document.querySelector('.profile-info');
  if (profileInfo) {
    const userInfo = profileInfo.querySelector('div');
    if (userInfo) {
      userInfo.querySelector('strong').textContent = user.username || 'Usuário';
      userInfo.querySelector('.small').textContent = user.email || 'usuario@exemplo.com';
    }
  }

  // Mapeamento de status para IDs de lista
  const statusToListId = {
    'todo': 'todo-list',
    'inprogress': 'inprogress-list',
    'review': 'review-list',
    'done': 'done-list'
  };

  const listIdToStatus = {
    'todo-list': 'todo',
    'inprogress-list': 'inprogress',
    'review-list': 'review',
    'done-list': 'done'
  };

  // Funções de API
  async function fetchTasks() {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success ? data.tasks : [];
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      return [];
    }
  }

  async function createTask(title, status = 'todo') {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, status })
      });
      const data = await response.json();
      return data.success ? data.task : null;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      return null;
    }
  }

  async function updateTaskStatus(taskId, status) {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/move`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      return false;
    }
  }

  async function deleteTask(taskId) {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      return false;
    }
  }

  // Renderizar tarefas
  function renderTask(task) {
    const listId = statusToListId[task.status];
    const list = document.getElementById(listId);
    if (!list) return;

    const taskCard = document.createElement('li');
    taskCard.className = 'task-card';
    taskCard.setAttribute('draggable', 'true');
    taskCard.setAttribute('data-task-id', task.id);
    taskCard.textContent = task.title;
    
    // Adicionar evento de duplo clique para editar
    taskCard.addEventListener('dblclick', () => {
      const newTitle = prompt('Editar tarefa:', task.title);
      if (newTitle && newTitle.trim() && newTitle !== task.title) {
        updateTaskTitle(task.id, newTitle.trim());
      }
    });

    // Adicionar eventos de drag
    taskCard.addEventListener('dragstart', handleDragStart);
    taskCard.addEventListener('dragend', handleDragEnd);

    list.appendChild(taskCard);
  }

  async function updateTaskTitle(taskId, newTitle) {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle })
      });
      const data = await response.json();
      if (data.success) {
        const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskCard) {
          taskCard.textContent = newTitle;
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
    }
  }

  // Carregar tarefas do backend
  async function loadTasks() {
    // Limpar tarefas existentes
    document.querySelectorAll('.task-card').forEach(card => card.remove());
    
    const tasks = await fetchTasks();
    tasks.forEach(task => renderTask(task));
  }

  // Sidebar
  const userBtn = document.getElementById("userBtn");
  const sidebar = document.getElementById("sidebar");
  const closeBtn = document.getElementById("closeSidebar");

  if (userBtn && sidebar) {
    function openSidebar() {
      sidebar.classList.add("open");
      sidebar.setAttribute("aria-hidden", "false");
    }

    function closeSidebarFunc() {
      sidebar.classList.remove("open");
      sidebar.setAttribute("aria-hidden", "true");
    }

    userBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (sidebar.classList.contains("open")) closeSidebarFunc();
      else openSidebar();
    });

    if (closeBtn) closeBtn.addEventListener("click", closeSidebarFunc);

    document.addEventListener("click", function (e) {
      if (!sidebar.classList.contains("open")) return;
      if (
        !sidebar.contains(e.target) &&
        e.target !== userBtn &&
        !userBtn.contains(e.target)
      ) {
        closeSidebarFunc();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSidebarFunc();
    });
  }

  // Botão de logout
  const logoutBtn = document.querySelector('.sidebar-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '../../login/index.html';
    });
  }

  // Drag and Drop
  let draggingCard = null;

  function handleDragStart(e) {
    draggingCard = this;
    this.classList.add("dragging");
    this.classList.remove("drop-animate");
    
    // Salvar status atual para possível reversão
    const currentList = this.parentElement;
    if (currentList) {
      const currentStatus = listIdToStatus[currentList.id];
      this.setAttribute('data-old-status', currentStatus || 'todo');
    }
    
    try {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", "drag");
    } catch (err) {}
  }

  function handleDragEnd() {
    if (!draggingCard) return;
    draggingCard.classList.remove("dragging");
    if (
      draggingCard.parentElement &&
      draggingCard.parentElement.classList.contains("task-list")
    ) {
      draggingCard.classList.add("drop-animate");
      const cleanup = () => {
        draggingCard && draggingCard.classList.remove("drop-animate");
        draggingCard &&
          draggingCard.removeEventListener("animationend", cleanup);
      };
      draggingCard.addEventListener("animationend", cleanup);
    }
    document
      .querySelectorAll(".task-list.drag-over")
      .forEach((l) => l.classList.remove("drag-over"));
    draggingCard = null;
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".task-card:not(.dragging)"),
    ];
    let closest = { offset: Number.NEGATIVE_INFINITY, element: null };
    for (const child of draggableElements) {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        closest = { offset: offset, element: child };
      }
    }
    return closest.element;
  }

  // Configurar drag and drop nas listas
  const lists = document.querySelectorAll(".task-list");
  lists.forEach((list) => {
    list.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(list, e.clientY);
      const currentDragging = document.querySelector(".task-card.dragging");
      if (!currentDragging) return;
      if (afterElement == null) list.appendChild(currentDragging);
      else list.insertBefore(currentDragging, afterElement);
    });

    list.addEventListener("dragenter", (e) => {
      e.preventDefault();
      list.classList.add("drag-over");
    });

    list.addEventListener("dragleave", (e) => {
      const related = e.relatedTarget;
      if (!related || !list.contains(related)) {
        list.classList.remove("drag-over");
      }
    });

    list.addEventListener("drop", async (e) => {
      e.preventDefault();
      list.classList.remove("drag-over");
      
      // Atualizar status da tarefa no backend
      const taskCard = document.querySelector(".task-card.dragging");
      if (taskCard) {
        const taskId = parseInt(taskCard.getAttribute('data-task-id'));
        const newStatus = listIdToStatus[list.id];
        const oldStatus = taskCard.getAttribute('data-old-status');
        
        // Se o status não mudou, não fazer nada
        if (oldStatus === newStatus) {
          return;
        }
        
        if (taskId && newStatus) {
          const success = await updateTaskStatus(taskId, newStatus);
          if (!success) {
            // Reverter se falhar
            if (oldStatus) {
              const oldList = document.getElementById(statusToListId[oldStatus]);
              if (oldList) {
                oldList.appendChild(taskCard);
              }
            }
            alert('Erro ao mover tarefa. Tente novamente.');
          } else {
            // Remover atributo de status antigo após sucesso
            taskCard.removeAttribute('data-old-status');
          }
        }
      }
    });
  });

  // Botão adicionar tarefa
  const addTaskBtn = document.querySelector('.add-task');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', async () => {
      const title = prompt('Digite o título da nova tarefa:');
      if (title && title.trim()) {
        const newTask = await createTask(title.trim(), 'todo');
        if (newTask) {
          renderTask(newTask);
        } else {
          alert('Erro ao criar tarefa. Tente novamente.');
        }
      }
    });
  }

  // Botão deletar quadro (deletar todas as tarefas)
  const deleteBoardBtn = document.querySelector('.delete-board');
  if (deleteBoardBtn) {
    deleteBoardBtn.addEventListener('click', async () => {
      if (confirm('Tem certeza que deseja apagar todas as tarefas?')) {
        const tasks = await fetchTasks();
        let deleted = 0;
        for (const task of tasks) {
          const success = await deleteTask(task.id);
          if (success) deleted++;
        }
        if (deleted > 0) {
          loadTasks();
          alert(`${deleted} tarefa(s) deletada(s) com sucesso.`);
        }
      }
    });
  }

  // Carregar tarefas ao inicializar
  loadTasks();
})();
