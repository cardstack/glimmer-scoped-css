import Component from '@glimmer/component';
import Modifier from 'ember-modifier';
import { concat } from '@ember/helper';

export default class UsesScopedClasses extends Component {
  <template>
    <DynamicallyInsertsElements
      @detailsClass='__GLIMMER_SCOPED_CSS_CLASS'
      @timeClass={{concat
        'something '
        (concat 'somethingelse ' '__GLIMMER_SCOPED_CSS_CLASS')
      }}
      @dataClass='{{this.aString}} __GLIMMER_SCOPED_CSS_CLASS'
      @codeClass='a-class {{concat
        "another-class "
        "__GLIMMER_SCOPED_CSS_CLASS"
      }}'
      data-test-dynamic-container
    />
    <style>
      details.__GLIMMER_SCOPED_CSS_CLASS {
        background-color: lightblue;
      }

      time.__GLIMMER_SCOPED_CSS_CLASS {
        background-color: limegreen;
      }

      data.__GLIMMER_SCOPED_CSS_CLASS {
        font-style: italic;
      }

      code.__GLIMMER_SCOPED_CSS_CLASS {
        font-style: italic;
      }
    </style>
  </template>

  get aString() {
    return 'a-string';
  }
}

class DynamicallyInsertsElements extends Component {
  <template>
    <section
      {{InsertChildElementsModifier
        detailsClass=@detailsClass
        timeClass=@timeClass
        dataClass=@dataClass
        codeClass=@codeClass
      }}
      ...attributes
    >
      I have children inserted dynamically with a scoped class.
    </section>
  </template>
}

class InsertChildElementsModifier extends Modifier {
  modify(
    element,
    _positional,
    { detailsClass, timeClass, dataClass, codeClass },
  ) {
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

    let data = document.createElement('data');
    data.className = dataClass;
    data.value = 'xyz';
    data.innerHTML = 'xyz';
    element.appendChild(data);

    let code = document.createElement('code');
    code.className = codeClass;
    code.textContent = 'code';
    element.appendChild(code);
  }
}
