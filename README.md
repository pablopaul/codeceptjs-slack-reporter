# CodeceptJS Slack Reporter

Get a Slack notification when one or more scenarios fail.

## Installation

* `npm install codeceptjs-slack-reporter --save-dev`
* Enable this plugin in `codecept.conf.js` with the minimal config:

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
* Create a new Slack app https://api.slack.com/start/overview#creating
* Add `chat:write` permission to this Slack app, see https://api.slack.com/messaging/sending#publishing
* Get Slack oauth access token and export as `SLACK_BOT_TOKEN` env var
* Get Slack signing secret and export as `SLACK_SIGNING_SECRET` env var, see https://api.slack.com/start/building/bolt-js#credentials
* Get the id of the channel which should receive the notifications and export as `SLACK_E2E_CHANNEL_ID` env var, see https://stackoverflow.com/a/57246565/1744768
* Invite the bot (which is the freshly created "app") to the channel in slack with the command `/invite @botname`

## Configuration

### messageIntro

With `messageIntro` you can customize the message, i.e. use custom CI env information like 
```js
messageIntro: `Acceptance tests failed for branch "${process.env.CF_BRANCH}" within <${process.env.CF_BUILD_URL}|this pipeline>.`
```

### threadIdentifier

For my use case I use one Slack thread of messages per branch, the branch name is available as env var like `MY_BRANCH` so I configure this:
```js
threadFilename: process.env.MY_BRANCH
```

The filetype ending `.txt` is added automatically.
