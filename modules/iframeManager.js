class IframeManager {
  #idCounter = 0;
  constructor() {}

  domElements = {
    manualsDiv: document.querySelector(".manuals"),
    pageIframe: document.createElement("iframe"),
    currentIframe: document.querySelector(".current-iframe"),
  };

  setIframeById(iframeId) {
    let nextIframe = this.getIframeById(iframeId);
    if (nextIframe === this.domElements.currentIframe) {
      this.toggleHidden(nextIframe);
    } else {
      this.hideIframe(this.domElements.currentIframe);
      this.showIframe(nextIframe);
      this.domElements.currentIframe = nextIframe;
    }
  }

  createNewIframe(link) {
    if (this.domElements.currentIframe) {
      this.hideIframe(this.domElements.currentIframe);
    }

    let newIframe = document.createElement("iframe");
    newIframe.setAttribute("src", link);
    newIframe.setAttribute("data-iframe-id", this.#idCounter++);
    newIframe.classList.add("current-iframe");

    this.domElements.manualsDiv.appendChild(newIframe);
    this.domElements.currentIframe = newIframe;
  }

  removeIframeById(iframeId) {
    this.getIframeById(iframeId).remove();
  }

  getIframeById(iframeId) {
    return this.domElements.manualsDiv.querySelector(
      `[data-iframe-id="${iframeId}"]`
    );
  }

  toggleHidden(iframe) {
    if (iframe.classList.contains("hidden-iframe")) {
      this.showIframe(iframe);
    } else {
      this.hideIframe(iframe);
    }
  }

  showIframe(iframe) {
    iframe.classList.remove("hidden-iframe");
    iframe.classList.add("current-iframe");
  }

  hideIframe(iframe) {
    iframe.classList.remove("current-iframe");
    iframe.classList.add("hidden-iframe");
  }
}

const pageIframeManager = new IframeManager();
export default pageIframeManager;
