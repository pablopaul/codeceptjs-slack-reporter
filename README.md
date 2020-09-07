# CodeceptJS Slack Reporter

Get a Slack notification when one or more scenarios fail.

## Installation

* `npm install codeceptjs-slack-reporter --save-dev`
* Enable this plugin in `codecept.conf.js`:

```js
{
  //...
   plugins: {
    "slack-reporter": {
      require: "codeceptjs-slack-reporter",
      enabled: true
    }
  //...
}
```

* Create an incoming webhook, see https://api.slack.com/messaging/webhooks
* Export an environment variable called `SLACK_WEBHOOK_URL==https://hooks.slack.com/services/…` with your webhook url

## Configuration

### webhookUrlEnvVar

The plugin uses the environment variable `SLACK_WEBHOOK_URL` by default. 
This usage can be overriden by using the `webhookUrlEnvVar: process.env.MY_ENV_VAR_NAME` property. 

### messageIntro

With `messageIntro` you can customize the message, i.e. use custom CI env information like 
```js
messageIntro: `Acceptance tests failed for branch "${process.env.CF_BRANCH}" within <${process.env.CF_BUILD_URL}|this pipeline>.`
```

### devMode

Set `devMode: true` to print the message to the console instead reporting it to Slack.
Needs to be run with `--debug`, only when at least one scenario is failing there will be output.

## Remarks

To have basic compatiblity with `run-workers` there can be multiple notifications for one test run depending on how
much threads have at least on failure. I did not find a way to merge all failures after all workers are finished and
then only send one notification.
