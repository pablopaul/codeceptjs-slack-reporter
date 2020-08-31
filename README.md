# CodeceptJS Slack Reporter

## Installation

* `npm install codeceptjs-slack-reporter --save-dev`
* Create an incoming webhook, see https://api.slack.com/messaging/webhooks

## Configuration

Enable this plugin should added in `codecept.conf.js`:

```js
{
  //...
   plugins: {
    "slack-reporter": {
      require: 'codeceptjs-slack-reporter',
      enabled: true,
    }
  //...
}
```

Export the environment variable `SLACK_WEBHOOK_URL`, i.e. ` SLACK_WEBHOOK_URL=https://hooks.slack.com/... npx codeceptjs run`.

### Dev Mode

Set `devMode: true` to print the message to the console instead reporting it to Slack.