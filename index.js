const { event, recorder } = codeceptjs;
const { App } = require("@slack/bolt");

const { notifySlackChannel } = require("./utilities.js");

const defaultConfig = {
  enabled: false,
  token: process.env.SLACK_BOT_TOKEN,
  secret: process.env.SLACK_SIGNING_SECRET,
  channelId: process.env.SLACK_E2E_CHANNEL_ID,
  threadFilename: "filename",
  messageIntro: "Acceptance Tests failed.",
  gitlabIndicateDraftStatus: false,
  gitlabProjectId: undefined,
  gitlabMrIdEnvVarName: process.env.CF_PULL_REQUEST_ID
};

const requiredFields = ["token", "secret", "channelId"];

module.exports = (config) => {
  config = Object.assign(defaultConfig, config);

  for (let field of requiredFields) {
    if (!config[field]) throw new Error(`Slack reporter config is invalid: "${field}" is missing in config.`)
  }

  const app = new App({
    token: config.token,
    signingSecret: config.secret,
  });

  event.dispatcher.on(event.test.failed, async (test, err) => {

    recorder.add(async () => {

      // Only notify when retries are not used or it is the last try
      if(test._retries === -1|| test.retryNum == test._retries) {
        await notifySlackChannel(app, config, test, err);
      }

    });

  });

};
