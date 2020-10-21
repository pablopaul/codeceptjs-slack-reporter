const { event, recorder, output, container } = codeceptjs;
const { App } = require("@slack/bolt");

const { notifySlackChannel } = require("./utilities.js");

const defaultConfig = {
  enabled: false,
  token: process.env.SLACK_BOT_TOKEN,
  secret: process.env.SLACK_SIGNING_SECRET,
  channelId: process.env.SLACK_E2E_CHANNEL_ID,
  threadFilename: "filename.txt",
  messageIntro: "Acceptance Tests failed.",
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

      await notifySlackChannel(app, config, test, err);

    });

  });

};
