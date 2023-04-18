# glimmer-scoped-css

`glimmer-scoped-css` is an Ember addon that lets you embed `<style>` tags in component templates that will be scoped to only apply within those components:

If you have `app/components/something.hbs`:

```html
<style>
  p {
    color: blue;
  }
</style>

<h1>An h1</h1>

<p>A p.</p>
```

you get this generated HTML:

```html
<h1 data-scopedcss-58ccb4dfe0>Outer h1</h1>

<p data-scopedcss-58ccb4dfe0>Outer p.</p>
```

and this generated CSS:

```css
p[data-scopedcss-53259f1da9] {
  color: blue;
}
```

Nested components only have the parent component’s styles on elements with `...attributes`. You can see this in action in `test-app`.

## Limitations

This is an alpha release with several limitations:

- it requires an unstable Embroider build (FIXME)
- it assumes a Webpack build
- it hardcodes Webpack CSS loaders
- the styles are in a `style` element in `index.html`, not linked
- there is log noise about source maps like this:
  ```
  unexpectedly found "<style>\n  p { color: blue" when slicing source, but expected "data-scopedcss-53259f1da9"
  ```

## Compatibility

- Ember.js v3.28 or above
- Embroider or ember-auto-import v2

## Installation

```
ember install glimmer-scoped-css
```

## Usage

[Longer description of how to use the addon in apps.]

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
