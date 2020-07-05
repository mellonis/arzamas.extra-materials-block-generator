export default class LocalhostUrlMetaFetcher {
  #cache = new Map();

  #proxy;

  constructor(proxy) {
    this.#proxy = proxy;
  }

  fetchUrlMeta(url) {
    if (this.#cache.has(url)) {
      return Promise.resolve(this.#cache.get(url));
    }

    return fetch(`${this.#proxy}?${new URLSearchParams({
      url,
    })}`, {
      mode: 'cors',
    })
      .then((response) => response.json())
      .then((meta) => {
        const result = {
          title: meta.title || '',
          description: meta.description || '',
        };

        this.#cache.set(url, result);

        return result;
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);

        return {
          title: '',
          description: '',
        };
      });
  }
}
