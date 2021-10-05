import { Hub, makeMain } from '@sentry/hub';
import { NodeClient } from '@sentry/node';
import { logger } from '@sentry/utils';
import { NextApiRequest } from 'next';

import { AugmentedNextApiResponse, withSentry } from '../../src/utils/withSentry';

const loggerSpy = jest.spyOn(logger, 'log');
let captureExceptionSpy: jest.Mock;

// Prevent captureException from creating and leaving an open handle after test already finished
jest.mock('@sentry/node', () => {
  const actual = jest.requireActual('@sentry/node');
  // Mocks are hoisted, thus we need to instentiate a variable here
  captureExceptionSpy = jest.fn();
  return {
    ...actual,
    captureException: captureExceptionSpy,
  };
});

describe('withSentry', () => {
  it('flushes events before rethrowing error', async () => {
    const hub = new Hub(
      new NodeClient({ dsn: 'https://dogsarebadatkeepingsecrets@squirrelchasers.ingest.sentry.io/12312012' }),
    );
    makeMain(hub);
    const req = { url: 'http://dogs.are.great' } as NextApiRequest;
    const res = ({ end: async () => undefined } as unknown) as AugmentedNextApiResponse;
    const error = new Error('Charlie ate the flip-flops. :-(');
    const wrappedHandler = withSentry(async () => {
      throw error;
    });

    await expect(wrappedHandler(req, res)).rejects.toBe(error);
    expect(loggerSpy).toHaveBeenCalledWith('Done flushing events');
    expect(captureExceptionSpy).toHaveBeenCalledWith(error);
  });

  it("doesn't interfere with non-erroring responses", () => {
    // pass
  });

  it('creates a transaction, puts it on the scope, and sends it to sentry', () => {
    // pass
  });

  it('separates scopes between invocations', () => {
    // pass
  });

  it('continues a trace given a `sentry-trace` header', () => {
    // pass
  });

  it('parameterizes path', () => {
    // pass
  });
});
