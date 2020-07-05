import { html, render, nothing } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import ExtraMaterials from '../classes/ExtraMaterials';

function headerTemplate({
  lexemes, data: { extraMaterialTitle }, mode, onTitleChange,
}) {
  switch (mode) {
    case ExtraMaterials.MODE.DEFAULT:
    case ExtraMaterials.MODE.PREVIEW:
      return html`<div class="extra-materials__header">${extraMaterialTitle || lexemes.blockTitle}</div>`;
    case ExtraMaterials.MODE.CONSTRUCTOR:
      return html`<div class="extra-materials__header">
        <input type="text" placeholder="${lexemes.blockTitle}" class="extra-materials__header-input" @input="${({ target }) => onTitleChange(target.value)}">
      </div>`;
    default:
      throw new Error('Not implemented yet');
  }
}

function itemUrlTemplate({ lexemes, extraMaterial, mode }) {
  switch (mode) {
    case ExtraMaterials.MODE.CONSTRUCTOR:
      return html`
        <input type="text" placeholder="${lexemes.url}" class="extra-materials__url-input" @input="${({ target }) => Object.assign(extraMaterial, {
  url: target.value,
})}">
        <div class="extra-materials__item-controls">
          <button type="button" class="button" data-action="fetch-url-title">${lexemes.fetchUrlTitle}</button>
          <button type="button" class="button" data-action="fetch-url-description">${lexemes.fetchUrlDescription}</button>
          <button type="button" class="button" data-action="remove-material">${lexemes.removeMaterial}</button>
        </div>
      `;
    case ExtraMaterials.MODE.PREVIEW:
      return extraMaterial.url
        ? nothing
        : html`<div class="extra-materials__error">${lexemes.emptyUrlError}</div>`;
    default:
      return nothing;
  }
}

function itemTitleTemplate({ lexemes, extraMaterial, mode }) {
  switch (mode) {
    case ExtraMaterials.MODE.CONSTRUCTOR:
      return html`<input type="text" placeholder="${lexemes.title}" class="extra-materials__title-input" .value=${extraMaterial.title} @input=${({ target }) => Object.assign(extraMaterial, {
        title: target.value,
      })}>`;
    case ExtraMaterials.MODE.PREVIEW:
      return html`<div class="${extraMaterial.title ? 'extra-materials__title' : 'extra-materials__title extra-materials__title_empty'}">
${
  extraMaterial.title
    ? extraMaterial.title
    : lexemes.emptyTitleError
}
</div>`;
    case ExtraMaterials.MODE.DEFAULT:
      return html`<div class="extra-materials__title">${extraMaterial.title}</div>`;
    default:
      return nothing;
  }
}

function itemDescriptionTemplate({ lexemes, extraMaterial, mode }) {
  return html`<div class="extra-materials__description">${
    // eslint-disable-next-line no-nested-ternary
    mode === ExtraMaterials.MODE.CONSTRUCTOR
      ? html`<input type="text" placeholder="${lexemes.description}" class="extra-materials__description-input" .value=${extraMaterial.description} @input=${({ target }) => Object.assign(extraMaterial, {
        description: target.value,
      })}>`
      : (
        extraMaterial.description
          ? extraMaterial.description
          : nothing
      )
  }
  </div>`;
}

function itemDomainTemplate({ extraMaterial }) {
  let domain = '';

  try {
    domain = new URL(extraMaterial.url).host;
    // eslint-disable-next-line no-empty
  } catch (e) {}

  return domain
    ? html`<div class="extra-materials__source-domain">${domain}</div>`
    : nothing;
}

function listItemTemplate({
  lexemes, extraMaterial, ix, mode,
}) {
  return html`
${
  ix !== 0
    ? html`<div class="extra-materials__divider"></div>`
    : nothing
}
      <li 
        class="extra-materials__item"
        data-action="${ifDefined(mode === ExtraMaterials.MODE.DEFAULT || mode === ExtraMaterials.MODE.PREVIEW ? 'follow-link' : undefined)}" 
        data-href="${ifDefined(mode === ExtraMaterials.MODE.DEFAULT || mode === ExtraMaterials.MODE.PREVIEW2 ? extraMaterial.url : undefined)}"
        data-ix="${ifDefined(mode === ExtraMaterials.MODE.CONSTRUCTOR ? ix : undefined)}"
      >
        ${itemUrlTemplate({ lexemes, extraMaterial, mode })}
        ${itemTitleTemplate({ lexemes, extraMaterial, mode })}
        ${itemDescriptionTemplate({ lexemes, extraMaterial, mode })}
        ${itemDomainTemplate({ lexemes, extraMaterial, mode })}
      </li>
    `;
}

function listTemplate({ lexemes, data: { extraMaterialList }, mode }) {
  return html`<ul class="extra-materials__list">
    ${
  extraMaterialList.map((extraMaterial, ix) => listItemTemplate({
    lexemes,
    extraMaterial,
    ix,
    mode,
  }))
}
  </ul>`;
}

function extraMaterialsControlsTemplate({ lexemes, mode }) {
  switch (mode) {
    case ExtraMaterials.MODE.CONSTRUCTOR:
      return html`
      <div class="extra-materials__divider"></div>
      <div class="extra-materials__controls">
        <div class="button" data-action="add-material">${lexemes.addMaterial}</div>
        <div class="button" data-action="render-preview">${lexemes.renderPreview}</div>
      </div>`;
    default:
      return nothing;
  }
}

const template = ({
  lexemes,
  data,
  mode,
  onTitleChange,
}) => html`<div>
  ${
  mode === ExtraMaterials.MODE.CONSTRUCTOR
    ? html`<h2>${lexemes.constructor}</h2>`
    : nothing
}    
    ${
  mode === ExtraMaterials.MODE.PREVIEW
    ? html`<h2>${lexemes.preview}</h2>`
    : nothing
}    
  <article class="extra-materials${mode === ExtraMaterials.MODE.CONSTRUCTOR ? ' extra-materials_constructor' : ''}">
    ${headerTemplate({
    lexemes, data, mode, onTitleChange,
  })}
    ${listTemplate({ lexemes, data, mode })}
    ${extraMaterialsControlsTemplate({ lexemes, data, mode })}
  </article>
  ${
  mode === ExtraMaterials.MODE.PREVIEW
    ? html`<div class="controls">
        <button type="button" class="button" data-action="get-result-html">${lexemes.copyResultHtml}</button>
      </div>`
    : nothing
}
  ${
  mode === ExtraMaterials.MODE.PREVIEW
    ? html`<textarea class="test-textarea" placeholder="${lexemes.testTextarea}"></textarea>`
    : nothing
}
</div>`;

export default {
  getHtml({ lexemes, data }) {
    const div = document.createElement('div');

    render(template({ lexemes, data, mode: ExtraMaterials.MODE.DEFAULT }), div);

    const resultDiv = div.querySelector('.extra-materials');

    div.innerHTML = '';
    div.appendChild(resultDiv);

    return div.innerHTML.replace(/<!---->/g, '');
  },
  render: ({
    lexemes,
    socket,
    data,
    mode,
    onTitleChange,
  }) => render(template({
    lexemes, data, mode, onTitleChange,
  }), socket),
};
