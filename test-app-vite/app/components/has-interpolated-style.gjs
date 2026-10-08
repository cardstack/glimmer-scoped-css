import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

export default class HasInterpolatedStyle extends Component {
  @tracked color = 'pink';

  updateColor = (event) => {
    this.color = event.target.value;
  };

  <template>
    <label>Color of text in field:</label>
    <input class='interpolated-style-input' value={{this.color}} {{on 'change' this.updateColor}} />
    <style>
      .interpolated-style-input {
        color: {{this.color}};
      }
    </style>
  </template>
}
