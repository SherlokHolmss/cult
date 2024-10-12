(() => {
  const refs = {
    openModalBtn: document.querySelector("[data-modal-open]"),
    closeModalBtn: document.querySelector("[data-modal-close]"),
    modal: document.querySelector("[data-modal]"),
    modalContent: document.querySelector(".modal-content"),
  };
  refs.openModalBtn.addEventListener("click", () => toggleModal(500));
  refs.closeModalBtn.addEventListener("click", toggleModal);

  function toggleModal(width) {
    refs.modal.classList.toggle("is-active");
    if (width) {
      refs.modalContent.style.maxWidth = `${width}px`;
    }
  }
})();
