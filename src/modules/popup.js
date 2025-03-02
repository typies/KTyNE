class EdgeworkPopup {
  constructor() {
    return this;
  }
  domElements = {
    popupOverlay: document.querySelector(".popup-overlay"),
    edgework: document.querySelector(".edgework"),
    edgeworkForm: document.querySelector(".edgework-form"),
    newEdgeworkBtn: document.querySelector(".edgework-btn.new"),
    serial: document.querySelector(".widget.serial"),
    closeFormBtn: document.querySelector(".form-btn.close-btn"),
    resetFormBtn: document.querySelector(".form-btn.reset-btn"),
  };
  configureFormButtons() {
    const newEdgeworkBtn = this.domElements.newEdgeworkBtn;
    const popupOverlay = this.domElements.popupOverlay;
    const closeFormBtn = this.domElements.closeFormBtn;
    const resetFormBtn = this.domElements.resetFormBtn;
    const edgeworkForm = this.domElements.edgeworkForm;
    newEdgeworkBtn.addEventListener("click", () => {
      popupOverlay.classList.remove("hidden");
      document.querySelector("#serial").focus();
    });

    closeFormBtn.addEventListener("click", () => {
      popupOverlay.classList.add("hidden");
    });

    resetFormBtn.addEventListener("click", () => {
      this.resetForm();
      document.querySelector("#serial").focus();
    });

    edgeworkForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.resetEdgework();
      const formData = new FormData(edgeworkForm);
      this.populateSerial(formData.get("serial"));
      this.populateBatteries(
        formData.get("batteries"),
        formData.get("holders")
      );
      this.populateIndicators(
        formData.keys().filter((key) => key.includes("ind"))
      );
      this.populatePortPlates(formData.get("ports"));
      popupOverlay.classList.add("hidden");
    });
  }

  populateSerial(serial) {
    const edgework = this.domElements.edgework;
    if (!serial) return;
    const newSerial = document.createElement("div");
    newSerial.classList.add("widget", "serial");
    newSerial.textContent = serial.toUpperCase();
    edgework.appendChild(newSerial);
  }

  populateBatteries(batteries, holders) {
    const numOfAAPairs = batteries - holders;
    const numOfD = batteries - 2 * numOfAAPairs;
    const edgework = this.domElements.edgework;

    for (let i = 0; i < numOfAAPairs; i++) {
      const newAAWidget = document.createElement("div");
      newAAWidget.classList.add("widget", "battery", "aa");
      edgework.appendChild(newAAWidget);
    }

    for (let i = 0; i < numOfD; i++) {
      const newDWidget = document.createElement("div");
      newDWidget.classList.add("widget", "battery", "d");
      edgework.appendChild(newDWidget);
    }
  }

  populateIndicators(indicators) {
    const unlitInds = [];
    const edgework = this.domElements.edgework;
    indicators.forEach((ind) => {
      const newIndicator = document.createElement("div");
      newIndicator.classList.add("widget", "indicator");
      newIndicator.textContent = ind.split("-")[1].toUpperCase();
      if (ind.includes("unlit")) {
        newIndicator.classList.add("unlit");
        unlitInds.push(newIndicator);
      } else {
        newIndicator.classList.add("lit");
        // Add lit ind asap, delay unlit until all lits are added (Better grouping)
        edgework.appendChild(newIndicator);
      }
    });
    if (unlitInds.length > 0) {
      edgework.appendChild(...unlitInds);
    }
  }

  populatePortPlates(portList) {
    const edgework = this.domElements.edgework;
    if (!portList || portList === "") return;
    const portPlates = portList.split(" ");
    portPlates.forEach((plate) => {
      if (!plate || plate == "") return;
      const newPlate = document.createElement("div");
      newPlate.classList.add("widget", "portplate");
      const ports = plate.split("-");
      ports.forEach((port) => {
        const newPort = document.createElement("span");
        newPort.classList.add(port.toLowerCase());
        newPlate.appendChild(newPort);
      });
      edgework.appendChild(newPlate);
    });
  }

  resetForm() {
    const edgeworkForm = this.domElements.edgeworkForm;
    edgeworkForm.reset();
    return this;
  }

  resetEdgework() {
    const edgework = this.domElements.edgework;
    edgework.replaceChildren();
    return this;
  }

  init() {
    this.configureFormButtons();
    return this;
  }
}

class NumberedAlphabetPopup {
  constructor() {}

  domElements = {
    alphaBtn: document.querySelector(".alphabet-btn"),
    zeroBtn: document.querySelector(".zero-btn"),
    oneBtn: document.querySelector(".one-btn"),
    alphaPopupWrapper: document.querySelector(".alphabet-popup-wrapper"),
  };
  configureFormButtons() {
    const alphaBtn = this.domElements.alphaBtn;
    const alphaPopupWrapper = this.domElements.alphaPopupWrapper;
    const zeroBtn = this.domElements.zeroBtn;
    const oneBtn = this.domElements.oneBtn;
    alphaBtn.addEventListener("click", () => {
      alphaPopupWrapper.classList.toggle("hidden");
      alphaPopupWrapper.classList.toggle("selected");
    });

    zeroBtn.addEventListener("click", () => {
      this.changeLabelsZero();
    });

    oneBtn.addEventListener("click", () => {
      this.changeLabelsOne();
    });
  }

  changeLabelsZero() {
    const zeroBtn = this.domElements.zeroBtn;
    const oneBtn = this.domElements.oneBtn;
    const spans =
      this.domElements.alphaPopupWrapper.querySelectorAll("div span");
    spans.forEach((span, index) => {
      const spanParts = span.textContent.split(":");
      spanParts[0] = index;
      span.textContent = spanParts.join(":");
    });
    spans[9].classList.add("single-digit");
    zeroBtn.classList.add("selected");
    oneBtn.classList.remove("selected");
  }

  changeLabelsOne() {
    const zeroBtn = this.domElements.zeroBtn;
    const oneBtn = this.domElements.oneBtn;
    const spans =
      this.domElements.alphaPopupWrapper.querySelectorAll("div span");
    spans.forEach((span, index) => {
      const spanParts = span.textContent.split(":");
      spanParts[0] = index + 1;
      span.textContent = spanParts.join(":");
    });
    spans[9].classList.remove("single-digit");
    zeroBtn.classList.remove("selected");
    oneBtn.classList.add("selected");
  }

  init() {
    this.configureFormButtons();
    return this;
  }
}

export default { EdgeworkPopup, NumberedAlphabetPopup };
