import mainPubSub from "./PubSub.js";
import sharedIdCounter from "./sharedIdCounter.js";

class IframeManager {
  constructor() {
    mainPubSub.subscribe("addIframe", this.createNewIframe.bind(this));
    mainPubSub.subscribe("removeIframe", this.removeIframeById.bind(this));
    mainPubSub.subscribe("tabChange", this.setIframeById.bind(this));
    return this;
  }

  domElements = {
    manualsDiv: document.querySelector(".manuals"),
    pageIframe: document.createElement("iframe"),
    currentIframe: document.querySelector(".current-iframe"),
  };

  setIframeById(pubsubData) {
    const currentIframe = this.domElements.currentIframe;
    if (Number.isInteger(pubsubData.iframeId)) {
      let nextIframe = this.getIframeById(pubsubData.iframeId);
      if (nextIframe === currentIframe) {
        this.toggleHidden(nextIframe);
      } else {
        this.hideIframe(currentIframe);
        this.showIframe(nextIframe);
        this.domElements.currentIframe = nextIframe;
      }
    }
  }

  changeIframe(iframeId) {
    const currentIframe = this.domElements.currentIframe;
    if (currentIframe) {
      this.hideIframe(currentIframe);
    }
    const newIframe = this.getIframeById(iframeId);
    this.domElements.currentIframe = newIframe;
  }

  createNewIframe(pubsubData) {
    const manualsDiv = this.domElements.manualsDiv;
    const newIframeId = sharedIdCounter.getId();
    let newIframe = document.createElement("iframe");
    newIframe.setAttribute("src", pubsubData.manualUrl);
    newIframe.setAttribute("data-iframe-id", newIframeId);
    newIframe.classList.add("hidden-iframe");

    manualsDiv.appendChild(newIframe);
    this.changeIframe(newIframeId);
  }

  removeIframeById(pubsubData) {
    this.getIframeById(pubsubData.iframeId).remove();
  }

  getIframeById(iframeId) {
    const manualsDiv = this.domElements.manualsDiv;
    return manualsDiv.querySelector(`[data-iframe-id="${iframeId}"]`);
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

export default IframeManager;
