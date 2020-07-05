export default class ActionHandler {
  #element = null;

  #handler = null;

  constructor(element, handler) {
    if (element instanceof HTMLElement && handler instanceof Function) {
      this.#element = element;
      this.#handler = ActionHandler.#wrapHandler(handler);
    }

    this.on();
  }

  on() {
    this.#element.addEventListener('click', this.#handler);
  }

  off() {
    this.#element.removeEventListener(this.#handler);
  }

  static #wrapHandler = (handler) => (event) => {
    const currentTarget = event.target.closest('[data-action]');

    if (currentTarget && !currentTarget.hasAttribute('disabled')) {
      const actionType = currentTarget.getAttribute('data-action');

      handler.call(null, {
        event,
        target: currentTarget,
        type: actionType,
        data: ActionHandler.#collectData(currentTarget),
      });
    }
  }

  static #collectData = (element) => [...element.attributes]
    .filter((attribute) => attribute.name.startsWith('data-'))
    .reduce((result, attribute) => ({
      ...result,
      [ActionHandler.#makeUpKeyForDataAttributeName(attribute.name)]: (
        ActionHandler.#parseDataAttributeValue(attribute.value)
      ),
    }), {});

  static #rBrace = /^(?:{[\w\W]*}|\[[\w\W]*])$/;

  static #rDashAlpha =/-([a-z])/g;

  static #makeUpKeyForDataAttributeName = (name) => (
    name.slice(5).replace(ActionHandler.#rDashAlpha, (_, letter) => letter.toUpperCase())
  );

  static #parseDataAttributeValue = (value) => {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    if (value === 'null') {
      return null;
    }

    if (value === String(Number(value))) {
      return Number(value);
    }

    if (ActionHandler.#rBrace.test(value)) {
      return JSON.parse(value);
    }

    return value;
  }
}
