import Component from '@glimmer/component';
import Modifier from 'ember-modifier';
import { concat } from '@ember/helper';

export default class UsesScopedClasses extends Component {
  <template>

    <DynamicallyInsertsElements
      @detailsClass="__GLIMMER_SCOPED_CSS_CLASS"
      @timeClass={{concat "something " (concat "somethingelse " "__GLIMMER_SCOPED_CSS_CLASS")}}
      data-test-dynamic-container
    />
    <style>
      details.__GLIMMER_SCOPED_CSS_CLASS {
        background-color: lightblue;
      }

      time.__GLIMMER_SCOPED_CSS_CLASS {
        background-color: limegreen;
      }
    </style>
  </template>

  get aString() {
    return 'a string';
  }
}

class DynamicallyInsertsElements extends Component {
  <template>
    <section {{InsertChildElementsModifier detailsClass=@detailsClass timeClass=@timeClass}} ...attributes>
      I have children inserted dynamically with a scoped class.
    </section>
  </template>

  get aString() {
    return 'a string';
  }
};

class InsertChildElementsModifier extends Modifier {
  modify(element, _positional, { detailsClass, timeClass }) {
    let document = element.ownerDocument;

    let details = document.createElement('details');
    details.className = detailsClass;
    details.innerHTML = `
      <summary>Click me</summary>
      <p>Here is some content</p>
    `;
    element.appendChild(details);

    let time = document.createElement('time');
    time.className = timeClass;
    time.textContent = new Date().toLocaleTimeString();
    element.appendChild(time);
    }
}
