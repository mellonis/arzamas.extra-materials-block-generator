export default class ExtraMaterial {
  #extraMaterials;

  #url;

  #title;

  #description;

  constructor({
    extraMaterials, url = '', title = '', description = '',
  }) {
    this.#extraMaterials = extraMaterials;
    this.#url = url;
    this.#title = title;
    this.#description = description;
  }

  get url() {
    return this.#url;
  }

  set url(newValue) {
    this.#url = newValue;
    this.#extraMaterials.render();
  }

  get title() {
    return this.#title;
  }

  set title(newValue) {
    this.#title = newValue;
    this.#extraMaterials.render();
  }

  get description() {
    return this.#description;
  }

  set description(newValue) {
    this.#description = newValue;
    this.#extraMaterials.render();
  }
}
