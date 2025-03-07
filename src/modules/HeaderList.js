import PopupGenerator from "./PopupGenerator.js";
import mainPubSub from "./PubSub.js";
import sharedIdCounter from "./sharedIdCounter.js";

class HeaderList {
  constructor() {
    mainPubSub.subscribe(
      "addHeaderListItem",
      this.addHeaderListItem.bind(this)
    );
    mainPubSub.subscribe(
      "addHeaderItemClass",
      this.addHeaderItemClass.bind(this)
    );
    mainPubSub.subscribe(
      "removeHeaderItemClass",
      this.removeHeaderItemClass.bind(this)
    );
    return this;
  }

  dom = {
    headerList: document.querySelector(".open-modules-list"),
  };

  addHeaderListItem(pubsubData) {
    const headerList = this.dom.headerList;

    const newHeaderListItemId = sharedIdCounter.getId();
    const newHeaderListItem = document.createElement("li");
    newHeaderListItem.classList.add("open-module-list-item");
    newHeaderListItem.setAttribute("data-module-id", newHeaderListItemId);
    const headerText = document.createElement("span");
    headerText.textContent = pubsubData.moduleName;
    const tabClose = document.createElement("span");
    tabClose.classList.add("close-btn");
    tabClose.textContent = "x";
    newHeaderListItem.append(headerText);
    newHeaderListItem.append(tabClose);

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
    tabClose.addEventListener("click", (event) => {
      event.stopPropagation();
      this.closeHeaderListItem(newHeaderListItemId);
    });
    // Right Click( Rename header items instead of opening context menu)
    const renamePopup = new PopupGenerator(
      `Renaming ${headerText.textContent}`,
      [
        {
          type: "textInput",
          name: "rename",
          placeholder: headerText.textContent,
          autocomplete: "off",
        },
        {
          type: "no-yes-btn-group",
          no: "Cancel",
          yes: "Rename",
        },
      ],
      (form) => {
        const formData = new FormData(form);
        const newName = formData.get("rename");
        headerText.textContent = newName;
        navigator.clipboard.writeText(newName);
        this.sortHeaderList();
      }
    );
    newHeaderListItem.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      renamePopup.doPopup();
    });

    headerList.appendChild(newHeaderListItem);
    this.sortHeaderList();
  }

  sortHeaderList() {
    const headerList = this.dom.headerList;
    const headerListChildren = Array.from(headerList.children);
    headerListChildren.sort((a, b) => {
      if (a.textContent.toLowerCase() < b.textContent.toLowerCase()) return -1;
      return 1;
    });
    headerList.replaceChildren(...headerListChildren);
  }

  closeHeaderListItem(headerListItemId) {
    const highlightedItems = document.querySelectorAll("current-header-item");
    const itemToRemove = this.getHeaderListItem(headerListItemId);
    if (Array.from(highlightedItems).includes(itemToRemove)) {
      this.removeHeaderItemClass({ headerListItemId });
    }
    itemToRemove.remove();
    mainPubSub.publish("removeIframe", { iframeId: headerListItemId });
  }

  getHeaderListItem(headerListItemId) {
    const headerList = this.dom.headerList;
    return headerList.querySelector(`[data-module-id="${headerListItemId}"]`);
  }

  addHeaderItemClass(pubsubData) {
    const itemToHighlight = this.getHeaderListItem(pubsubData.headerListItemId);
    if (itemToHighlight) itemToHighlight.classList.add(pubsubData.headerClass);
  }

  removeHeaderItemClass(pubsubData) {
    const itemToDehighlight = this.getHeaderListItem(
      pubsubData.headerListItemId
    );
    if (itemToDehighlight)
      itemToDehighlight.classList.remove(pubsubData.headerClass);
  }
}

export default HeaderList;
