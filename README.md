# PostCSS-Interpolate

>[PostCSS] plugin to interpolate everything.

[PostCSS]: https://github.com/postcss/postcss
[draft]: https://github.com/w3c/csswg-drafts/issues/581

This plugin made for automatically interpolation of property values between breakpoints.

Inspired by this [draft]

## Installation

```
$ npm i --save-dev postcss-interpolate
```

## Syntax

#### `interpolate(direction, mediaquery-1, value-1, ... mediaquery-n, value-n)`

* ##### `direction`

  * _none_ — if you will not specify direction, plugin will you `vertically` as defaul direction
  * _`vertically`_ or _`vw`_ — default derection.
  * _`horizontally`_ or _`vh`_

* ##### `mediaquery`
  works only with **px** units

* ##### `value`
  works only with **px** or **rem** units


## Examples

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

If you are using **postcss-cssnext**, please, turn off pxrem plugin
```js
postcssInterpolate(),
postcssCssnext({
  features: {
    rem: false,
    autoprefixer: {browsers: ['last 2 versions'] }
  }
})
```
