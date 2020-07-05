import ActionHandler from './ActionHandler';
import ExtraMaterial from './ExtraMaterial';

export default class ExtraMaterials {
  static MODE = Object.freeze({
    DEFAULT: 'default',
    CONSTRUCTOR: 'constructor',
    PREVIEW: 'preview',
  });

  #extraMaterialsTitle;

  #extraMaterialList = [];

  #onFollowLink;

  #onGetResultHtml;

  #onRenderPreview;

  #renderer;

  #urlMetaFetcher;

  constructor({
    extraMaterialsTitle = '',
    extraMaterialList = [],
    onFollowLink = () => {},
    onGetResultHtml = () => {},
    onRenderPreview = null,
    renderer = null,
    urlMetaFetcher = null,
  }) {
    this.#extraMaterialsTitle = extraMaterialsTitle;
    this.#extraMaterialList = [...extraMaterialList]
      .map(({ url, title, description }) => new ExtraMaterial({
        extraMaterials: this, url, title, description,
      }));
    this.#onFollowLink = onFollowLink;
    this.#onGetResultHtml = onGetResultHtml;
    this.#onRenderPreview = onRenderPreview;
    this.#renderer = renderer;
    this.#urlMetaFetcher = urlMetaFetcher;
  }

  #sockets = new Map();

  #onTitleChange = (newTitle) => {
    this.#extraMaterialsTitle = newTitle;
    this.renderPreviews();
  };

  render({ lexemes, socket = null, mode = ExtraMaterials.MODE.DEFAULT } = {}) {
    if (socket === null) {
      this.renderConstructors();
      this.renderPreviews();
      return;
    }

    let renderParams;
    let needInitializeActionHandler;

    if (this.#sockets.has(socket)) {
      renderParams = this.#sockets.get(socket);
      needInitializeActionHandler = false;
    } else {
      renderParams = {
        lexemes,
        socket,
        mode,
        onTitleChange: this.#onTitleChange.bind(this),
      };
      needInitializeActionHandler = true;
      this.#sockets.set(socket, renderParams);
    }

    this.#renderer.render({
      ...renderParams,
      data: {
        extraMaterialTitle: this.#extraMaterialsTitle,
        extraMaterialList: [...this.#extraMaterialList],
      },
    });

    if (needInitializeActionHandler) {
      this.#initActionHandler({
        ...renderParams,
      });
    }
  }

  #initActionHandler = ({ socket, mode }) => {
    switch (mode) {
      case ExtraMaterials.MODE.CONSTRUCTOR:
        // eslint-disable-next-line no-new
        new ActionHandler(socket.firstElementChild, (action) => {
          switch (action.type) {
            case 'add-material':
              this.#extraMaterialList.push(new ExtraMaterial({
                extraMaterials: this,
                url: '',
                title: '',
                description: '',
              }));
              this.render({ socket });
              this.renderPreviews();
              break;
            case 'remove-material':
              this.#extraMaterialList.pop();
              this.render({ socket });
              this.renderPreviews();
              break;
            case 'render-preview':
              if (this.#onRenderPreview instanceof Function) {
                this.#onRenderPreview.call();
              }
              break;
            case 'fetch-url-title': {
              const ix = Number(action.target.closest('[data-ix]').getAttribute('data-ix'));

              this.#urlMetaFetcher.fetchUrlMeta(this.#extraMaterialList[ix].url)
                .then((meta) => {
                  if (meta.title) {
                    this.#extraMaterialList[ix].title = meta.title;
                  }
                });
              break;
            }
            case 'fetch-url-description': {
              const ix = Number(action.target.closest('[data-ix]').getAttribute('data-ix'));

              this.#urlMetaFetcher.fetchUrlMeta(this.#extraMaterialList[ix].url)
                .then((meta) => {
                  if (meta.description) {
                    this.#extraMaterialList[ix].description = meta.description;
                  }
                });
              break;
            }
            // no default
          }
        });
        break;
      case ExtraMaterials.MODE.PREVIEW:
        // eslint-disable-next-line no-new
        new ActionHandler(socket.firstElementChild, (action) => {
          switch (action.type) {
            case 'get-result-html':
              this.#onGetResultHtml(this.#renderer.getHtml({
                lexemes: this.#sockets.get(socket).lexemes,
                data: {
                  extraMaterialTitle: this.#extraMaterialsTitle,
                  extraMaterialList: [...this.#extraMaterialList],
                },
              }));
              break;
            // no default
          }
        });
        // fall through
      case ExtraMaterials.MODE.DEFAULT:
        // eslint-disable-next-line no-new
        new ActionHandler(socket.firstElementChild, (action) => {
          switch (action.type) {
            case 'follow-link':
              this.#onFollowLink(action.data.href);
              break;
              // no default
          }
        });
        break;
      default:
        throw new Error(`Not implemented yet: initActionHandler for ${mode} mode`);
    }
  }

  renderConstructors = () => {
    [...this.#sockets.entries()]
      .filter(([localSocket]) => (
        this.#sockets.get(localSocket).mode === ExtraMaterials.MODE.CONSTRUCTOR
      ))
      .forEach(([localSocket]) => this.render({ socket: localSocket }));
  };

  renderPreviews = () => {
    [...this.#sockets.entries()]
      .filter(([localSocket]) => (
        this.#sockets.get(localSocket).mode === ExtraMaterials.MODE.PREVIEW
      ))
      .forEach(([localSocket]) => this.render({ socket: localSocket }));
  };
}
