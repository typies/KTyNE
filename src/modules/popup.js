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
    serialInput: document.querySelector("#serial"),
    batteriesInput: document.querySelector("#batteries"),
    holdersInput: document.querySelector("#holders"),
    portsInput: document.querySelector("#ports"),
    closeFormBtn: document.querySelector("#edgework-form-close-btn"),
    resetFormBtn: document.querySelector("#edgework-form-reset-btn"),
  };

  init() {
    this.configureFormButtons();
    this.domElements.serialInput.addEventListener("input", () =>
      this.validateSerialInput()
    );
    this.domElements.batteriesInput.addEventListener("input", () =>
      this.validateBatteries()
    );
    this.domElements.holdersInput.addEventListener("input", () =>
      this.validateBatteries()
    );
    this.domElements.portsInput.addEventListener("input", () =>
      this.validatePorts()
    );
    return this;
  }

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
      this.validateForm();
      console.log(edgeworkForm.checkValidity());
      if (!edgeworkForm.checkValidity()) {
        edgeworkForm.reportValidity();
        return;
      }
      this.resetEdgework();
      const formData = new FormData(edgeworkForm);
      this.populateSerialEle(formData.get("serial"));
      this.populateBatteries(
        formData.get("batteries"),
        formData.get("holders")
      );
      this.populateIndicators(
        formData,
        formData.keys().filter((key) => key.includes("ind"))
      );
      this.populatePortPlates(this.standardizePorts(formData.get("ports")));
      popupOverlay.classList.add("hidden");
      edgeworkForm.classList.add("hidden");
    });
  }

  validateSerialInput() {
    const serialInput = this.domElements.serialInput;
    serialInput.setCustomValidity("");
    const validSerialRegex = /[A-Za-z0-9]{6}/;
    const serial = serialInput.value;
    if (!serial.match(validSerialRegex) || serial.length !== 6) {
      serialInput.setCustomValidity(
        "Invalid serial. Must be exactly 6 letters/numbers"
      );
      return false;
    }
    return true;
  }

  validateBatteries() {
    const batteriesInput = this.domElements.batteriesInput;
    const holdersInput = this.domElements.holdersInput;
    const batteries = batteriesInput.value;
    const holders = holdersInput.value;
    batteriesInput.setCustomValidity("");
    holdersInput.setCustomValidity("");
    if (batteries > 2 * holders) {
      batteriesInput.setCustomValidity("Too much batteries not even holders!");
      return false;
    }

    if (holders > batteries) {
      holdersInput.setCustomValidity("Too much holders not enough batteries?");
      return false;
    }
    return true;
  }

  validateForm() {
    this.validateSerialInput();
    this.validateBatteries();
    this.validatePorts();
  }

  populateSerialEle(serialValue) {
    const edgework = this.domElements.edgework;
    if (!serialValue) return;
    const newSerialEle = document.createElement("div");
    newSerialEle.classList.add("widget", "serial");
    newSerialEle.textContent = serialValue.toUpperCase();
    edgework.appendChild(newSerialEle);
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

  populateIndicators(formData, indicatorKeys) {
    const edgework = this.domElements.edgework;
    const litIndDiv = document.createElement("div");
    const unlitIndDiv = document.createElement("div");
    indicatorKeys.forEach((key) => {
      const indVal = formData.get(key);
      if (indVal === "none") return;
      const newIndicator = document.createElement("div");
      newIndicator.classList.add("widget", "indicator");
      newIndicator.textContent = key.split("-")[0].toUpperCase();
      if (indVal === "lit") {
        newIndicator.classList.add("lit");
        litIndDiv.appendChild(newIndicator);
      }
      if (indVal === "unlit") {
        newIndicator.classList.add("unlit");
        unlitIndDiv.appendChild(newIndicator);
      }
    });
    edgework.append(litIndDiv);
    edgework.append(unlitIndDiv);
  }

  populatePortPlates(portList) {
    const edgework = this.domElements.edgework;
    if (portList.length === 0) return;
    const plateDiv = document.createElement("div");
    portList.forEach((plate) => {
      const newPlate = document.createElement("div");
      newPlate.classList.add("widget", "portplate");
      const ports = plate.split(" ");
      ports.forEach((port) => {
        const newPort = document.createElement("span");
        if (port !== "") newPort.classList.add(port.toLowerCase());
        newPlate.appendChild(newPort);
      });
      plateDiv.appendChild(newPlate);
    });
    edgework.appendChild(plateDiv);
    return;
  }

  validatePorts() {
    const portsInput = this.domElements.portsInput;
    portsInput.setCustomValidity("");
    this.standardizePorts(portsInput.value);

    return true;
  }

  standardizePorts(input) {
    if (input == "") return [];

    const replacedInput = input
      .toLowerCase()
      .replaceAll(/dvid|dvi-d/g, "dvi")
      .replaceAll("para", "parallel")
      .replaceAll("ps/2", "ps2")
      .replaceAll(/rj-45|rj45/g, "rj")
      .replaceAll(/stereo|stereo rca|stereo-rca|ster/g, "rca")
      .replaceAll(",", " ")
      .replaceAll("  ", " ");
    const portsRegex =
      /[([][dvi|parallel|ps2|rj|serial|rca|empty|none| ,-]+[)\]]/g;
    const plates = replacedInput.match(portsRegex);
    if (!plates) return [];
    plates.forEach((plate, i) => {
      plates[i] = plates[i].replaceAll(/\(|\)|\[|\]/g, "");
    });
    console.log(input, replacedInput, plates);
    return plates;
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
      const formTextCleaned = formText.replace(/(|\t|\n|\r)/gm, "");
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

class NukeWarningPopup {
  constructor() {
    return this;
  }
  domElements = {
    popupOverlay: document.querySelector(".popup-overlay"),
    closeFormBtn: document.querySelector("#close-nuke-warning-btn"),
    startNukeBtn: document.querySelector("#nuke-module-list-btn"),
    nukePopup: document.querySelector("#nuke-warning"),
  };

  configureFormButtons() {
    const startNukeBtn = this.domElements.startNukeBtn;
    const nukePopup = this.domElements.nukePopup;
    const popupOverlay = this.domElements.popupOverlay;
    const closeFormBtn = this.domElements.closeFormBtn;
    startNukeBtn.addEventListener("click", () => {
      popupOverlay.classList.remove("hidden");
      nukePopup.classList.remove("hidden");
    });

    closeFormBtn.addEventListener("click", () => {
      popupOverlay.classList.add("hidden");
      nukePopup.classList.add("hidden");
    });

    nukePopup.addEventListener("submit", (event) => {
      event.preventDefault();
      mainPubSub.publish("nukeModuleList");
      popupOverlay.classList.add("hidden");
      nukePopup.classList.add("hidden");
    });
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
  NukeWarningPopup,
};
