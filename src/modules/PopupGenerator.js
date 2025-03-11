class HtmlElement {
  constructor(htmlTag = "div", children = [], textContent, classList = []) {
    Object.assign(this, {
      htmlTag,
      children,
      textContent,
      classList,
    });
    if (this.classList)
      this.classList = this.asArray(this.classList).filter((c) => c !== "");
    if (this.children) this.children = this.asArray(this.children);
    this.createHtmlElement();
    return this;
  }

  asArray(arrOrSingle) {
    const arr = Array.isArray(arrOrSingle) ? arrOrSingle : [arrOrSingle];
    return arr;
  }

  createHtmlElement() {
    try {
      this.element = document.createElement(this.htmlTag);
      this.element.textContent = this.textContent;
      if (this.children && this.children.length > 0)
        this.children.forEach((child) => this.element.appendChild(child));
      this.element.classList.add(...this.classList);
      return this.element;
    } catch (e) {
      console.error(e);
      console.warn(
        "Check HtmlFormElement/Children. New ones may need .element before element is used."
      );
    }
  }

  addChild(newChild, insertIndex = this.element.children.length) {
    if (insertIndex != 0) {
      this.element.children[insertIndex - 1].after(newChild);
    } else {
      this.element.replaceChildren(newChild, ...this.children);
    }
    this.children.splice(insertIndex, 0, newChild);
    return this.divWrapper;
  }
}

class DivWrapperEle extends HtmlElement {
  constructor(children, classList = ["column-group"]) {
    super("div", children, null, classList);
    return this;
  }
}

class OverlayElement extends DivWrapperEle {
  constructor(form, classList, stopClickClose) {
    super(form, classList);
    const hide = () => document.body.removeChild(this.element);
    if (!stopClickClose) this.element.addEventListener("click", hide);
    this.element.addEventListener("submit", (event) => {
      event.preventDefault();
      hide();
    });
    return this;
  }
}

class FormElement extends HtmlElement {
  constructor(
    title,
    children = [],
    submitCallback,
    classList = [],
    action,
    novalidate,
    stopClickPropagation = true,
    preventDefault = true
  ) {
    super("form", children, null, classList);
    Object.assign(this, {
      title,
      children,
      submitCallback,
      classList,
      action,
      novalidate,
      stopClickPropagation,
      preventDefault,
    });
    this.createFormElement();
    return this;
  }

  createFormElement() {
    if (this.title) this.addChild(this.title, 0);
    if (this.action) this.element.action = this.action;
    if (this.novalidate) this.element.novalidate = this.novalidate;
    if (this.stopClickPropagation)
      this.element.addEventListener("click", (event) =>
        event.stopPropagation()
      );
    this.element.addEventListener("submit", (event) => {
      if (this.preventDefault) event.preventDefault();
      if (this.submitCallback) this.submitCallback(this);
    });
    return this.element;
  }
}

class LabelElement extends HtmlElement {
  constructor(textContent, forField, classList = ["label"]) {
    super("label", [], textContent, classList);
    Object.assign(this, {
      textContent,
      forField,
      classList,
    });
    this.createLabelElement();
    return this;
  }

  createLabelElement() {
    if (this.forField) this.element.setAttribute("for", this.forField);
    return this.element;
  }
}

class InputElement extends HtmlElement {
  constructor(
    type = "text",
    name,
    id,
    classList = [],
    value,
    placeholder,
    autocomplete,
    required,
    oninputCallback = null,
    accept,
    listenerEvent,
    minlength,
    maxlength,
    min,
    max,
    fitcontent
  ) {
    super("input", [], null, classList);
    Object.assign(this, {
      type,
      name,
      id,
      classList,
      value,
      placeholder,
      autocomplete,
      required,
      oninputCallback,
      accept,
      listenerEvent,
      minlength,
      maxlength,
      min,
      max,
      fitcontent,
    });
    this.createInputElement();
    return this;
  }

  createInputElement() {
    if (this.type) this.element.type = this.type;
    if (this.name) this.element.name = this.name;
    if (this.value) this.element.value = this.value;
    if (this.id || this.name) this.element.id = this.id || `${this.name}-id`;
    if (this.autocomplete) this.element.autocomplete = this.autocomplete;
    if (this.placeholder) this.element.placeholder = this.placeholder;
    if (this.accept) this.element.accept = this.accept;
    if (this.required) this.element.required = this.required;
    if (this.oninputCallback)
      this.element.addEventListener("input", this.oninputCallback);
    if (this.listenerEvent)
      this.element.addEventListener(this.listenerEvent.trigger, () =>
        this.listenerEvent.callback(this)
      );
    if (this.minlength) this.element.minLength = this.minlength;
    if (this.maxlength) this.element.maxLength = this.maxlength;
    if (this.min) this.element.min = this.min;
    if (this.max) this.element.max = this.max;
    if (this.fitcontent)
      this.element.style.width = this.element.value.length + 2 + "ch";
    return this.element;
  }
}

class ButtonElement extends HtmlElement {
  constructor(
    textContent, // Default = "Close" or "Submit" if type = "submit"
    listenerEvent, // Default click & close closest form/overlay, unless submit btn
    type, // Default = "close" or "submit" if textContent = "submit"
    classList = []
  ) {
    super("button", [], textContent, classList);
    Object.assign(this, {
      textContent,
      listenerEvent,
      type,
      classList,
    });
    if (!this.type || this.type === "") this.setDefaultType();
    if (!this.textContent || this.textContent === "")
      this.setDefaultTextContent();
    if (!this.listenerEvent) this.setDefaultListenerEvent();
    this.createButtonElement();
    return this;
  }

  setDefaultType() {
    this.type = this.textContent === "sumbit" ? "submit" : "button";
  }

  setDefaultTextContent() {
    this.textContent = this.type === "submit" ? "Submit" : "Close";
  }

  setDefaultListenerEvent() {
    this.listenerEvent = {
      trigger: "click",
      callback: () => {
        const parentForm = this.element.closest("form");
        const parentOverlay = this.element.closest(".popup-overlay");
        if (this.type === "button") {
          document.body.removeChild(parentOverlay);
        } else if (this.type === "submit") {
          parentForm.requestSubmit();
        }
      },
    };
  }

  createButtonElement() {
    if (this.textContent) this.element.textContent = this.textContent; // Super will not call default functions
    if (this.type) this.element.type = this.type;
    if (this.listenerEvent)
      this.element.addEventListener(this.listenerEvent.trigger, () =>
        this.listenerEvent.callback(this)
      );
    return this.element;
  }
}

class ContenteditableDivElement extends HtmlElement {
  constructor(
    textContent,
    classList = [],
    spellcheck = "false",
    autocomplete = "off"
  ) {
    super("div", [], textContent, classList);
    Object.assign(this, {
      textContent,
      classList,
      spellcheck,
      autocomplete,
    });
    this.createContenteditableDivElement();
    return this;
  }

  createContenteditableDivElement() {
    this.element.setAttribute("contenteditable", "");
    this.element.textContent = this.textContent;
    this.element.setAttribute("spellcheck", this.spellcheck);
    this.element.setAttribute("autcomplete", this.autocomplete);
    return this.element;
  }
}

class PopupGenerator {
  constructor(
    title,
    schema = [
      {
        type: "group",
        schema: [{ type: "button" }],
        classList: "form-btn-group",
      },
    ],
    formSubmit,
    dontReset = false
  ) {
    Object.assign(this, {
      title,
      formSubmit,
      dontReset,
    });

    this.form = new FormElement(
      new HtmlElement("div", [], this.title, "title").element,
      this.parseSchema(schema),
      (data) => {
        if (this.formSubmit) this.formSubmit(data);
        if (!this.dontReset) data.element.reset();
      },
      "form"
    ).element;
    this.popup = new OverlayElement(this.form, "popup-overlay");
    this.popup.element.addEventListener("submit", (event) =>
      event.preventDefault()
    );
    this.form.addEventListener("submit", (event) => event.preventDefault());
  }

  parseSchema(schema) {
    if (!schema || schema.length === 0) return [];
    return schema.map((si) => {
      if (si.type === "group") {
        const groupChildren = this.parseSchema(si.schema);
        return new DivWrapperEle(groupChildren, si.classList).element;
      }
      if (si.type === "div") {
        return new HtmlElement("div", [], si.textContent, si.classList).element;
      }
      if (si.type === "button") {
        return new ButtonElement(
          si.textContent,
          si.listenerEvent,
          si.btnType,
          si.classList
        ).element;
      }
      if (si.type === "textInput") {
        return new InputElement(
          "input",
          si.name,
          si.id,
          si.classList,
          si.value,
          si.placeholder,
          si.autocomplete,
          si.required,
          si.oninputCallback,
          si.accept,
          si.listenerEvent,
          si.minlength,
          si.maxlength,
          si.min,
          si.max,
          si.fitcontent
        ).element;
      }
      if (si.type === "numberInput") {
        return new InputElement(
          "number",
          si.name,
          si.id,
          si.classList,
          si.value,
          si.placeholder,
          si.autocomplete,
          si.required,
          si.oninputCallback,
          si.accept,
          si.listenerEvent,
          si.minlength,
          si.maxlength,
          si.min,
          si.max
        ).element;
      }
      if (si.type === "label") {
        return new LabelElement(si.textContent, si.forField, si.classList)
          .element;
      }
      if (si.type === "close-btn") {
        const groupChildren = this.parseSchema([
          {
            type: "group",
            schema: [
              {
                type: "button",
                textContent: si.textContent,
              },
            ],
            classList: "form-btn-group",
          },
        ]);
        return new DivWrapperEle(groupChildren, si.classList).element;
      }
      if (si.type === "no-yes-btn-group") {
        const groupChildren = this.parseSchema([
          {
            type: "group",
            schema: [
              {
                type: "button",
                textContent: si.no || "No",
                classList: si.noClassList,
              },
              {
                type: "button",
                btnType: "submit",
                textContent: si.yes || "Yes",
                classList: si.yesClassList,
              },
            ],
            classList: "form-btn-group",
          },
        ]);
        return new DivWrapperEle(groupChildren, si.classList).element;
      }
      if (si.type === "no-reset-yes-btn-group") {
        const groupChildren = this.parseSchema([
          {
            type: "group",
            schema: [
              {
                type: "button",
                textContent: si.no || "No",
                classList: si.noClassList,
              },
              {
                type: "button",
                textContent: si.reset || "Reset",
                listenerEvent: si.resetCallback || {
                  trigger: "click",
                  callback: () => {
                    this.form.reset();
                    const firstInput = this.form.querySelector("input");
                    if (firstInput) firstInput.select();
                  },
                },
                classList: si.resetClassList,
              },
              {
                type: "button",
                btnType: "submit",
                textContent: si.yes || "Yes",
                classList: si.yesClassList,
              },
            ],
            classList: "form-btn-group",
          },
        ]);
        return new DivWrapperEle(groupChildren, si.classList).element;
      }
      if (si.type === "contenteditableDiv") {
        return new ContenteditableDivElement(
          si.textContent,
          si.classList,
          si.spellcheck,
          si.autocomplete
        ).element;
      }
      if (si.type === "fileInput") {
        return new InputElement(
          "file",
          si.name,
          si.id,
          si.classList,
          si.value,
          si.placeholder,
          si.autocomplete,
          si.required,
          si.oninputCallback,
          si.accept,
          si.listenerEvent
        ).element;
      }
      if (si.type === "default-manual-btn-group") {
        const sortedBtns = this.btnSort(si.btnTextList);
        const btnNames = sortedBtns.map((btn) => this.trimUrl(btn));
        const btnEles = btnNames.map(
          (btn) =>
            new ButtonElement(
              btn,
              {
                trigger: "click",
                callback: (data) => {
                  this.formSubmit(
                    sortedBtns[btnNames.indexOf(data.textContent)]
                  );
                  const parentOverlay = data.element.closest(".popup-overlay");
                  document.body.removeChild(parentOverlay);
                },
              },
              "button",
              [
                "manual-choice-btn",
                btn === this.trimUrl(si.currentDefault) ? "green" : "",
              ]
            ).element
        );
        return new DivWrapperEle(btnEles, "manual-choices-group").element;
      }

      throw Error(
        "Bad form schema, could not be parsed. Missed si.type: " + si.type
      );
    });
  }

  trimUrl(url) {
    const URL_PREFIX = "https://ktane.timwi.de/HTML/";
    return decodeURIComponent(url).replace(URL_PREFIX, "").replace(".html", "");
  }

  btnSort(btns) {
    const sorted = btns.sort();
    return [sorted.at(-1), ...sorted.slice(0, -1)];
  }

  doPopup() {
    document.body.appendChild(this.popup.element);
    if (!this.dontReset) this.form.reset();
    const anyInput = this.popup.element.querySelector("input");
    if (anyInput) anyInput.select();
  }
}

export default PopupGenerator;
