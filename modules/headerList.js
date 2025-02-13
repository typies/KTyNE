import pageIframeManager from "./iframeManager.js";

class HeaderList {
    #idCounter = 0;
    constructor(openModules) {
        if (!this.openModules) {
            this.openModules = [];
        }
        this.openModules = openModules;
    }

    domElements = {
        headerList: document.querySelector(".open-modules-list"),
    };

    addHeaderListItem(module) {
        this.openModules.push(module);
        let newHeaderListItem = document.createElement("li");
        newHeaderListItem.classList.add("open-module-list-item");
        newHeaderListItem.setAttribute("data-module-index", this.#idCounter++);
        let newListItemImg = document.createElement("img");
        newListItemImg.setAttribute("src", module.imageUrl);
        newListItemImg.classList.add("header-list-item-img");

        let headerListText = document.createElement("div");
        headerListText.classList.add("header-list-item");
        headerListText.textContent = module.moduleName;

        let moduleIndex = newHeaderListItem.getAttribute("data-module-index");
        newHeaderListItem.addEventListener("mousedown", (event) => {
            switch (event.button) {
                case 0:
                    pageIframeManager.changeIFrame(moduleIndex);
                    break;
                case 1:
                    // Middle mouse click close
                    this.openModules.splice(
                        this.openModules.indexOf(module),
                        1
                    );
                    newHeaderListItem.remove();
                    pageIframeManager.removeIframe(moduleIndex);
                    break;
            }
        });

        newHeaderListItem.appendChild(newListItemImg);
        newHeaderListItem.appendChild(headerListText);
        this.domElements.headerList.appendChild(newHeaderListItem);
    }

    render() {
        this.domElements.headerList.textContent = "";
        this.openModules.forEach((module) => {
            addHeaderListItem(module);
        });
    }
}

const pageHeaderList = new HeaderList([]);
export default pageHeaderList;
