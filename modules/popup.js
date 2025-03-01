class EdgeworkPopup {
  constructor() {}
  domElements = {
    popupOverlay: document.querySelector(".popup-overlay"),
    edgework: document.querySelector(".edgework"),
    edgeworkForm: document.querySelector(".edgework-form"),
    newEdgeworkBtn: document.querySelector(".edgework-btn.new"),
    serial: document.querySelector(".widget.serial"),
    closeFormBtn: document.querySelector(".form-btn.close-btn"),
    resetFormBtn: document.querySelector(".form-btn.reset-btn"),
  };
  createPopup() {
    this.domElements.newEdgeworkBtn.addEventListener("click", () => {
      this.domElements.popupOverlay.classList.remove("hidden");
    });

    this.domElements.closeFormBtn.addEventListener("click", () => {
      this.domElements.popupOverlay.classList.add("hidden");
    });

    this.domElements.resetFormBtn.addEventListener("click", () =>
      this.resetForm()
    );

    this.domElements.edgeworkForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.resetEdgework();
      const formData = new FormData(this.domElements.edgeworkForm);
      this.populateSerial(formData.get("serial"));
      this.populateBatteries(
        formData.get("batteries"),
        formData.get("holders")
      );
      this.populateIndicators(
        formData.keys().filter((key) => key.includes("ind"))
      );
      this.populatePortPlates(formData.get("ports"));
      this.domElements.popupOverlay.classList.add("hidden");
    });
  }

  populateSerial(serial) {
    if (!serial) return;
    const newSerial = document.createElement("div");
    newSerial.classList.add("widget", "serial");
    newSerial.textContent = serial.toUpperCase();
    this.domElements.edgework.appendChild(newSerial);
  }

  populateBatteries(batteries, holders) {
    const numOfAAPairs = batteries - holders;
    const numOfD = batteries - 2 * numOfAAPairs;

    for (let i = 0; i < numOfAAPairs; i++) {
      const newAAWidget = document.createElement("div");
      newAAWidget.classList.add("widget", "battery", "aa");
      this.domElements.edgework.appendChild(newAAWidget);
    }

    for (let i = 0; i < numOfD; i++) {
      const newDWidget = document.createElement("div");
      newDWidget.classList.add("widget", "battery", "d");
      this.domElements.edgework.appendChild(newDWidget);
    }
  }

  populateIndicators(indicators) {
    const unlitInds = [];
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
        this.domElements.edgework.appendChild(newIndicator);
      }
    });
    if (unlitInds.length > 0) {
      this.domElements.edgework.appendChild(...unlitInds);
    }
  }

  populatePortPlates(portList) {
    if (!portList || portList === "") return;
    const portPlates = portList.split(" ");
    portPlates.forEach((plate) => {
      const newPlate = document.createElement("div");
      newPlate.classList.add("widget", "portplate");
      const ports = plate.split("-");
      ports.forEach((port) => {
        const newPort = document.createElement("span");
        newPort.classList.add(port.toLowerCase());
        newPlate.appendChild(newPort);
      });
      this.domElements.edgework.appendChild(newPlate);
    });
  }

  resetForm() {
    this.domElements.edgeworkForm.reset();
  }

  resetEdgework() {
    this.domElements.edgework.replaceChildren();
  }
}

const edgeworkPopup = new EdgeworkPopup();
edgeworkPopup.createPopup();

export default edgeworkPopup;
