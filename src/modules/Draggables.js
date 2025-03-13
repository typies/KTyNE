import interact from "interactjs";

window.addEventListener("resize", () => {
  // Reset rect objs on window change
  setUpBodyBoundDraggable(".alphabet-popup-wrapper.draggable");
  setUpBodyBoundDraggable(".grid-popup-wrapper.draggable");
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

// Delay until page is done loading so heights can be calculated properly
document.addEventListener("DOMContentLoaded", () => {
  interact(".notes-wrapper").resizable({
    edges: { top: true, left: true, bottom: true },
    listeners: {
      move: function (event) {
        const notesWWRect = document // Keep this inside move fn (Otherwise values are slightly off)
          .querySelector(".notes-wrapper-wrapper")
          .getBoundingClientRect();

        const minHeight = 0;
        const maxHeight = parseInt(
          notesWWRect.height - (event.rect.top - notesWWRect.top)
        );

        const noChange =
          event.deltaRect.top === 0 &&
          event.deltaRect.bottom === 0 &&
          event.deltaRect.left === 0;
        if (noChange) return;
        if (parseInt(event.rect.top) < parseInt(notesWWRect.top)) return;
        if (parseInt(event.rect.height) < minHeight) return;
        if (parseInt(event.rect.height) > maxHeight) return;

        let { x, y } = event.target.dataset;

        x = (parseFloat(x) || 0) + event.deltaRect.left;
        y = (parseFloat(y) || 0) + event.deltaRect.top;

        const yTransform =
          event.rect.height === notesWWRect.height ? 0 : `${y}px`;

        Object.assign(event.target.style, {
          width: `${event.rect.width}px`,
          height: `${event.rect.height}px`,
          transform: `translate(0, ${yTransform})`,
        });

        Object.assign(event.target.dataset, { x, y });
      },
    },
  });

  setUpBodyBoundDraggable(".alphabet-popup-wrapper.draggable");

  setUpBodyBoundDraggable(".grid-popup-wrapper.draggable");

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

  // Hide buttons for headers
  const hideBtns = Array.from(
    document.querySelectorAll(".drag-area .hide-btn")
  );
  hideBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.parentElement.classList.add("hidden");
    });
  });

  /* Block the mouse from touching the iframe when moving resizeable area*/
  const notesArea = document.querySelector(".notes");
  const iframeCover = document.querySelector(".iframe-cover");
  notesArea.addEventListener("mousedown", () => {
    iframeCover.classList.remove("hidden");
  });
  notesArea.addEventListener("mouseup", () => {
    iframeCover.classList.add("hidden");
  });

  // Split notes button
  const splitNotesBtn = document.querySelector(".split-notes-btn");
  splitNotesBtn.addEventListener("click", () => {
    splitNotesBtn.classList.toggle("selected");
    document.querySelector(".second-notes").classList.toggle("hidden");
  });
});
export default () => {};
