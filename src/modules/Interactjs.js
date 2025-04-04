import interact from "interactjs";

window.addEventListener("resize", () => {
  // Reset rect objs on window change
  setUpBodyBoundDraggable(".alphabet-popup-wrapper.draggable");
  setUpBodyBoundDraggable(".grid-popup-wrapper.draggable");
  setUpBodyBoundDraggable(".calc-popup-wrapper.draggable");
});

function setUpBodyBoundDraggable(selector) {
  const positions = { x: 0, y: 0 };
  interact(selector).draggable({
    listeners: {
      move(event) {
        positions.x += event.dx;
        positions.y += event.dy;

        event.target.style.transform = `translate(${positions.x}px, ${positions.y}px)`;
      },
    },
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: document.body.getBoundingClientRect(),
      }),
    ],
  });
}

const iframeCover = document.querySelector(".iframe-cover");
// Delay until page is done loading so heights can be calculated properly
document.addEventListener("DOMContentLoaded", () => {
  interact(".notes-wrapper-wrapper").resizable({
    edges: { left: true },
    listeners: {
      move: function (event) {
        /* Block the mouse from touching the iframe when moving resizeable area*/
        iframeCover.classList.remove("hidden");
        let x = event.target.dataset.x;
        x = (parseFloat(x) || 0) + event.deltaRect.left;
        Object.assign(event.target.style, {
          width: `${event.rect.width}px`,
        });
        Object.assign(event.target.dataset, { x });
      },
    },
  });

  // Calc resizable
  interact(".calc-popup-wrapper").resizable({
    edges: { right: true, bottom: true },
    listeners: {
      move: function (event) {
        /* Block the mouse from touching the iframe when moving resizeable area*/
        iframeCover.classList.remove("hidden");
        let { x, y } = event.target.dataset;
        x = (parseFloat(x) || 0) + event.deltaRect.left;
        y = (parseFloat(y) || 0) + event.deltaRect.top;

        const calcWrapperPopup = document.querySelector(".calc-popup-wrapper");
        const minWidth = getComputedStyle(calcWrapperPopup).minWidth;
        const minHeight = getComputedStyle(calcWrapperPopup).minHeight;

        if (event.rect.width < minWidth) event.rect.width = minWidth;
        if (event.rect.width < minHeight) event.rect.width = minHeight;

        Object.assign(event.target.style, {
          width: `${event.rect.width}px`,
          maxWidth: `${event.rect.width}px`,
          height: `${event.rect.height}px`,
        });

        Object.assign(event.target.dataset, { x, y });
      },
    },
  });

  /* Block the mouse from touching the iframe when moving resizeable area*/
  document.addEventListener("mouseup", () => {
    iframeCover.classList.add("hidden");
  });

  setUpBodyBoundDraggable(".alphabet-popup-wrapper.draggable");
  setUpBodyBoundDraggable(".grid-popup-wrapper.draggable");
  setUpBodyBoundDraggable(".calc-popup-wrapper.draggable");

  // Makes divs only draggable by their header
  const draggableGridAreas = document.querySelectorAll(".drag-area");
  draggableGridAreas.forEach((item) => {
    item.addEventListener("mouseover", () => {
      item.parentElement.classList.add("draggable");
    });
    item.addEventListener("mouseout", () => {
      item.parentElement.classList.remove("draggable");
    });
  });

  // Split notes buttons
  const splitNotesBtn = document.querySelector(".split-notes-btn");
  splitNotesBtn.addEventListener("click", () => {
    splitNotesBtn.classList.toggle("selected");
    document
      .querySelector(".top-notes *:last-child")
      .classList.toggle("hidden");
    document
      .querySelector(".bottom-notes *:last-child")
      .classList.toggle("hidden");
  });
  const splitNotesHorBtn = document.querySelector(".split-notes-hor-btn");
  splitNotesHorBtn.addEventListener("click", () => {
    splitNotesHorBtn.classList.toggle("selected");
    document.querySelector(".bottom-notes").classList.toggle("hidden");
  });

  interact(".top-notes *:last-child").resizable({
    edges: { left: true },
    listeners: {
      move: function (event) {
        /* Block the mouse from touching the iframe when moving resizeable area*/
        iframeCover.classList.remove("hidden");
        let x = event.target.dataset.x;
        x = (parseFloat(x) || 0) + event.deltaRect.left;
        const notesWidth = getComputedStyle(
          document.querySelector(".notes-wrapper")
        ).width;
        const rightBasis = (event.rect.width / parseInt(notesWidth)) * 100;
        Object.assign(event.target.style, {
          maxWidth: `${rightBasis}%`,
        });
        const leftSide = document.querySelector(".top-notes *:first-child");
        Object.assign(leftSide.style, {
          maxWidth: `${100 - rightBasis}%`,
        });
        Object.assign(event.target.dataset, { x });
      },
    },
  });

  interact(".bottom-notes *:last-child").resizable({
    edges: { left: true },
    listeners: {
      move: function (event) {
        /* Block the mouse from touching the iframe when moving resizeable area*/
        iframeCover.classList.remove("hidden");
        let x = event.target.dataset.x;
        x = (parseFloat(x) || 0) + event.deltaRect.left;
        const notesWidth = getComputedStyle(
          document.querySelector(".notes-wrapper")
        ).width;
        const rightBasis = (event.rect.width / parseInt(notesWidth)) * 100;
        Object.assign(event.target.style, {
          maxWidth: `${rightBasis}%`,
        });
        const leftSide = document.querySelector(".bottom-notes *:first-child");
        Object.assign(leftSide.style, {
          maxWidth: `${100 - rightBasis}%`,
        });
        Object.assign(event.target.dataset, { x });
      },
    },
  });

  interact(".bottom-notes").resizable({
    edges: { top: true },
    listeners: {
      move: function (event) {
        /* Block the mouse from touching the iframe when moving resizeable area*/
        iframeCover.classList.remove("hidden");
        let x = event.target.dataset.x;
        x = (parseFloat(x) || 0) + event.deltaRect.left;
        const notesHeight = getComputedStyle(
          document.querySelector(".notes-wrapper")
        ).height;
        const bottomBasis = (event.rect.height / parseInt(notesHeight)) * 100;
        Object.assign(event.target.style, {
          maxHeight: `${bottomBasis}%`,
        });
        const topSide = document.querySelector(".top-notes");
        Object.assign(topSide.style, {
          maxHeight: `${100 - bottomBasis}%`,
        });
        Object.assign(event.target.dataset, { x });
      },
    },
  });
});
export default () => {};
