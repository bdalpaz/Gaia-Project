(function () {
  const userBtn = document.getElementById("userBtn");
  const sidebar = document.getElementById("sidebar");
  const closeBtn = document.getElementById("closeSidebar");

  if (!userBtn || !sidebar) return;

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

  let draggingCard = null;

  function handleDragStart(e) {
    draggingCard = this;
    this.classList.add("dragging");
    this.classList.remove("drop-animate");
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

  const taskCards = document.querySelectorAll(".task-card");
  taskCards.forEach((card) => {
    card.setAttribute("draggable", "true");
    card.addEventListener("dragstart", handleDragStart);
    card.addEventListener("dragend", handleDragEnd);
  });

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

    list.addEventListener("drop", (e) => {
      e.preventDefault();
      list.classList.remove("drag-over");
    });
  });
})();
