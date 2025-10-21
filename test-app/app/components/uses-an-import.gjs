const UsesAnImport = <template>
  <p data-test-uses-an-import>I should be green</p>
  <style scoped>
    @import "./colors.css";
    p {
      color: var(--my-green);
    }
  </style>
</template>;

export default UsesAnImport;
