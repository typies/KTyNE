import mainPubSub from "./PubSub.js";
import sharedIdCounter from "./sharedIdCounter.js";
const KTANE_TIMWI_URL = "https://ktane.timwi.de/";

class Sidebar {
  constructor(itemList = []) {
    this.sidebarItems = itemList;
    this.init();
    mainPubSub.subscribe("tabChange", this.reactToTabChange.bind(this));
    return this;
  }

  domElements = {
    sidebarListElement: document.querySelector(".sidebar .module-list"),
    addTabBtn: document.querySelector("#add-this-tab-btn"),
    newRepoTabBtn: document.querySelector("#new-repo-tab-btn"),
    filter: document.querySelector("#filter"),
    currentHeaderItem: document.querySelector(".current-header-item"),
    filterClear: document.querySelector("button.clear-filter"),
  };

  init() {
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
    this.sidebarItems.push(sidebarItem);
    this.render();
  }

  addSidebarItems(sidebarItems) {
    sidebarItems.forEach((sidebarItem) => {
      this.sidebarItems.push(sidebarItem);
    });
    this.render();
  }

  createSidebarLi(sidebarItem) {
    const sidebarListElement = this.domElements.sidebarListElement;
    const newSidebarListItem = document.createElement("li");
    newSidebarListItem.classList.add("sidebar-item");
    newSidebarListItem.addEventListener("click", () => {
      this.openNewModule(sidebarItem.moduleName, sidebarItem.manualUrl);
    });
    newSidebarListItem.textContent = sidebarItem.moduleName;
    sidebarListElement.appendChild(newSidebarListItem);
  }

  configureSidebarBtns() {
    const filter = this.domElements.filter;
    const filterClear = this.domElements.filterClear;
    const newRepoTabBtn = this.domElements.newRepoTabBtn;
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

  reactToTabChange(pubSubData) {
    const addTabBtn = this.domElements.addTabBtn;
    if (!pubSubData.moduleName || pubSubData.moduleName === "") {
      addTabBtn.classList.add("hidden");
      return;
    }
    const matchingSidebarItems = this.sidebarItems.filter(
      (item) =>
        item.moduleName.toLowerCase() === pubSubData.moduleName.toLowerCase()
    );
    if (matchingSidebarItems.length === 0) {
      addTabBtn.classList.remove("hidden");
    } else {
      addTabBtn.classList.add("hidden");
    }
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
