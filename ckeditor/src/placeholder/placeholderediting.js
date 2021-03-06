import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import {toWidget, viewToModelPositionOutsideModelElement} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import './theme/placeholder.css';
import PlaceholderCommand from "./placeholdercommand";

export default class PlaceholderEditing extends Plugin {

  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();

    this.editor.commands.add('placeholder', new PlaceholderCommand(this.editor));

    this.editor.editing.mapper.on(
      'viewToModelPosition',
      viewToModelPositionOutsideModelElement(this.editor.model, viewElement => viewElement.hasClass('placeholder'))
    );

    this.editor.config.define('placeholderConfig', {
      types: ['firstName', 'lastName']
    });
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register('placeholder', {
      allowWhere: '$text',
      isInline: true,
      isObject: true,
      allowAttributes: ['name']
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    conversion.for('upcast').elementToElement({
      view: {
        name: 'span',
        classes: ['placeholder']
      },
      model: (viewElement, modelWriter) => {
        const name = viewElement.getChild(0).data.slice(1);
        return modelWriter.createElement('placeholder', {name});
      }
    });

    conversion.for('dataDowncast').elementToElement({
      model: 'placeholder',
      view: createPlaceholderView
    });

    conversion.for('editingDowncast').elementToElement({
      model: 'placeholder',
      view: (modelItem, viewWriter) => {
        const widgetElement = createPlaceholderView(modelItem, viewWriter);
        return toWidget(widgetElement, viewWriter);
      }
    });

    function createPlaceholderView(modelItem, viewWriter) {
      const name = modelItem.getAttribute('name');

      const placeholderView = viewWriter.createContainerElement('span', {
        class: 'placeholder'
      });

      const innerText = viewWriter.createText('$' + name);
      viewWriter.insert(viewWriter.createPositionAt(placeholderView, 0), innerText);

      return placeholderView;
    }
  }
}
