import mainPubSub from "./PubSub.js";

class HeaderList {
  constructor() {
    mainPubSub.subscribe(
      "addHeaderListItem",
      this.addHeaderListItem.bind(this)
    );
    mainPubSub.subscribe("tabChange", this.reactToTabChange.bind(this));
  }

  #idCounter = 0;

  domElements = {
    headerList: document.querySelector(".open-modules-list"),
    currentlyHighlightedHeaderItem: null,
  };

  addHeaderListItem(pubsubData) {
    const newHeaderListItemId = this.#idCounter++;

    let newHeaderListItem = document.createElement("li");
    newHeaderListItem.classList.add("open-module-list-item");
    newHeaderListItem.setAttribute("data-module-id", newHeaderListItemId);
    newHeaderListItem.textContent = pubsubData.moduleName;

    // Left click
    newHeaderListItem.addEventListener("click", (event) => {
      mainPubSub.publish("tabChange", {
        moduleName: pubsubData.moduleName,
        iframeId: newHeaderListItemId,
      });
    });
    // Middle Click (Separate 'auxclick' listener so full mouse press is used instead of only up or down)
    newHeaderListItem.addEventListener("auxclick", (event) => {
      if (event.button == 1) {
        this.closeHeaderListItem(newHeaderListItemId);
      }
    });
    // Right Click( Rename header items instead of opening context menu)
    newHeaderListItem.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      this.headerItemRename(newHeaderListItemId);
    });

    this.domElements.headerList.appendChild(newHeaderListItem);
    this.sortHeaderList();
    mainPubSub.publish("tabChange", {
      moduleName: pubsubData.moduleName,
      iframeId: newHeaderListItemId,
    });
  }

  sortHeaderList() {
    const headerList = Array.from(this.domElements.headerList.children);
    headerList.sort((a, b) => {
      if (a.textContent.toLowerCase() < b.textContent.toLowerCase()) return -1;
      return 1;
    });
    this.domElements.headerList.replaceChildren(...headerList);
  }

  closeHeaderListItem(headerListItemId) {
    const itemToRemove = this.getHeaderListItem(headerListItemId);
    if (itemToRemove === this.domElements.currentlyHighlightedHeaderItem) {
      mainPubSub.publish("tabChange", {});
    }
    itemToRemove.remove();
    mainPubSub.publish("removeIframe", { iframeId: headerListItemId });
  }

  getHeaderListItem(headerListItemId) {
    return this.domElements.headerList.querySelector(
      `[data-module-id="${headerListItemId}"]`
    );
  }

  headerItemRename(headerListItemId) {
    const headerItem = this.getHeaderListItem(headerListItemId);
    const renameInput = prompt(`Renaming ${headerItem.textContent}`);
    if (renameInput) {
      headerItem.textContent = renameInput;
      navigator.clipboard.writeText(renameInput);
      this.sortHeaderList();
    }
  }

  reactToTabChange(pubsubData) {
    if (Number.isInteger(pubsubData.iframeId))
      this.changeHighlightedHeaderItem(pubsubData.iframeId);
  }

  changeHighlightedHeaderItem(headerListItemId) {
    const itemToHighlight = this.getHeaderListItem(headerListItemId);
    const itemHighlighted = this.domElements.currentlyHighlightedHeaderItem;
    if (itemHighlighted) {
      itemHighlighted.classList.remove("current-header-item");
    }

    if (itemToHighlight === itemHighlighted) {
      // Unselect, selected tab - No highlight
      this.domElements.currentlyHighlightedHeaderItem = null;
    } else {
      itemToHighlight.classList.add("current-header-item");
      this.domElements.currentlyHighlightedHeaderItem = itemToHighlight;
    }
  }
}

const pageHeaderList = new HeaderList([]);
export default pageHeaderList;
