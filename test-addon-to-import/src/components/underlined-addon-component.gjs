const UnderlinedAddonComponent = <template>
  {{! template-lint-disable no-forbidden-elements }}
  <style scoped data-test-scoped-underline-addon-component-style>
    .underlined-component { text-decoration: underline solid rgb(0, 0, 0); }
  </style>

  <p class='underlined-component' data-scoped-underline-addon-component>
    hello from a scoped underline addon component
  </p>
</template>;

export default UnderlinedAddonComponent;
