# Changelog

## Release (2024-10-25)

glimmer-scoped-css 1.0.0 (major)

#### :boom: Breaking Change
* `failing-test-app`, `glimmer-scoped-css`, `test-app`
  * [#42](https://github.com/cardstack/glimmer-scoped-css/pull/42) Rollup plugin: support app usage ([@ef4](https://github.com/ef4)). This is breaking because we no longer automatically emit separate CSS files. To maintain the old behavior in a v2 addon build, you will need to upgrade @embroider/addon-dev to get an updated `keepAssets()` that will automatically capture the CSS emitted from glimmer-scoped-css.

#### Committers: 1
- Edward Faulkner ([@ef4](https://github.com/ef4))

## Release (2024-09-04)

glimmer-scoped-css 1.0.0 (major)

#### :boom: Breaking Change
* `failing-test-app`, `glimmer-scoped-css`, `test-app`
  * [#38](https://github.com/cardstack/glimmer-scoped-css/pull/38) Change to require explicit scoping ([@backspace](https://github.com/backspace))

#### :house: Internal
* [#40](https://github.com/cardstack/glimmer-scoped-css/pull/40) dropping engines declaration ([@ef4](https://github.com/ef4))
* [#39](https://github.com/cardstack/glimmer-scoped-css/pull/39) Add release-plan ([@ef4](https://github.com/ef4))

#### Committers: 2
- Buck Doyle ([@backspace](https://github.com/backspace))
- Edward Faulkner ([@ef4](https://github.com/ef4))









## v0.5.0 (2024-08-26)

#### :rocket: Enhancement
* [#36](https://github.com/cardstack/glimmer-scoped-css/pull/36) Add Rollup plugin for v2 addons ([@backspace](https://github.com/backspace))

#### :bug: Bug Fix
* [#32](https://github.com/cardstack/glimmer-scoped-css/pull/32) Fix build error in applications importing unscoped styles ([@backspace](https://github.com/backspace))

#### :memo: Documentation
* [#29](https://github.com/cardstack/glimmer-scoped-css/pull/29) Add documentation on iteration ([@backspace](https://github.com/backspace))

#### Committers: 2
- Buck Doyle ([@backspace](https://github.com/backspace))
- Edward Faulkner ([@ef4](https://github.com/ef4))


## v0.4.1 (2024-02-01)

#### :boom: Breaking Change
* [#24](https://github.com/cardstack/glimmer-scoped-css/pull/24) Fix outbound requests from scoped CSS ([@ef4](https://github.com/ef4))

#### Committers: 1
- Edward Faulkner ([@ef4](https://github.com/ef4))

## v0.4.0 (2023-08-15)

#### :rocket: Enhancement
* [#22](https://github.com/cardstack/glimmer-scoped-css/pull/22) Add support for unscoped attribute ([@backspace](https://github.com/backspace))
* [#21](https://github.com/cardstack/glimmer-scoped-css/pull/21) Change scoping to per-template ([@backspace](https://github.com/backspace))

#### :bug: Bug Fix
* [#21](https://github.com/cardstack/glimmer-scoped-css/pull/21) Change scoping to per-template ([@backspace](https://github.com/backspace))

#### Committers: 1
- Buck Doyle ([@backspace](https://github.com/backspace))


## v0.3.2 (2023-06-19)

#### :rocket: Enhancement
* [#20](https://github.com/cardstack/glimmer-scoped-css/pull/20) Add ast-transform entrypoint ([@backspace](https://github.com/backspace))

#### Committers: 1
- Buck Doyle ([@backspace](https://github.com/backspace))


## v0.3.1 (2023-06-14)

#### :bug: Bug Fix
* [#19](https://github.com/cardstack/glimmer-scoped-css/pull/19) Fix virtual loader name ([@backspace](https://github.com/backspace))

#### Committers: 1
- Buck Doyle ([@backspace](https://github.com/backspace))


## v0.3.0 (2023-06-12)

#### :rocket: Enhancement
* [#18](https://github.com/cardstack/glimmer-scoped-css/pull/18) Split generic and webpack-specific parts ([@ef4](https://github.com/ef4))

#### Committers: 2
- Edward Faulkner ([@ef4](https://github.com/ef4))


## v0.2.0 (2023-06-06)

#### :rocket: Enhancement
* [#15](https://github.com/cardstack/glimmer-scoped-css/pull/15) Update with released Embroider versions ([@backspace](https://github.com/backspace))

#### :bug: Bug Fix
* [#17](https://github.com/cardstack/glimmer-scoped-css/pull/17) Add resourcePath to fix source map bug ([@backspace](https://github.com/backspace))
* [#12](https://github.com/cardstack/glimmer-scoped-css/pull/12) Fix bug with incorrectly-encoded CSS ([@backspace](https://github.com/backspace))

#### :memo: Documentation
* [#14](https://github.com/cardstack/glimmer-scoped-css/pull/14) Add documentation on resolving no-missing-require ([@backspace](https://github.com/backspace))

#### Committers: 1
- Buck Doyle ([@backspace](https://github.com/backspace))


## v0.1.2 (2023-05-02)

#### :house: Internal
* [#10](https://github.com/cardstack/glimmer-scoped-css/pull/10) Update lockfile ([@backspace](https://github.com/backspace))

#### Committers: 1
- Buck Doyle ([@backspace](https://github.com/backspace))


## v0.1.1 (2023-05-02)

#### :memo: Documentation
* [#8](https://github.com/cardstack/glimmer-scoped-css/pull/8) Add details on how to use within an addon ([@backspace](https://github.com/backspace))

#### :house: Internal
* [#9](https://github.com/cardstack/glimmer-scoped-css/pull/9) Change selector hash to come from super-fast-md5 ([@backspace](https://github.com/backspace))

#### Committers: 1
- Buck Doyle ([@backspace](https://github.com/backspace))


## v0.1.0 (2023-04-28)

#### :rocket: Enhancement
* [#2](https://github.com/cardstack/glimmer-scoped-css/pull/2) Add acceptance tests ([@backspace](https://github.com/backspace))
* [#1](https://github.com/cardstack/glimmer-scoped-css/pull/1) Fix CI ([@backspace](https://github.com/backspace))

#### :bug: Bug Fix
* [#4](https://github.com/cardstack/glimmer-scoped-css/pull/4) Remove unused unplugin ([@backspace](https://github.com/backspace))
* [#1](https://github.com/cardstack/glimmer-scoped-css/pull/1) Fix CI ([@backspace](https://github.com/backspace))

#### :memo: Documentation
* [#6](https://github.com/cardstack/glimmer-scoped-css/pull/6) Prepare for alpha release ([@backspace](https://github.com/backspace))

#### Committers: 1
- Buck Doyle ([@backspace](https://github.com/backspace))

# Changelog
