# How To Contribute

## Installation

* `git clone <repository-url>`
* `cd glimmer-scoped-css`
* `pnpm install`

## Linting

* `pnpm lint`
* `pnpm lint:fix`

## Building the addon

* `cd glimmer-scoped-css`
* `pnpm build`

## Running tests

* `cd test-app`
* `pnpm test` – Runs the test suite on the current Ember version

## Running the test application

* `cd test-app`
* `pnpm start`
* Visit the test application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://cli.emberjs.com/release/](https://cli.emberjs.com/release/).

## Iterating in development

Caching can cause confusion while developing. When iterating on the AST transform, you will need to restart `test-app` to see changes. You also may need to change template files to trigger a rebuild.
