import { DefaultPopup } from "./popup.js";
import mainPubSub from "./PubSub.js";
import sharedIdCounter from "./sharedIdCounter.js";
import defaultModules from "./vanillaModules.json";
const KTANE_TIMWI_URL = "https://ktane.timwi.de/";

class Sidebar {
  constructor(itemList = []) {
    this.sidebarItems = itemList;
    this.init();
    mainPubSub.subscribe("addNewModule", this.addSidebarItem.bind(this));
    mainPubSub.subscribe("addNewModules", this.addSidebarItems.bind(this));
    mainPubSub.subscribe("deleteModule", this.deleteModule.bind(this));
    mainPubSub.subscribe(
      "nukeModuleList",
      this.removeAllSidebarItems.bind(this)
    );
    return this;
  }

  domElements = {
    sidebar: document.querySelector(".sidebar"),
    sidebarListElement: document.querySelector(".sidebar .module-list"),
    newRepoTabBtn: document.querySelector(".new-repo-tab-btn"),
    filter: document.querySelector("#sidebar-filter-input"),
    filterClear: document.querySelector(".sidebar-filter-clear"),
    sidebarSettings: document.querySelector(".cog-svg"),
    moduleListTitle: document.querySelector(".module-list-title"),
    collapseSidebarBtn: document.querySelector(".collapse-sidebar-btn"),
    sidebarMenuSidebarBtn: document.querySelector(".options-btn"),
    addOneBtn: document.querySelector(".add-one-btn"),
  };

  init() {
    this.importProjectsFromLocal();
    if (this.sidebarItems.length === 0) {
      this.addSidebarItems(defaultModules);
    }
    this.render();
    this.configureStaticSidebarBtns();

    const addNewModulePopup = new DefaultPopup({
      title: "Add New Module",
      submitCallback: (form) => {
        const formData = new FormData(form);
        mainPubSub.publish("addNewModule", {
          moduleName: formData.get("name"),
          manualUrl: formData.get("url"),
        });
      },
      buttons: [
        {
          textContent: "Close",
        },
        {
          textContent: "Add",
          type: "submit",
        },
      ],
      textInputs: [
        {
          inputLabelText: "Module URL",
          inputName: "url",
          inputId: "url",
          inputClassList: ["add-new-module-form-url-input"],
          littleInputWrapperClassList: ["top-margin"],
          inputPlaceholder: "https://ktane.timwi.de/HTML/Logic.html",
          inputAutocomplete: "off",
          required: true,
        },
        {
          inputLabelText: "Module Name",
          inputName: "name",
          inputId: "name",
          littleInputWrapperClassList: ["top-margin"],
          inputPlaceholder: "Logic",
          inputAutocomplete: "off",
        },
      ],
    });
    this.addNewModulePopup = addNewModulePopup;
    // const addNewModuleBtn = document.querySelector(".add-new-module-btn");
    // addNewModuleBtn.addEventListener("click", () => {
    //   addNewModulePopup.doPopup();
    // });
  }

  render() {
    const sidebarListElement = this.domElements.sidebarListElement;
    sidebarListElement.replaceChildren();
    if (this.sidebarItems instanceof Array) {
      this.sidebarItems.forEach((sidebarItem) =>
        this.createSidebarLi(sidebarItem)
      );
    }
    this.sortSidebar();
  }

  getSidebarItem(mName) {
    return this.sidebarItems.find((item) => {
      if (item.moduleName.toLowerCase() === mName.toLowerCase()) return item;
    });
  }

  getSidebarItemElement(mName) {
    const sidebarItems = Array.from(
      this.domElements.sidebarListElement.children
    );
    const matchingItem = sidebarItems.find(
      (child) => child.textContent.toLowerCase() === mName.toLowerCase()
    );
    return matchingItem;
  }

  addSidebarItem(sidebarItem, reRender = true, skipDuplicates = false) {
    if (!sidebarItem.moduleName || sidebarItem.moduleName === "") {
      try {
        const regex = /HTML\/([\w%20]+).html/;
        const regexResult = sidebarItem.manualUrl.match(regex);
        if (!regexResult) return;

        const regexName = regexResult[1].split("%20").join(" ");
        sidebarItem.moduleName = regexName;
      } catch {
        new DefaultPopup({
          title: `Error processing the following URL: ${sidebarItem.manualUrl}`,
        }).doPopup();
      }
    }

    const trimmedModName = sidebarItem.moduleName.trim();

    const existingSidebarItem = this.getSidebarItem(trimmedModName);
    if (existingSidebarItem) {
      if (skipDuplicates) {
        return "skipped";
      }
      new DefaultPopup({
        title: `${trimmedModName} already exists. Would you like to overwrite?`,
        submitCallback: () => {
          const removeItem = this.getSidebarItemElement(trimmedModName);
          this.removeSidebarItemElement(removeItem);
          this.sidebarItems.push(sidebarItem);
          this.localStorageAdd(sidebarItem);
          if (reRender) this.render();
        },
        buttons: [
          {
            textContent: "No",
          },
          {
            textContent: "Yes",
            type: "submit",
          },
        ],
      }).doPopup();
    } else {
      this.sidebarItems.push(sidebarItem);
      this.localStorageAdd(sidebarItem);
      if (reRender) this.render();
    }
  }

  addSidebarItems(sidebarItemsList) {
    const skippedItems = [];
    const addedItems = [];
    sidebarItemsList.forEach((sidebarItem) => {
      const newSidebarItemFormatted = {
        moduleName: sidebarItem.name,
        manualUrl: sidebarItem.url,
      };
      const skipped = this.addSidebarItem(newSidebarItemFormatted, false, true);
      if (skipped === "skipped") {
        skippedItems.push(sidebarItem.name);
      } else {
        addedItems.push(sidebarItem.name);
      }
    });
    this.render();
    if (skippedItems.length > 0) {
      if (skippedItems.length === sidebarItemsList.length) {
        new DefaultPopup({
          title: "All of those modules are already known.",
        }).doPopup();
      } else if (
        skippedItems.length <
        sidebarItemsList.length - skippedItems.length
      ) {
        new DefaultPopup({
          title: `The following items were duplicates and were skipped\n\n${skippedItems.join(", ")}`,
        }).doPopup();
      } else {
        new DefaultPopup({
          title: `Those were mostly duplicates, But the follow were added:\n\n${addedItems.join(", ")}`,
        }).doPopup();
      }
    }
  }

  deleteModule(pubsubData) {
    const moduleToDelete = this.getSidebarItemElement(pubsubData.moduleName);
    this.removeSidebarItemElement(moduleToDelete);
  }

  removeAllSidebarItems() {
    localStorage.clear();
    this.syncLists();
    this.render();
  }

  removeSidebarItemElement(sidebarItem) {
    this.localStorageRemove(sidebarItem.textContent);
    sidebarItem.remove();
    this.syncLists();
  }

  localStorageAdd(module) {
    localStorage.setItem(module.moduleName, module.manualUrl);
  }

  localStorageRemove(moduleName) {
    localStorage.removeItem(moduleName);
  }

  importProjectsFromLocal() {
    for (let i = 0; i < window.localStorage.length; i++) {
      const moduleName = window.localStorage.key(i);
      const manualUrl = window.localStorage.getItem(moduleName);
      this.sidebarItems.push({ moduleName, manualUrl });
    }
  }

  syncLists() {
    // Syncs the local storage list with the page list
    this.sidebarItems = [];
    this.importProjectsFromLocal();
  }

  addDefaultSidebarItems(sidebarItems) {
    sidebarItems.forEach((sidebarItem) => {
      this.sidebarItems.push(sidebarItem);
    });
    this.render();
  }

  createSidebarLi(sidebarItem) {
    const sidebarListElement = this.domElements.sidebarListElement;
    const newSidebarListItem = document.createElement("li");
    newSidebarListItem.classList.add("sidebar-item");
    if (this.editMode) {
      // Used to maintain orange color when filter is cleared
      newSidebarListItem.classList.toggle("orange");
    }
    newSidebarListItem.addEventListener("click", () => {
      if (this.editMode) {
        mainPubSub.publish("editModule", {
          moduleName: sidebarItem.moduleName,
          manualUrl: sidebarItem.manualUrl,
        });
      } else {
        this.openNewModule(sidebarItem.moduleName, sidebarItem.manualUrl);
      }

      if (this.addOneMode) {
        this.toggleAddOneMode();
      }
    });
    newSidebarListItem.textContent = sidebarItem.moduleName;
    sidebarListElement.appendChild(newSidebarListItem);
  }

  configureStaticSidebarBtns() {
    const filter = this.domElements.filter;
    const filterClear = this.domElements.filterClear;
    const newRepoTabBtn = this.domElements.newRepoTabBtn;
    const collapseSidebarBtn = this.domElements.collapseSidebarBtn;
    const addOneBtn = this.domElements.addOneBtn;
    const sidebarMenuSidebarBtn = this.domElements.sidebarMenuSidebarBtn;
    filter.addEventListener("keydown", () => {
      this.filterSidebar(filter.value);
    });
    // Both keydown and up are used to handle multiple situations
    filter.addEventListener("keyup", () => {
      this.filterSidebar(filter.value);
    });
    filterClear.addEventListener("click", () => {
      filter.value = "";
      this.filterSidebar("");
    });
    collapseSidebarBtn.addEventListener("click", () => this.collapseToggle());
    addOneBtn.addEventListener("click", () => {
      this.toggleAddOneMode();
    });

    const nukePopup = new DefaultPopup({
      title:
        "Are you sure you want to DELETE ALL SAVED MODULE?\nThis is not reversable",
      classList: ["text-wrap"],
      buttons: [
        {
          textContent: "Close",
        },
        {
          textContent: "Yes, I know what I'm doing",
          classList: ["red"],
          type: "submit",
          event: {
            trigger: "click",
            callback: () => mainPubSub.publish("nukeModuleList"),
          },
        },
      ],
    });
    this.nukePopup = nukePopup;

    sidebarMenuSidebarBtn.addEventListener("click", () => {
      new DefaultPopup({
        title: "Options",
        buttons: [
          {
            textContent: "Add New Module",
            classList: ["add-new-module-btn"],
            event: {
              trigger: "click",
              callback: () => this.addNewModulePopup.doPopup(),
            },
          },
          {
            textContent: this.editMode ? "Exit Edit Mode" : "Enter Edit Mode",
            classList: ["edit-mode-btn", this.editMode ? "orange" : null],
            type: "submit",
            event: {
              trigger: "click",
              callback: () => this.toggleEditMode(),
            },
          },
          {
            textContent: "Import Module List",
            classList: ["import-modules-btn"],
            type: "submit",
            event: {
              trigger: "click",
              callback: () => {
                document
                  .querySelector(".popup-overlay")
                  .classList.remove("hidden");
                document
                  .querySelector(".import-modules-form")
                  .classList.remove("hidden");
              },
            },
          },
          {
            textContent: "Export Module List",
            classList: ["export-modules-btn"],
            type: "submit",
            event: {
              trigger: "click",
              callback: () => {
                document
                  .querySelector(".popup-overlay")
                  .classList.remove("hidden");
                document
                  .querySelector(".export-modules-form")
                  .classList.remove("hidden");
              },
            },
          },
          {
            textContent: "Delete All Modules",
            classList: ["nuke-module-list-btn"],
            type: "submit",
            event: {
              trigger: "click",
              callback: () => this.nukePopup.doPopup(),
            },
          },
        ],
      }).doPopup();
    });

    const newRepoTabPopup = new DefaultPopup({
      title: "Opening New KTANE.TIMEWI.DE Tab",
      buttons: [
        {
          textContent: "Close",
        },
        {
          textContent: "Open",
          type: "submit",
        },
      ],
      textInputs: [
        {
          inputLabelText: "New Tab Name",
          inputId: "new-tab-input",
          inputName: "new-tab-input",
        },
      ],
      submitCallback: (form) => {
        const formData = new FormData(form);
        const newTabName = formData.get("new-tab-input");
        if (!newTabName || newTabName === "") return;
        navigator.clipboard.writeText(newTabName);
        this.openNewModule(newTabName, KTANE_TIMWI_URL);
      },
    });
    newRepoTabBtn.addEventListener("click", () => {
      newRepoTabPopup.doPopup();
    });
  }

  collapseToggle() {
    const sidebar = this.domElements.sidebar;
    const collapseSidebarBtn = this.domElements.collapseSidebarBtn;
    const addOneBtn = this.domElements.addOneBtn;
    sidebar.classList.toggle("hidden");
    collapseSidebarBtn.toggleAttribute("rotate180");
    addOneBtn.classList.toggle("hidden");
  }

  toggleAddOneMode() {
    this.addOneMode = !this.addOneMode;
    const filter = this.domElements.filter;
    const title = this.domElements.moduleListTitle;
    const collapseSidebarBtn = this.domElements.collapseSidebarBtn;
    collapseSidebarBtn.classList.toggle("hidden");
    this.collapseToggle();
    filter.focus();
    if (this.addOneMode) {
      title.textContent = "Add One Mode";
    } else {
      title.textContent = "Modules";
    }
  }

  toggleEditMode() {
    const title = this.domElements.moduleListTitle;
    const addNewRepoTabBtn = this.domElements.newRepoTabBtn;
    const moduleList = document.querySelectorAll(".sidebar-item");
    this.editMode = !this.editMode;
    moduleList.forEach((item) => {
      item.classList.toggle("orange");
    });
    if (this.editMode) {
      title.textContent = "Click Module To Edit";
    } else {
      title.textContent = "Modules";
    }
    addNewRepoTabBtn.classList.toggle("hidden");
  }

  openNewModule(modName, url) {
    mainPubSub.publish("addIframe", { manualUrl: url });
    mainPubSub.publish("addHeaderListItem", { moduleName: modName });
    mainPubSub.publish("tabChange", {
      iframeId: sharedIdCounter.getId(),
    });
    sharedIdCounter.incrementId();
  }

  sortSidebar() {
    const sidebarListElement = this.domElements.sidebarListElement;
    const sidebarList = Array.from(sidebarListElement.children);
    sidebarList.sort((a, b) => {
      a = a.textContent.toLowerCase();
      b = b.textContent.toLowerCase();
      if (a.includes("appendix") && b.includes("appendix")) {
        if (a.replace("appendix", "") < b.replace("appendix", "")) return -1;
        return 1;
      }
      if (a.includes("appendix")) return 1;
      if (b.includes("appendix")) return -1;
      if (a < b) return -1;
      return 1;
    });
    sidebarListElement.replaceChildren(...sidebarList);
  }

  filterSidebar(filterTerm) {
    const sidebarListElement = this.domElements.sidebarListElement;
    const filterTermCleaned = filterTerm.toLowerCase().trim();
    const sidebarListChildren = Array.from(sidebarListElement.children);
    if (filterTermCleaned === "") {
      this.render();
      return;
    }
    sidebarListChildren.forEach((ele) => {
      if (ele.textContent.toLowerCase().includes(filterTermCleaned)) {
        ele.classList.remove("hidden");
      } else {
        ele.classList.add("hidden");
      }
    });
  }
}

export default Sidebar;
