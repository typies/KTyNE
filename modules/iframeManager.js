import mainPubSub from "./PubSub.js";

class IframeManager {
  #idCounter = 0;
  constructor() {
    mainPubSub.subscribe("addIframe", this.createNewIframe.bind(this));
    mainPubSub.subscribe("removeIframe", this.removeIframeById.bind(this));
    mainPubSub.subscribe("tabChange", this.setIframeById.bind(this));
  }

  domElements = {
    manualsDiv: document.querySelector(".manuals"),
    pageIframe: document.createElement("iframe"),
    currentIframe: document.querySelector(".current-iframe"),
  };

  setIframeById(pubsubData) {
    if (Number.isInteger(pubsubData.iframeId)) {
      let nextIframe = this.getIframeById(pubsubData.iframeId);
      if (nextIframe === this.domElements.currentIframe) {
        this.toggleHidden(nextIframe);
      } else {
        this.hideIframe(this.domElements.currentIframe);
        this.showIframe(nextIframe);
        this.domElements.currentIframe = nextIframe;
      }
    }
  }

  changeIframe(iframeId) {
    if (this.domElements.currentIframe) {
      this.hideIframe(this.domElements.currentIframe);
    }
    const newIframe = this.getIframeById(iframeId);
    this.domElements.currentIframe = newIframe;
  }

  createNewIframe(pubsubData) {
    const newIframeId = this.#idCounter++;
    let newIframe = document.createElement("iframe");
    newIframe.setAttribute("src", pubsubData.manualUrl);
    newIframe.setAttribute("data-iframe-id", newIframeId);
    newIframe.classList.add("hidden-iframe");

    this.domElements.manualsDiv.appendChild(newIframe);
    this.changeIframe(newIframeId);
  }

  removeIframeById(pubsubData) {
    this.getIframeById(pubsubData.iframeId).remove();
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

export default new IframeManager();
