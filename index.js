const { event, recorder, output, container } = codeceptjs;

const helpers = container.helpers();
let helper;

const screenshotHelpers = [
  'WebDriver',
  'Protractor',
  'Appium',
  'Nightmare',
  'Puppeteer',
  'TestCafe',
  'Playwright',
];

for (const helperName of screenshotHelpers) {
  if (Object.keys(helpers).indexOf(helperName) > -1) {
    helper = helpers[helperName];
  }
}

const defaultConfig = {
  projectName: '',
  debug: false,
  enabled: false
};

const requiredFields = ['projectName'];


module.exports = (config) => {
  config = Object.assign(defaultConfig, config);

  for (let field of requiredFields) {
    if (!config[field]) throw new Error(`Slack reporter config is invalid. Key ${field} is missing in config.\nRequired fields: ${requiredFields} `)
  }

  event.dispatcher.on(event.suite.before, (suite) => {
    recorder.add(async () => {

    });
  });

  event.dispatcher.on(event.test.before, (test) => {
    recorder.add(async () => {

    });
  });

  event.dispatcher.on(event.step.before, (step) => {
    recorder.add(async () => {

    });
  });

  event.dispatcher.on(event.step.after, (step) => {
  });

  event.dispatcher.on(event.step.failed, (step, err) => {
    recorder.add(async () => {

    });
  });

  event.dispatcher.on(event.step.passed, (step) => {
    recorder.add(async () => {

    });
  });

  event.dispatcher.on(event.test.failed, async (test, err) => {
    recorder.add(async () => {

    });
  });

  event.dispatcher.on(event.test.passed, (test) => {
    recorder.add(async () => {

    });
  });

  event.dispatcher.on(event.test.after, (test) => {
    recorder.add(async () => {

    });
  });

  event.dispatcher.on(event.suite.after, (suite) => {
    recorder.add(async () => {

    });
  });

  event.dispatcher.on(event.all.result, () => {

  });

};
