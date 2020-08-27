# CodeceptJS Slack Reporter

## Installation
`npm install codeceptjs-slack-reporter --save-dev`

## Configuration

Enable this plugin should added in `codecept.conf.js`

Example:

```js
{
  //...
   plugins: {
    "slack-reporter": {
      enabled: true,
      require: 'codeceptjs-slack-reporter'
    }
  //...
}
```
