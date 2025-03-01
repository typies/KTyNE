import mainPubSub from "./PubSub.js";
const KTANE_TIMWI_URL = "https://ktane.timwi.de/";

class Sidebar {
  constructor(itemList = []) {
    if (!itemList) {
      this.sidebarItems = [];
    }
    this.sidebarItems = itemList;
    mainPubSub.subscribe("tabChange", this.reactToTabChange.bind(this));
    this.init();
  }

  domElements = {
    sidebarListElement: document.querySelector(".sidebar .module-list"),
    addTabBtn: document.querySelector("#add-this-tab-btn"),
    newRepoTabBtn: document.querySelector("#new-repo-tab-btn"),
    filter: document.querySelector("#filter"),
    currentHeaderItem: document.querySelector(".current-header-item"),
  };

  init() {
    this.render();
    this.configureSidebarBtns();
  }

  render() {
    this.domElements.sidebarListElement.replaceChildren();
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
    let newSidebarListItem = document.createElement("li");
    newSidebarListItem.classList.add("sidebar-item");

    newSidebarListItem.textContent = sidebarItem.moduleName;
    this.domElements.sidebarListElement.appendChild(newSidebarListItem);
    newSidebarListItem.addEventListener("click", () => {
      mainPubSub.publish("addIframe", { manualUrl: sidebarItem.manualUrl });
      mainPubSub.publish("addHeaderListItem", {
        moduleName: sidebarItem.moduleName,
      });
    });
  }

  configureSidebarBtns() {
    const filterClear = document.querySelector("button.clear-filter");
    this.domElements.filter.addEventListener("keyup", () => {
      this.filterSidebar(filter.value);
    });
    filterClear.addEventListener("click", () => {
      this.domElements.filter.value = "";
      this.filterSidebar("");
    });
    this.domElements.newRepoTabBtn.addEventListener("click", () => {
      const newTabName = prompt("New Tab Name");
      if (!newTabName || newTabName === "") return;
      navigator.clipboard.writeText(newTabName);
      mainPubSub.publish("addIframe", { manualUrl: KTANE_TIMWI_URL });
      mainPubSub.publish("addHeaderListItem", { moduleName: newTabName });
    });
  }

  reactToTabChange(pubSubData) {
    if (!pubSubData.moduleName || pubSubData.moduleName === "") {
      this.domElements.addTabBtn.classList.add("hidden");
      return;
    }
    const matchingSidebarItems = this.sidebarItems.filter(
      (item) =>
        item.moduleName.toLowerCase() === pubSubData.moduleName.toLowerCase()
    );
    if (matchingSidebarItems.length === 0) {
      this.domElements.addTabBtn.classList.remove("hidden");
    } else {
      this.domElements.addTabBtn.classList.add("hidden");
    }
  }

  sortSidebar() {
    const sidebarList = Array.from(
      this.domElements.sidebarListElement.children
    );
    sidebarList.sort((a, b) => {
      if (a.textContent.toLowerCase().includes("appendix")) return 1;
      if (a.textContent.toLowerCase() < b.textContent.toLowerCase()) return -1;
      return 1;
    });
    this.domElements.sidebarListElement.replaceChildren(...sidebarList);
  }

  filterSidebar(filterTerm) {
    const filterTermCleaned = filterTerm.toLowerCase().trim();
    if (filterTermCleaned === "") {
      this.render();
      return;
    }
    const sidebarList = Array.from(
      this.domElements.sidebarListElement.children
    );

    sidebarList.forEach((ele) => {
      if (ele.textContent.toLowerCase().includes(filterTermCleaned)) {
        ele.classList.remove("hidden");
      } else {
        ele.classList.add("hidden");
      }
    });
  }
}

export default new Sidebar();
