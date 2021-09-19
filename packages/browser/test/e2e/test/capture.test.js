const { test, expect } = require('@playwright/test');

const { getSentryEvent } = require('./utils/helpers');

test.beforeEach(async ({ baseURL, page }) => {
  await page.goto(baseURL);
});

test('captures manually thrown error', async ({ page }) => {
  const eventData = await getSentryEvent(page, () => {
    throw new Error('Sentry Test');
  });

  expect(eventData.exception.values[0].type).toBe('Error');
  expect(eventData.exception.values[0].value).toBe('Sentry Test');
});

test('captures undefined function call', async ({ page, browserName }) => {
  const eventData = await getSentryEvent(page, () => {
    // eslint-disable-next-line no-undef
    undefinedFunction();
  });

  expect(eventData.exception.values[0].type).toBe('ReferenceError');
  expect(eventData.exception.values[0].value).toBe(
    browserName === 'webkit' ? `Can't find variable: undefinedFunction` : 'undefinedFunction is not defined',
  );
});

test('captures unhandled promise rejection', async ({ page }) => {
  const eventData = await getSentryEvent(page, () => {
    return Promise.reject('Rejected');
  });

  expect(eventData.exception.values[0].type).toBe('UnhandledRejection');
  expect(eventData.exception.values[0].value).toBe('Non-Error promise rejection captured with value: Rejected');
});