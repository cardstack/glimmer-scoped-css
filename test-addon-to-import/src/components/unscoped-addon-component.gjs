const UnscopedAddonComponent = <template>
  {{! template-lint-disable no-forbidden-elements }}
  <style data-test-addon-component-style>
    .addon-component { text-decoration: underline solid rgb(0, 0, 0); }
  </style>

  <p class='addon-component' data-test-addon-component>
    hello from an unscoped addon component!
  </p>
</template>;

export default UnscopedAddonComponent;
