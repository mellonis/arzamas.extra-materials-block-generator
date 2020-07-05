import ExtraMaterials from './classes/ExtraMaterials';
import litHtmlExtraMaterialsRenderer from './renderers/litHtmlExtraMaterialsRenderer';
import LocalhostUrlMetaFetcher from './classes/LocalhostUrlMetaFetcher';
import allLexemes from './lexemes';

const lexemes = {
  ...allLexemes.ru,
};

const extraMaterials = {
  first: {
    extraMaterialsTitle: 'Другие материалы о соцреализме',
    extraMaterialList: [
      {
        url: 'https://yandex.ru',
        title: 'Главное о диссидентах в 9 вопросах',
        description: 'Как появились, что делали и что изменили инакомыслящие в СССР, рассказывает историк Алексей Макаров',
      },
      {
        url: 'https://google.com',
        title: 'Соцреализм',
        description: 'Какой стиль живописи создал Сталин',
      },
      {
        url: 'https://poetry.mellonis.ru/sections/nnils',
        title: 'Блокадные дневники',
        description: 'Ленинградцы — о страшной блокадной зиме 1941–1942 годов',
      },
    ],
  },
  second: {
    extraMaterialsTitle: 'Читайте по теме',
    extraMaterialList: [
      {
        url: 'https://yandex.ru',
        title: 'Какой-то материл без заходного текста',
        description: '',
      },
      {
        url: 'https://google.com',
        title: 'Соцреализм',
        description: 'Какой стиль живописи создал Сталин',
      },
    ],
  },
};

function onFollowLink(url) {
  window.open(url);
}

[...document.querySelectorAll('[data-extra-materials-socket]')]
  .forEach((element) => {
    const socketName = element.getAttribute('data-extra-materials-socket');

    if (extraMaterials[socketName]) {
      const extraMaterialsInstance = new ExtraMaterials({
        ...extraMaterials[socketName],
        renderer: litHtmlExtraMaterialsRenderer,
        onFollowLink,
      });

      extraMaterialsInstance.render({
        lexemes,
        socket: element,
        mode: ExtraMaterials.MODE.DEFAULT,
      });
    }
  });

const extraMaterialsInstance = new ExtraMaterials({
  renderer: litHtmlExtraMaterialsRenderer,
  onFollowLink,
  onGetResultHtml(resultHtml) {
    const textarea = document.createElement('textarea');

    textarea.value = resultHtml;

    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';

    document.body.appendChild(textarea);

    textarea.select();

    const result = document.execCommand('copy');

    // eslint-disable-next-line no-alert
    alert(result ? lexemes.htmlWasCopiedToTheClipboard : 'Error');

    document.body.removeChild(textarea);
  },
  onRenderPreview() {
    extraMaterialsInstance
      .render({
        lexemes,
        socket: document.getElementById('extra-materials-preview'),
        mode: ExtraMaterials.MODE.PREVIEW,
      });
  },
  urlMetaFetcher: new LocalhostUrlMetaFetcher('http://localhost:3000'),
});

extraMaterialsInstance
  .render({
    lexemes,
    socket: document.getElementById('extra-materials-constructor'),
    mode: ExtraMaterials.MODE.CONSTRUCTOR,
  });
