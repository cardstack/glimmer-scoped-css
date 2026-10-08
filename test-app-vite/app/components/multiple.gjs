import UnderlinedAddonComponent from 'test-addon-to-import/components/underlined-addon-component';
import UnscopedAddonComponent from 'test-addon-to-import/components/unscoped-addon-component';

const MultipleInner = <template>
  <UnscopedAddonComponent />
  <p data-test-multiple-inner>Multiple inner</p>
  <style scoped>
    p {
      font-weight: 700;
    }

    p:before {
      content: '✓';
    }
  </style>
</template>;

const MultipleOuter = <template>
  <style scoped>
    p {
      font-weight: 900;
    }
  </style>
  <p data-test-multiple-outer>Multiple outer</p>
  {{MultipleInner}}
  <style scoped>
    p {
      font-style: italic;
    }
  </style>

  <UnderlinedAddonComponent />

  <p class='underlined-component' data-test-underline-component-outside-addon>
    an element with the same class as the addon component does not get its styles
  </p>
</template>;

export default MultipleOuter;
