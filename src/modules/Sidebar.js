import { DefaultPopup, NewDefaultPopup } from "./popup.js";
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
        new NewDefaultPopup(
          `Error processing the following URL: ${sidebarItem.manualUrl}`
        ).doPopup();
      }
    }

    const trimmedModName = sidebarItem.moduleName.trim();

    const existingSidebarItem = this.getSidebarItem(trimmedModName);
    if (existingSidebarItem) {
      if (skipDuplicates) {
        return "skipped";
      }
      new NewDefaultPopup(
        `${trimmedModName} already exists. Would you like to overwrite?`,
        [
          {
            type: "no-yes-btn-group",
          },
        ],
        () => {
          this.replaceSidebarItem(existingSidebarItem, sidebarItem);
          if (reRender) this.render();
        }
      ).doPopup();
    } else {
      this.sidebarItems.push(sidebarItem);
      this.localStorageAdd(sidebarItem);
      if (reRender) this.render();
    }
  }

  replaceSidebarItem(oldSidebarItem, newSidebarItem) {
    this.removeSidebarItemElement(oldSidebarItem);
    this.addSidebarItem(newSidebarItem, true, true);
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
        new NewDefaultPopup(
          "All of those modules are already known."
        ).doPopup();
      } else if (
        skippedItems.length <
        sidebarItemsList.length - skippedItems.length
      ) {
        new NewDefaultPopup(
          `The following items were duplicates and were skipped\n\n${skippedItems.join(", ")}`
        ).doPopup();
      } else {
        new NewDefaultPopup(
          `Those were mostly duplicates, But the follow were added:\n\n${addedItems.join(", ")}`
        ).doPopup();
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
        new NewDefaultPopup(
          "Edit Module",
          [
            {
              type: "group",
              schema: [
                {
                  type: "label",
                  forField: "url",
                  textContent: "Module URL",
                },
                {
                  type: "textInput",
                  name: "url",
                  id: "url",
                  value: sidebarItem.manualUrl,
                  autocomplete: "off",
                  required: true,
                },
                {
                  type: "label",
                  forField: "name",
                  textContent: "Module Name",
                },
                {
                  type: "textInput",
                  name: "name",
                  id: "name",
                  value: sidebarItem.moduleName,
                  autocomplete: "off",
                },
              ],
            },
            {
              type: "no-yes-btn-group",
              no: "Cancel",
              yes: "Edit",
            },
          ],
          (form) => {
            const formData = new FormData(form);
            this.replaceSidebarItem(newSidebarListItem, {
              moduleName: formData.get("name"),
              manualUrl: formData.get("url"),
            });
          },
          true
        ).doPopup();
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

    this.addNewModulePopup = new NewDefaultPopup(
      "Add New Module",
      [
        {
          type: "group",
          schema: [
            {
              type: "label",
              forField: "url",
              textContent: "Module URL",
            },
            {
              type: "textInput",
              name: "url",
              id: "url",
              placeholder: "https://ktane.timwi.de/HTML/Logic.html",
              autocomplete: "off",
              required: true,
            },
            {
              type: "label",
              forField: "name",
              textContent: "Module Name",
            },
            {
              type: "textInput",
              name: "name",
              id: "name",
              placeholder: "Logic",
              autocomplete: "off",
            },
          ],
        },
        {
          type: "group",
          classList: "form-btn-group",
          schema: [
            {
              type: "button",
            },
            {
              type: "button",
              btnType: "submit",
            },
          ],
        },
      ],
      (form) => {
        const formData = new FormData(form);
        this.addSidebarItem({
          moduleName: formData.get("name"),
          manualUrl: formData.get("url"),
        });
      }
    );

    this.nukePopup = new NewDefaultPopup(
      "Are you sure you want to DELETE ALL SAVED MODULE?\nThis is not reversable",
      [
        {
          type: "no-yes-btn-group",
          no: "Get me out of here",
          yes: "Yes, I know what I'm doing",
        },
      ],
      () => this.removeAllSidebarItems()
    );

    sidebarMenuSidebarBtn.addEventListener("click", () => {
      new NewDefaultPopup("Options", [
        {
          type: "group",
          schema: [
            {
              type: "button",
              btnType: "button",
              textContent: "Add new Module",
              listenerEvent: {
                trigger: "click",
                callback: () => this.addNewModulePopup.doPopup(),
              },
              classList: "add-new-module-btn",
            },
            {
              type: "button",
              btnType: "submit",
              textContent: this.editMode ? "Exit Edit Mode" : "Enter Edit Mode",
              listenerEvent: {
                trigger: "click",
                callback: () => this.toggleEditMode(),
              },
              classList: ["edit-mode-btn", this.editMode ? "orange" : null],
            },
            {
              type: "button",
              btnType: "submit",
              textContent: "Import Module List",
              listenerEvent: {
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
              classList: "import-modules-btn",
            },
            {
              type: "button",
              btnType: "submit",
              textContent: "Export Module List",
              listenerEvent: {
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
              classList: ["export-modules-btn"],
            },
            {
              type: "button",
              btnType: "submit",
              textContent: "Delete All Modules",
              listenerEvent: {
                trigger: "click",
                callback: () => this.nukePopup.doPopup(),
              },
              classList: "nuke-module-list-btn",
            },
          ],
          classList: "column-group",
        },
      ]).doPopup();
    });

    const newRepoTabPopup = new NewDefaultPopup(
      "Opening New KTANE.TIMEWI.DE Tab",
      [
        {
          type: "label",
          textContent: "New Tab Name",
          forField: "new-tab-input",
        },
        {
          type: "textInput",
          id: "new-tab-input",
          name: "new-tab-input",
        },
        {
          type: "no-yes-btn-group",
          yes: "Open",
        },
      ],
      (form) => {
        const formData = new FormData(form);
        const newTabName = formData.get("new-tab-input");
        if (!newTabName || newTabName === "") return;
        navigator.clipboard.writeText(newTabName);
        this.openNewModule(newTabName, KTANE_TIMWI_URL);
      }
    );
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
