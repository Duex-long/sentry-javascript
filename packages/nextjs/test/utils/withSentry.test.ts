import { withSentry, AugmentedNextApiResponse } from '../../src/utils/withSentry';
import { NextApiHandler, NextApiRequest } from 'next';
import { Hub, makeMain } from '@sentry/hub';
import { NodeClient } from '@sentry/node';
import { logger } from '@sentry/utils';

const loggerSpy = jest.spyOn(logger, 'log');

describe('withSentry', async () => {
  it('flushes events before rethrowing error', async done => {
    const hub = new Hub(
      new NodeClient({ dsn: 'https://dogsarebadatkeepingsecrets@squirrelchasers.ingest.sentry.io/12312012' }),
    );
    makeMain(hub);
    const apiHandler: NextApiHandler = async (_req: any, _res: any) => {
      throw new Error('Charlie ate the flip-flops. :-(');
    };
    const req = { url: 'http://dogs.are.great' } as NextApiRequest;
    const res = ({ end: async () => undefined } as unknown) as AugmentedNextApiResponse;

    const wrappedHandler = withSentry(apiHandler);
    expect(async () => await wrappedHandler(req, res)).toThrow();
    expect(loggerSpy).toHaveBeenCalledWith('Done flushing events');
    done();
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
