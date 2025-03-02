import mainPubSub from "./PubSub";

class EdgeworkPopup {
  constructor() {
    return this;
  }
  domElements = {
    popupOverlay: document.querySelector(".popup-overlay"),
    edgework: document.querySelector(".edgework"),
    edgeworkForm: document.querySelector(".edgework-form"),
    newEdgeworkBtn: document.querySelector(".edgework-btn"),
    serial: document.querySelector(".widget.serial"),
    closeFormBtn: document.querySelector("#edgework-form-close-btn"),
    resetFormBtn: document.querySelector("#edgework-form-reset-btn"),
  };
  configureFormButtons() {
    const newEdgeworkBtn = this.domElements.newEdgeworkBtn;
    const popupOverlay = this.domElements.popupOverlay;
    const closeFormBtn = this.domElements.closeFormBtn;
    const resetFormBtn = this.domElements.resetFormBtn;
    const edgeworkForm = this.domElements.edgeworkForm;
    newEdgeworkBtn.addEventListener("click", () => {
      popupOverlay.classList.remove("hidden");
      edgeworkForm.classList.remove("hidden");
      document.querySelector("#serial").focus();
    });

    closeFormBtn.addEventListener("click", () => {
      popupOverlay.classList.add("hidden");
      edgeworkForm.classList.add("hidden");
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
      edgeworkForm.classList.add("hidden");
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
    const edgework = this.domElements.edgework;
    const litIndDiv = document.createElement("div");
    const unlitIndDiv = document.createElement("div");
    indicators.forEach((ind) => {
      const newIndicator = document.createElement("div");
      newIndicator.classList.add("widget", "indicator");
      newIndicator.textContent = ind.split("-")[1].toUpperCase();
      if (ind.includes("unlit")) {
        newIndicator.classList.add("unlit");
        unlitIndDiv.appendChild(newIndicator);
      } else {
        newIndicator.classList.add("lit");
        litIndDiv.appendChild(newIndicator);
      }
    });
    edgework.append(litIndDiv);
    edgework.append(unlitIndDiv);
  }

  populatePortPlates(portList) {
    const edgework = this.domElements.edgework;
    if (!portList || portList === "") return;
    const portPlates = portList.split(" ");
    const plateDiv = document.createElement("div");
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
      plateDiv.appendChild(newPlate);
    });
    edgework.appendChild(plateDiv);
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
    alphaPopup: document.querySelector(".alphabet-popup"),
  };
  configureFormButtons() {
    const alphaBtn = this.domElements.alphaBtn;
    const alphaPopup = this.domElements.alphaPopup;
    const zeroBtn = this.domElements.zeroBtn;
    const oneBtn = this.domElements.oneBtn;
    alphaBtn.addEventListener("click", () => {
      alphaPopup.classList.toggle("hidden");
      alphaPopup.classList.toggle("selected");
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
    const spans = this.domElements.alphaPopup.querySelectorAll("div span");
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
    const spans = this.domElements.alphaPopup.querySelectorAll("div span");
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

class NewModuleListItemPopup {
  constructor() {
    return this;
  }
  domElements = {
    newModuleBtn: document.querySelector("#add-new-module-btn"),
    popupOverlay: document.querySelector(".popup-overlay"),
    newModuleForm: document.querySelector("#add-new-module-form"),
    manyNewModuleBtn: document.querySelector("#add-many-new-module-btn"),
    closeFormBtn: document.querySelector("#close-new-module-form-btn"),
  };

  configureFormButtons() {
    const newModuleBtn = this.domElements.newModuleBtn;
    const popupOverlay = this.domElements.popupOverlay;
    const closeFormBtn = this.domElements.closeFormBtn;
    const newModuleForm = this.domElements.newModuleForm;
    const manyNewModuleBtn = this.domElements.manyNewModuleBtn;
    newModuleBtn.addEventListener("click", () => {
      newModuleForm.reset();
      popupOverlay.classList.remove("hidden");
      newModuleForm.classList.remove("hidden");
      document.querySelector("#add-new-module-url").focus();
    });

    manyNewModuleBtn.addEventListener("click", () => {
      newModuleForm.classList.add("hidden");
    });

    closeFormBtn.addEventListener("click", () => {
      popupOverlay.classList.add("hidden");
      newModuleForm.classList.add("hidden");
    });

    newModuleForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(newModuleForm);
      mainPubSub.publish("addNewModule", {
        moduleName: formData.get("name"),
        manualUrl: formData.get("url"),
      });
      popupOverlay.classList.add("hidden");
      newModuleForm.classList.add("hidden");
    });
  }

  resetForm() {
    const newModuleForm = this.domElements.newModuleForm;
    newModuleForm.reset();
    return this;
  }

  init() {
    this.configureFormButtons();
    return this;
  }
}

class NewModuleListItemManyPopup {
  constructor() {
    return this;
  }
  domElements = {
    popupOverlay: document.querySelector(".popup-overlay"),
    manyNewModuleBtn: document.querySelector("#add-many-new-module-btn"),
    manyNewModuleForm: document.querySelector("#add-many-new-module-form"),
    closeFormBtn: document.querySelector("#close-many-new-module-form-btn"),
    resetFormBtn: document.querySelector("#reset-many-new-module-form-btn"),
    textAreaInput: document.querySelector("#add-many-new-module-text"),
    fileUploadInput: document.querySelector("#add-many-new-module-file"),
    addExampleBtn: document.querySelector("#add-many-example"),
  };

  configureFormButtons() {
    const manyNewModuleBtn = this.domElements.manyNewModuleBtn;
    const popupOverlay = this.domElements.popupOverlay;
    const resetFormBtn = this.domElements.resetFormBtn;
    const closeFormBtn = this.domElements.closeFormBtn;
    const manyNewModuleForm = this.domElements.manyNewModuleForm;
    const textAreaInput = this.domElements.textAreaInput;
    const fileUploadInput = this.domElements.fileUploadInput;
    const addExampleBtn = this.domElements.addExampleBtn;
    manyNewModuleBtn.addEventListener("click", () => {
      manyNewModuleForm.reset();
      popupOverlay.classList.remove("hidden");
      manyNewModuleForm.classList.remove("hidden");
    });

    resetFormBtn.addEventListener("click", () => {
      this.resetForm();
      textAreaInput.focus();
    });

    closeFormBtn.addEventListener("click", () => {
      popupOverlay.classList.add("hidden");
      manyNewModuleForm.classList.add("hidden");
    });

    addExampleBtn.addEventListener("click", (event) =>
      this.handleExample(event)
    );

    fileUploadInput.addEventListener(
      "change",
      this.handleFileUpload.bind(this)
    );

    manyNewModuleForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formText = textAreaInput.textContent;
      if (formText && formText !== "") {
        if (!this.processTextarea(formText)) return;
      }

      popupOverlay.classList.add("hidden");
      manyNewModuleForm.classList.add("hidden");
      this.resetForm();
    });
  }

  handleExample(event) {
    const textAreaInput = this.domElements.textAreaInput;
    const example = `[\n  {\n    "name": "Logic",\n    "url": "https://ktane.timwi.de/HTML/Logic.html"\n  },\n  {\n    "name": "Silly Slots",\n    "url": "https://ktane.timwi.de/HTML/Silly%20Slots.html"\n  },\n  {\n    "url": "https://ktane.timwi.de/HTML/Yippee.html"\n  }\n]`;

    if (textAreaInput.hasAttribute("contenteditable")) {
      this.currentTextInputValue = textAreaInput.textContent;

      event.target.textContent = "Hide Example";
      textAreaInput.textContent = example;
      textAreaInput.removeAttribute("contenteditable");
      return;
    }

    event.target.textContent = "Show me an example";
    textAreaInput.textContent = this.currentTextInputValue;
    textAreaInput.setAttribute("contenteditable", "");
  }

  processTextarea(formText) {
    try {
      console.log(formText);
      const formTextCleaned = formText.replace(/(|\t|\n|\r)/gm, "");
      console.log(formTextCleaned);
      const newModules = JSON.parse(formTextCleaned);
      mainPubSub.publish("addNewModules", newModules);
      return true;
    } catch (error) {
      if (error instanceof SyntaxError) {
        alert(
          "Unable to Add Modules: Misformed JSON. Ensure all strings (including name/url) are wrapped in double quotes"
        );
      }
      console.log(error);
      console.log("Add JSON from text failed.");
      return false;
    }
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    const textAreaInput = this.domElements.textAreaInput;
    if (!file) return;

    const fr = new FileReader();
    fr.onload = () => {
      textAreaInput.textContent = fr.result;
    };
    fr.onerror = () => {
      alert(
        "Unable to read file. Please use a properly formatted .json or .txt"
      );
    };
    fr.readAsText(file);
  }

  resetForm() {
    const manyNewModuleForm = this.domElements.manyNewModuleForm;
    const textAreaInput = this.domElements.textAreaInput;
    const addExampleBtn = this.domElements.addExampleBtn;
    manyNewModuleForm.reset();
    textAreaInput.textContent = "";
    if (textAreaInput.hasAttribute("readonly")) addExampleBtn.click();
    return this;
  }

  init() {
    this.configureFormButtons();
    return this;
  }
}

export default {
  EdgeworkPopup,
  NumberedAlphabetPopup,
  NewModuleListItemPopup,
  NewModuleListItemManyPopup,
};
