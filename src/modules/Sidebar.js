import mainPubSub from "./PubSub.js";
import sharedIdCounter from "./sharedIdCounter.js";
const KTANE_TIMWI_URL = "https://ktane.timwi.de/";

class Sidebar {
  constructor(itemList = []) {
    this.sidebarItems = itemList;
    this.init();
    mainPubSub.subscribe("addNewModule", this.addSidebarItem.bind(this));
    return this;
  }

  domElements = {
    sidebarListElement: document.querySelector(".sidebar .module-list"),
    newRepoTabBtn: document.querySelector("#new-repo-tab-btn"),
    filter: document.querySelector("#filter"),
    filterClear: document.querySelector("#filter-clear"),
    sidebarSettings: document.querySelector(".cog-svg"),
    editModuleListBtn: document.querySelector("#edit-module-list-btn"),
    moduleListTitle: document.querySelector(".module-list-title"),
    addNewModuleBtn: document.querySelector("#add-new-module-btn"),
  };

  init() {
    this.importProjectsFromLocal();
    this.render();
    this.configureSidebarBtns();
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

  addSidebarItem(sidebarItem) {
    if (sidebarItem.moduleName === "") {
      const regex = /HTML\/([\w%20]+).html/;
      const regexResult = sidebarItem.manualUrl.match(regex);
      if (!regexResult) return;

      const regexName = regexResult[1].split("%20").join(" ");
      sidebarItem.moduleName = regexName;
    }
    this.sidebarItems.push(sidebarItem);
    this.localStorageAdd(sidebarItem);
    this.render();
  }

  removeSidebarItem(sidebarItem) {
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
      // Used to maintain red color when filter is cleared
      newSidebarListItem.classList.add("red");
    }
    newSidebarListItem.addEventListener("click", () => {
      if (this.editMode) {
        this.removeSidebarItem(newSidebarListItem);
      } else {
        this.openNewModule(sidebarItem.moduleName, sidebarItem.manualUrl);
      }
    });
    newSidebarListItem.textContent = sidebarItem.moduleName;
    sidebarListElement.appendChild(newSidebarListItem);
  }

  configureSidebarBtns() {
    const filter = this.domElements.filter;
    const filterClear = this.domElements.filterClear;
    const newRepoTabBtn = this.domElements.newRepoTabBtn;
    const editModuleListBtn = this.domElements.editModuleListBtn;
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
    newRepoTabBtn.addEventListener("click", () => {
      sharedIdCounter.incrementId();
      const newTabName = prompt("New Tab Name");
      if (!newTabName || newTabName === "") return;
      navigator.clipboard.writeText(newTabName);
      this.openNewModule(newTabName, KTANE_TIMWI_URL);
    });
    editModuleListBtn.addEventListener("click", () => this.toggleEditMode());
  }

  toggleEditMode() {
    const title = this.domElements.moduleListTitle;
    const addNewModuleBtn = this.domElements.addNewModuleBtn;
    const moduleList = document.querySelectorAll(".sidebar-item");
    this.editMode = !this.editMode;
    title.classList.toggle("red");
    addNewModuleBtn.classList.toggle("hidden");
    moduleList.forEach((item) => {
      item.classList.toggle("red");
    });
    if (this.editMode) {
      title.textContent = "DELETEING MODULES";
    } else {
      title.textContent = "Modules";
    }
  }

  openNewModule(modName, url) {
    mainPubSub.publish("addIframe", { manualUrl: url });
    mainPubSub.publish("addHeaderListItem", { moduleName: modName });
    mainPubSub.publish("tabChange", {
      moduleName: modName,
      iframeId: sharedIdCounter.getId(),
    });
    sharedIdCounter.incrementId();
  }

  sortSidebar() {
    const sidebarListElement = this.domElements.sidebarListElement;
    const sidebarList = Array.from(sidebarListElement.children);
    sidebarList.sort((a, b) => {
      if (a.textContent.toLowerCase().includes("appendix")) return 1;
      if (a.textContent.toLowerCase() < b.textContent.toLowerCase()) return -1;
      return 1;
    });
    sidebarListElement.replaceChildren(...sidebarList);
  }

  filterSidebar(filterTerm) {
    const sidebarListElement = this.domElements.sidebarListElement;
    const filterTermCleaned = filterTerm.toLowerCase().trim();
    if (filterTermCleaned === "") {
      this.render();
      return;
    }
    const sidebarListChildren = Array.from(sidebarListElement.children);

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
