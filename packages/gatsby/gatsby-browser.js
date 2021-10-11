const Sentry = require('@sentry/gatsby');

exports.onClientEntry = function(_, pluginParams) {
  if (pluginParams === undefined) {
    return;
  }

  Sentry.init({
    // eslint-disable-next-line no-undef
    release: __SENTRY_RELEASE__,
    // eslint-disable-next-line no-undef
    dsn: __SENTRY_DSN__,
    ...pluginParams,
  });

  window.Sentry = Sentry;
};
