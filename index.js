const { getPercentage } = require("./utilities.js");
const { event, recorder, output, container } = codeceptjs;
const { IncomingWebhook } = require('@slack/webhook');

const defaultConfig = {
  enabled: false,
  webhookUrl: process.env.SLACK_WEBHOOK_URL,
  messageIntro: "Acceptance Tests failed.",
  devMode: false
};

const requiredFields = ["webhookUrl"];

let totalScenarioCount = 0;
let passedScenarioCount = 0;
let failedScenarioCount = 0;

let failedScenarios = [];

module.exports = (config) => {
  config = Object.assign(defaultConfig, config);

  const customWebhookUrlEnvVar = config.webhookUrlEnvVar;
  if(customWebhookUrlEnvVar) {
    config.webhookUrl = customWebhookUrlEnvVar;
  }

  for (let field of requiredFields) {
    if (!config[field]) throw new Error(`Slack reporter config is invalid: "${field}" is missing in config.`)
  }

  event.dispatcher.on(event.test.before, (test) => {
    recorder.add(async () => {
      totalScenarioCount++;
    });
  });

  event.dispatcher.on(event.test.passed, (test) => {
    recorder.add(async () => {
      passedScenarioCount++;
    });
  });

  event.dispatcher.on(event.test.failed, async (test, err) => {
    recorder.add(async () => {
      failedScenarioCount++;
      failedScenarios.push({test, err});
    });
  });

  event.dispatcher.on(event.all.result, () => {

    let message = `${config.messageIntro}\n\n`;

    message += `${totalScenarioCount} scenarios executed:\n`;
    message += `${getPercentage(passedScenarioCount, totalScenarioCount)} (${passedScenarioCount}) scenarios passed\n`;
    message += `${getPercentage(failedScenarioCount, totalScenarioCount)} (${failedScenarioCount}) scenarios failed\n\n`;
    for (let i = 0; i < failedScenarios.length; i++) {
      const oneLineTitle = failedScenarios[i].test.title.replace(/\s\s\s\s\s\s/, "").replace(/\n\s\s\s\s\s\s\s\s\s/, "");
      message += `*${oneLineTitle}* failed because\n`;
      message += `\`${failedScenarios[i].err.message}\`\n\n`;
    }

    // Only report in Slack if at least one scenario failed
    if ( !config.devMode && failedScenarioCount > 0 ) {

      const webhook = new IncomingWebhook(config.webhookUrl);

      (async () => {
        await webhook.send({
          text: message,
        });
      })();
    }

    if ( config.devMode ) {
      output.print(message);
    }

  });

};
