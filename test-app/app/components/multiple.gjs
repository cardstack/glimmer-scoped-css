const MultipleInner = <template>
  <p data-test-multiple-inner>Multiple inner</p>
  <style>
    p {
      font-weight: 700;
    }
  </style>
</template>;

const MultipleOuter = <template>
  <style>
    p {
      font-weight: 900;
    }
  </style>
  <p data-test-multiple-outer>Multiple outer</p>
  {{MultipleInner}}
  <style>
    p {
      font-style: italic;
    }
  </style>
</template>;

export default MultipleOuter;
