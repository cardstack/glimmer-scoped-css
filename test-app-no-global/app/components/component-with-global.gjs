const ComponentWithGlobal = <template>
  <style scoped>
    :global(p) {
      font-style: italic;
    }
  </style>
  <p>Paragraph within ComponentWithGlobal.</p>
</template>;

export default ComponentWithGlobal;
