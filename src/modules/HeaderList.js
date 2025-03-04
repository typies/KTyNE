import { BasicPopup } from "./popup.js";
import mainPubSub from "./PubSub.js";
import sharedIdCounter from "./sharedIdCounter.js";

class HeaderList {
  constructor() {
    mainPubSub.subscribe(
      "addHeaderListItem",
      this.addHeaderListItem.bind(this)
    );
    mainPubSub.subscribe("tabChange", this.reactToTabChange.bind(this));
    return this;
  }

  domElements = {
    headerList: document.querySelector(".open-modules-list"),
    currentlyHighlightedHeaderItem: null,
  };

  addHeaderListItem(pubsubData) {
    const headerList = this.domElements.headerList;
    const newHeaderListItemId = sharedIdCounter.getId();
    let newHeaderListItem = document.createElement("li");
    newHeaderListItem.classList.add("open-module-list-item");
    newHeaderListItem.setAttribute("data-module-id", newHeaderListItemId);
    newHeaderListItem.textContent = pubsubData.moduleName;

    // Left click
    newHeaderListItem.addEventListener("click", () => {
      mainPubSub.publish("tabChange", {
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
      new BasicPopup(
        `Renaming ${pubsubData.moduleName}`,
        "New name",
        "Submit",
        (popupInput) => {
          if (popupInput) {
            newHeaderListItem.textContent = popupInput;
            navigator.clipboard.writeText(popupInput);
            this.sortHeaderList();
          }
        }
      );
    });

    headerList.appendChild(newHeaderListItem);
    this.sortHeaderList();
  }

  sortHeaderList() {
    const headerList = this.domElements.headerList;
    const headerListChildren = Array.from(headerList.children);
    headerListChildren.sort((a, b) => {
      if (a.textContent.toLowerCase() < b.textContent.toLowerCase()) return -1;
      return 1;
    });
    headerList.replaceChildren(...headerListChildren);
  }

  closeHeaderListItem(headerListItemId) {
    const highlightedItem = this.domElements.currentlyHighlightedHeaderItem;
    const itemToRemove = this.getHeaderListItem(headerListItemId);
    if (itemToRemove === highlightedItem) {
      mainPubSub.publish("tabChange", {});
    }
    itemToRemove.remove();
    mainPubSub.publish("removeIframe", { iframeId: headerListItemId });
  }

  getHeaderListItem(headerListItemId) {
    const headerList = this.domElements.headerList;
    return headerList.querySelector(`[data-module-id="${headerListItemId}"]`);
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

export default HeaderList;
