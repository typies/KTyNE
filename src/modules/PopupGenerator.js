class HtmlElement {
  constructor(htmlTag = "div", children = [], textContent, classList = []) {
    Object.assign(this, {
      htmlTag,
      children,
      textContent,
      classList,
    });
    if (this.classList) this.classList = this.asArray(this.classList);
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
      if (this.children)
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
    if (this.submitCallback) {
      this.element.addEventListener("submit", (event) => {
        if (this.preventDefault) event.preventDefault();
        this.submitCallback(this);
      });
    }
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
    listenerEvent
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
    autocomplete = "false"
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
        data.element.reset();
      },
      "form"
    ).element;

    this.popup = new OverlayElement(this.form, "popup-overlay");
  }

  parseSchema(schema) {
    if (!schema || schema.length === 0) return [];
    return schema.map((si) => {
      if (si.type === "group") {
        const groupChildren = this.parseSchema(si.schema);
        return new DivWrapperEle(groupChildren, si.classList).element;
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
          si.listenerEvent
        ).element;
      }
      if (si.type === "label") {
        return new LabelElement(si.textContent, si.forField, si.classList)
          .element;
      }
      if (si.type === "no-yes-btn-group") {
        const groupChildren = this.parseSchema([
          {
            type: "group",
            schema: [
              {
                type: "button",
                textContent: si.no || "No",
              },
              {
                type: "button",
                btnType: "submit",
                textContent: si.yes || "Yes",
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
              },
              {
                type: "button",
                textContent: si.reset || "Reset",
                listenerEvent: {
                  trigger: "click",
                  callback: () => this.form.reset(),
                },
              },
              {
                type: "button",
                btnType: "submit",
                textContent: si.yes || "Yes",
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

      throw Error(
        "Bad form schema, could not be parsed. Missed si.type: " + si.type
      );
    });
  }

  doPopup() {
    document.body.appendChild(this.popup.element);
    if (!this.dontReset) this.form.reset();
    const anyInput = this.popup.element.querySelector("input");
    if (anyInput) anyInput.focus();
  }
}

export default PopupGenerator;
