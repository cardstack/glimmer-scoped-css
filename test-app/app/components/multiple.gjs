const MultipleInner = <template>
  <p data-test-multiple-inner>Multiple inner and <button class='button'>icon button</button></p>
  <style>
    p {
      font-weight: 700;
    }

    .button {
      background-image: url(./example.png);
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
