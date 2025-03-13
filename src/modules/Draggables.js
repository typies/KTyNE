import interact from "interactjs";

// resize event handler for keeping notes area extending all the way to the bottom of the screen
let currentWindowHeight = window.innerHeight;
window.addEventListener("resize", () => {
  const newWindowHeight = window.innerHeight;
  let dy = currentWindowHeight - newWindowHeight;

  const notes = document.querySelector(".notes-wrapper");
  const notesHeight = parseInt(
    getComputedStyle(notes).height.replace("px", "")
  );

  const newy = notesHeight - dy;
  notes.style.height = `${newy}px`;
  currentWindowHeight = newWindowHeight;

  // Reset rect objs on window change
  bodyRect = document.body.getBoundingClientRect();
  notesWWRect = document
    .querySelector(".notes-wrapper-wrapper")
    .getBoundingClientRect();

  setUpBodyBoundDraggable(
    alphabetPosition,
    ".alphabet-popup-wrapper.draggable"
  );

  setUpBodyBoundDraggable(gridPosition, ".grid-popup-wrapper.draggable");
});

function setUpBodyBoundDraggable(positions, selector) {
  if (!positions) positions = { x: 0, y: 0 };
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
        restriction: bodyRect,
      }),
    ],
  });
}

let bodyRect;
let notesWWRect;

const alphabetPosition = { x: 0, y: 0 };
const gridPosition = { x: 0, y: 0 };

// Delay until page is done loading so heights can be calculated properly
document.addEventListener("DOMContentLoaded", () => {
  interact(".notes-wrapper").resizable({
    edges: { top: true, left: true, bottom: true },
    listeners: {
      move: function (event) {
        notesWWRect = document // Keep this inside move fn (Otherwise values are slightly off)
          .querySelector(".notes-wrapper-wrapper")
          .getBoundingClientRect();
        let notesRect = document
          .querySelector(".notes")
          .getBoundingClientRect();

        // No change return to prevent view behaviors
        if (
          event.deltaRect.top === 0 &&
          event.deltaRect.bottom === 0 &&
          event.deltaRect.left === 0
        )
          return;

        const minY = 0; // Top of notes box
        const maxY = notesWWRect.bottom - notesWWRect.top;
        console.log(event.target.dataset.y);
        if (minY > event.target.dataset.y || event.target.dataset.y > maxY) {
          if (minY > event.target.dataset.y) event.target.dataset.y = 0;
          else if (event.target.dataset.y > maxY) event.target.dataset.y = maxY;
          return;
        }
        let { x, y } = event.target.dataset;

        x = (parseFloat(x) || 0) + event.deltaRect.left;
        y = (parseFloat(y) || 0) + event.deltaRect.top;
        if (event.deltaRect.top === 0 && y === 0) {
          y = (parseFloat(y) || 0) + event.deltaRect.bottom;
        }

        if (event.rect.top < notesWWRect.top) event.rect.top = notesWWRect.top;
        const minHeight = 0;
        const maxHeight =
          notesWWRect.height - (event.rect.top - notesWWRect.top);

        if (
          event.rect.top === notesWWRect.top &&
          event.deltaRect.bottom === 0
        ) {
          y = 0;
          event.rect.height = notesRect.bottom - notesRect.top;
          // return;
        }
        if (y === 0 && x === 0) return;

        // Prevent notes from expanding out of notesWW
        if (event.rect.height < minHeight) {
          event.rect.height = minHeight;
        }

        if (event.rect.height > maxHeight) {
          event.rect.height = maxHeight;
        }

        console.log(maxHeight - event.rect.height);

        Object.assign(event.target.style, {
          width: `${event.rect.width}px`,
          height: `${event.rect.height}px`,
          transform: `translate(0, ${y}px)`,
        });

        Object.assign(event.target.dataset, { x, y });
      },
    },
  });

  setUpBodyBoundDraggable(
    alphabetPosition,
    ".alphabet-popup-wrapper.draggable"
  );

  setUpBodyBoundDraggable(gridPosition, ".grid-popup-wrapper.draggable");

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

  /* This is used to block the mouse from touching the iframe when moving resizeable area*/
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
