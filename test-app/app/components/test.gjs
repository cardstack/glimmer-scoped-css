import PowerSelect from 'ember-power-select/components/power-select'; 
import { fn, concat  } from '@ember/helper';
// cn

let names = ['justin', 'buck']
let selectedName = 'justin '

let changeName = (name)=> {
    selectedName = name 
}

const MultipleOuter1 = <template>

  <PowerSelect
  {{!-- class='__-scoped-class'  --}}
  @dropdownClass='__-scoped-class'
  @options={{names}}
  @selected={{selectedName}}
  @labelText="Name"
  @onChange={{fn changeName }} as |name|>

  {{!-- <div class='select-item-class'> --}}
  {{name}}
  {{!-- </div> --}}
</PowerSelect>

<style>
  :global(.__-scoped-class) {
    background-color: red;
  }
</style>

  {{!-- explicityly define :global() pseudo selector  --}}
  {{!-- either unscoped --}}

</template>;



export default MultipleOuter1;
