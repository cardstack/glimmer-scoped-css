import Component from '@glimmer/component';
import Modifier from 'ember-modifier';
import { concat } from '@ember/helper';

export default class UsesScopedClasses extends Component {
  <template>
    before
    <DynamicallyInsertsElements
      @detailsClass="__GLIMMER_SCOPED_CSS_CLASS"
      @timeClass={{concat "something " "__GLIMMER_SCOPED_CSS_CLASS"}}
      data-test-details-container
    />
    after!!!!
    <style>
      details.__GLIMMER_SCOPED_CSS_CLASS {
        background-color: lightblue;
      }

      time.__GLIMMER_SCOPED_CSS_CLASS {
        background-color: limegreen;
      }
    </style>
  </template>
}





class DynamicallyInsertsElements extends Component {
  <template>
    <section {{InsertChildElementsModifier detailsClass=@detailsClass timeClass=@timeClass}} ...attributes>
      I have children inserted dynamically with a scoped class.
    </section>
  </template>
};

class InsertChildElementsModifier extends Modifier<ScrollSignature> {
  modify(element, _positional, { detailsClass, timeClass, xyz }) {
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
