import Component from '@glimmer/component';
import Modifier from 'ember-modifier';

export default class UsesScopedClasses extends Component {
  <template>
    <DynamicallyInsertsElements @detailsClass="__GLIMMER_SCOPED_CSS_CLASS" data-test-details-container />
    <style>
      .__GLIMMER_SCOPED_CSS_CLASS {
        background-color: lightblue;
      }
    </style>
  </template>
}

class DynamicallyInsertsElements extends Component {
  <template>
    <section {{InsertChildElementsModifier detailsClass=@detailsClass}} ...attributes>
      I have children inserted dynamically with a scoped class.
    </section>
  </template>
};


class InsertChildElementsModifier extends Modifier<ScrollSignature> {
  modify(element, [], {detailsClass}) {
    let document = element.ownerDocument;
    let details = document.createElement('details');
    details.className = detailsClass;
    details.innerHTML = `
      <summary>Click me</summary>
      <p>Here is some content</p>
    `;
    element.appendChild(details);
    }
  //   element: HTMLElement,
  //   _positional: [],
  //   { initialScrollPosition = 0, onScroll }: ScrollSignature['Args']['Named'],
  // ) {
  //   // note that when testing make sure "disable cache" in chrome network settings is unchecked,
  //   // as this assumes that previously loaded images will be cached. otherwise the scroll will
  //   // happen *before* the geometry is altered by images that haven't completed loading yet.
  //   element.documentElement.scrollTop = initialScrollPosition;
  //   element.scrollTop = initialScrollPosition;
  //   if (onScroll) {
  //     element.addEventListener('scroll', onScroll);
  //     registerDestructor(this, () => {
  //       element.removeEventListener('scroll', onScroll);
  //     });
  //   }
  // }
}
