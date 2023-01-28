# CodeceptJS Slack Reporter

Get an instant Slack notification when one or more scenarios fail.

## Installation

* `npm install codeceptjs-slack-reporter --save-dev`
* Enable this plugin in your `codecept.conf.js` or `codecept.conf.ts` with the minimal config:

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

### Usage with CodeceptJS REST helper

If you use the CodeceptJS REST / ApiDataFactory helper there is a current bug with this plugin, see https://github.com/codeceptjs/CodeceptJS/issues/2652
A workaround is to set the form the slack web-api code expected header in the REST helper configuration like this

```js
REST: {
  defaultHeaders: {
    post: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
}
```

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

### GitLab Specifics

This plugin allows to indicate if a GitLab merge request has "draft" status. If you enable and configure this feature, 
the plugin will automatically add a "construction" emoji to failure threads, which are for a merge request with "draft" status.
This can help with prioritizing analyzing the failures.

#### Setup & Configuration

* Add the `reactions:write` permission to your Slack bot
* Export env var "GL_TOKEN", which needs to have the right "read_api" for the desired GitLab project
* Add the following properties to the plugin config: 
```js
gitlabIndicateDraftStatus: true, 
gitlabProjectId: 123, // find the project id value from the GitLab project settings main screen
gitlabMrIdEnvVarName: process.env.CF_PULL_REQUEST_ID
```
