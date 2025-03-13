import interact from "interactjs";

// resize event handler for keeping notes area extending all the way to the bottom of the screen
let currentWindowHeight = window.innerHeight;
window.addEventListener("resize", () => {
  console.log("fire");
  const newWindowHeight = window.innerHeight;
  let dy = currentWindowHeight - newWindowHeight;

  const notes = document.querySelector(".notes-wrapper");
  const notesHeight = parseInt(
    getComputedStyle(notes).height.replace("px", "")
  );

  const newy = notesHeight - dy;
  notes.style.height = `${newy}px`;
  currentWindowHeight = newWindowHeight;

  // Reset bodyRect obj for draggable popups
  bodyRect = document.body.getBoundingClientRect();
  interact(".alphabet-popup-wrapper.draggable").draggable({
    listeners: {
      move(event) {
        positionAlphabet.x += event.dx;
        positionAlphabet.y += event.dy;

        event.target.style.transform = `translate(${positionAlphabet.x}px, ${positionAlphabet.y}px)`;
      },
    },
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: bodyRect,
      }),
    ],
  });

  interact(".grid-popup-wrapper.draggable").draggable({
    listeners: {
      move(event) {
        position.x += event.dx;
        position.y += event.dy;

        event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
      },
    },
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: bodyRect,
      }),
    ],
  });
});

// Delay everything until page is done loading so heights can be calculated properly
let bodyRect;

const positionAlphabet = { x: 0, y: 0 };
const position = { x: 0, y: 0 };

document.addEventListener("DOMContentLoaded", () => {
  bodyRect = document.body.getBoundingClientRect();
  interact(".notes-wrapper.resize-enabled").resizable({
    edges: { top: true, left: true, bottom: true },
    listeners: {
      move: function (event) {
        let { x, y } = event.target.dataset;

        x = (parseFloat(x) || 0) + event.deltaRect.left;
        y = (parseFloat(y) || 0) + event.deltaRect.top;

        const minY = 0; // Top of notes box
        // Don't allow to go past top of notes. Changes dynamically with header
        if (y < minY) y = minY;

        // Prevents box from being minimized past bottom of div
        // Better than libraries options bc:
        // Fixes bug that happens when quick movements from "break" out of the bound the pages
        if (event.rect.top < event.rect.bottom)
          event.rect.bottom = event.rect.top;

        Object.assign(event.target.style, {
          width: `${event.rect.width}px`,
          height: `${event.rect.height}px`,
          transform: `translate(0, ${y}px)`,
        });

        Object.assign(event.target.dataset, { x, y });
      },
    },
  });

  // grid popup dragger
  interact(".grid-popup-wrapper.draggable").draggable({
    listeners: {
      move(event) {
        position.x += event.dx;
        position.y += event.dy;

        event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
      },
    },
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: bodyRect,
      }),
    ],
  });

  interact(".alphabet-popup-wrapper.draggable").draggable({
    listeners: {
      move(event) {
        positionAlphabet.x += event.dx;
        positionAlphabet.y += event.dy;

        event.target.style.transform = `translate(${positionAlphabet.x}px, ${positionAlphabet.y}px)`;
      },
    },
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: bodyRect,
      }),
    ],
  });

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

  // Used for default "tip" message clear (Only show once on page load)
  const notesArea = document.querySelector(".notes");
  const firstInputRemoveEvent = () => {
    notesArea.textContent = "";
    // Prevents this from firing more than once
    notesArea.removeEventListener("click", firstInputRemoveEvent);
  };
  notesArea.addEventListener("click", firstInputRemoveEvent);

  // Split notes button
  const splitNotesBtn = document.querySelector(".split-notes-btn");
  splitNotesBtn.addEventListener("click", () => {
    splitNotesBtn.classList.toggle("selected");
    document.querySelector(".second-notes").classList.toggle("hidden");
  });
});
export default () => {};
