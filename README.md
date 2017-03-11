# PostCSS-Interpolate

[PostCSS] plugin to interpolate everything.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/sedlukha/postcss-interpolate.svg
[ci]:      https://travis-ci.org/sedlukha/postcss-interpolate

```css
/* Input */

.foo {
    font-size: interpolate(horizontally, 320px, 14px, 600px, 16px, 1200px, 20px);
}
```

```css
/* Output */

.foo {
  font-size: 14px;
}

@media screen and (min-width: 600px) {
    .foo {
        font-size: calc( 16px + 4 * (100vw - 600px) / 1200 - 600);
    }
}

@media screen and (min-width: 320px) {
    .foo {
        font-size: calc( 14px + 2 * (100vw - 320px) / 600 - 320);
    }
}

@media screen and (min-width: 1200px) {
    .foo {
        font-size: 20px;
    }
}
```

## Usage

```js
postcss([ require('postcss-interpolate') ])
```

See [PostCSS] docs for examples for your environment.
