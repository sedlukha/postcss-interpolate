# PostCSS-Interpolate

>[PostCSS] plugin for values interpolation between breakpoints.

[PostCSS]: https://github.com/postcss/postcss

This plugin made for automatically interpolation of property values between breakpoints.
You can use this plugin for any __px/rem__ value interpolation (font-size, padding, margin and other). It __doesn't__ work with __%__ and __em__.

![](https://media.giphy.com/media/3og0IQyIEtGJYrCPNm/giphy.gif)

Inspired by this [draft].

[draft]: https://github.com/w3c/csswg-drafts/issues/581

## Installation

```
$ npm i --save-dev postcss-interpolate
```

## Syntax

`interpolate(direction, mediaquery-1, value-1, ... mediaquery-n, value-n)`

`direction`
  * __none__ — if you will not specify direction, plugin will you __vertically__ as defaul direction
  * __vertically__ or __vw__ — default derection.
  * __horizontally__ or __vh__


`mediaquery`
  works only with **px** units

`value`
  works only with **px** or **rem** units


## Examples
More examples at the tests folder
```css
/* Input */
.foo {
  font-size: interpolate(320px, 30px, 600px, 40px, 1200px, 50px);
}

/* Output */
.foo {
  font-size:  30px;
}

@media screen and (min-width: 320px) {
  .foo {
    font-size: calc( 30px + 10 * (100vw - 320px) / 280);
  }
}

@media screen and (min-width:  600px) {
  .foo {
    font-size: calc( 40px + 10 * (100vw -  600px) / 600);
  }
}

@media screen and (min-width:  1200px) {
  .foo {
    font-size:  50px;
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
  }
})
```
