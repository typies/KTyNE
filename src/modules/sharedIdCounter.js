class IdCounter {
  #id = 0;

  incrementId() {
    this.#id = this.#id + 1;
    return this.#id;
  }

  getId() {
    return this.#id;
  }
}

export default new IdCounter();
