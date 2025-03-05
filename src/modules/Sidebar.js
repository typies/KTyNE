import { TempPopup } from "./popup.js";
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
    newRepoTabBtn: document.querySelector("#new-repo-tab-btn"),
    filter: document.querySelector("#filter"),
    filterClear: document.querySelector("#filter-clear"),
    sidebarSettings: document.querySelector(".cog-svg"),
    editModeBtn: document.querySelector("#edit-mode-btn"),
    moduleListTitle: document.querySelector(".module-list-title"),
    nukeModulesBtn: document.querySelector("#nuke-module-list-btn"),
    collapseSidebarBtn: document.querySelector("#collapse-sidebar-btn"),
    sidebarMenuSidebarBtn: document.querySelector("#options-btn"),
    sidebarMenu: document.querySelector("#sidebar-options-menu"),
    addOneBtn: document.querySelector("#add-one-btn"),
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
        new TempPopup(
          `Error processing the following URL: ${sidebarItem.manualUrl}`
        );
      }
    }

    const trimmedModName = sidebarItem.moduleName.trim();

    const existingSidebarItem = this.getSidebarItem(trimmedModName);
    if (existingSidebarItem) {
      if (skipDuplicates) {
        return trimmedModName; // Skipped
      }
      new TempPopup(
        `${trimmedModName} already exists. Would you like to overwrite?`,
        null,
        "Yes",
        () => {
          const removeItem = this.getSidebarItemElement(trimmedModName);
          this.removeSidebarItemElement(removeItem);
          this.sidebarItems.push(sidebarItem);
          this.localStorageAdd(sidebarItem);
          if (reRender) this.render();
        },
        "No"
      );
    } else {
      this.sidebarItems.push(sidebarItem);
      this.localStorageAdd(sidebarItem);
      if (reRender) this.render();
    }
  }

  addSidebarItems(sidebarItemsList) {
    const skippedItems = [];
    sidebarItemsList.forEach((sidebarItem) => {
      const newSidebarItemFormatted = {
        moduleName: sidebarItem.name,
        manualUrl: sidebarItem.url,
      };
      const skipped = this.addSidebarItem(newSidebarItemFormatted, false, true);
      if (skipped) skippedItems.push(skipped);
    });
    this.render();
    if (skippedItems.length > 0) {
      new TempPopup(
        `The following items were duplicates and were skipped
        
        ${skippedItems.join(", ")}`
      );
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
    const editModeBtn = this.domElements.editModeBtn;
    const collapseSidebarBtn = this.domElements.collapseSidebarBtn;
    const addOneBtn = this.domElements.addOneBtn;
    const sidebarMenuSidebarBtn = this.domElements.sidebarMenuSidebarBtn;
    const sidebarMenu = this.domElements.sidebarMenu;
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
    sidebarMenuSidebarBtn.addEventListener("click", () => {
      sidebarMenu.classList.toggle("hidden");
    });
    newRepoTabBtn.addEventListener("click", () => {
      new TempPopup(
        "Opening New KTANE.TIMEWI.DE Tab",
        "New Tab Name",
        "Open",
        (newTabName) => {
          if (!newTabName || newTabName === "") return;
          navigator.clipboard.writeText(newTabName);
          this.openNewModule(newTabName, KTANE_TIMWI_URL);
        }
      );
    });
    editModeBtn.addEventListener("click", () => this.toggleEditMode());
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
    const sidebarMenu = this.domElements.sidebarMenu;
    const editModeBtn = this.domElements.editModeBtn;
    sidebarMenu.classList.toggle("hidden");
    const moduleList = document.querySelectorAll(".sidebar-item");
    this.editMode = !this.editMode;
    moduleList.forEach((item) => {
      item.classList.toggle("orange");
    });
    editModeBtn.classList.toggle("orange");
    if (this.editMode) {
      editModeBtn.textContent = "Exit Edit Mode";
      title.textContent = "Click Module To Edit";
      addNewRepoTabBtn.classList.toggle("hidden");
    } else {
      editModeBtn.textContent = "Enter Edit Mode";
      title.textContent = "Modules";
      addNewRepoTabBtn.classList.toggle("hidden");
    }
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
