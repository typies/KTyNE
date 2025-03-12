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

  // Ex: Silly Slots => Silly Slots
  // Ex: Bamboozling Button Grid => Bam. Butt. Grid
  shortenName(name) {
    const MAX_TITLE_LEN = 15;

    // Simple cases
    if (name.length < MAX_TITLE_LEN) return name;
    let nameParts = name.split(/[ -]/); // Split on (" " or "-")
    if (nameParts.length === 1) {
      return nameParts[0].slice(0, MAX_TITLE_LEN - 3) + "...";
    }

    // Advanced Cases (Needs Abbreviation)
    nameParts = nameParts.map((item) => item.replace("and", "&"));
    const ratio = Math.ceil(name.length / MAX_TITLE_LEN);
    nameParts.map((word) => word.slice(0, word.length / ratio - 1));
    nameParts.map((word) => word + ".");
    let longestWordLength = Math.max(...nameParts.map((name) => name.length));
    while (
      nameParts.join(" ").length > MAX_TITLE_LEN ||
      longestWordLength != 1
    ) {
      nameParts = nameParts.map((word) => {
        if (nameParts.join(" ").length <= MAX_TITLE_LEN) {
          return word; // Inside check to not cut off more letters than needed
        } else if (word.length >= longestWordLength) {
          console.log(word.slice(0, word.length - 2) + ".");
          return word.slice(0, word.length - 2) + "."; // This word is the longest -> Trim it down 1 letter
        }
        return word; // There are longest words, trim those first.
      });
      console.log(nameParts);
      longestWordLength--;
    }
    return nameParts.join(" ");
  }

  addHeaderListItem(pubsubData) {
    const headerList = this.dom.headerList;

    const newHeaderListItemId = sharedIdCounter.getId();
    const newHeaderListItem = document.createElement("li");
    newHeaderListItem.classList.add("open-module-list-item");
    newHeaderListItem.setAttribute("data-module-id", newHeaderListItemId);
    const headerText = document.createElement("span");
    const moduleName = pubsubData.moduleName;
    headerText.textContent = this.shortenName(moduleName);
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
        const formData = new FormData(form.element);
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
