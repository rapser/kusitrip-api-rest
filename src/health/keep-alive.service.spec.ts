import { ConfigService } from '@nestjs/config';
import { KeepAliveService } from './keep-alive.service';

function serviceWith(env: Record<string, string>) {
  return new KeepAliveService(new ConfigService(env));
}

describe('KeepAliveService', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    fetchMock.mockReset().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = fetchMock;
  });

  afterEach(() => jest.useRealTimers());

  describe('targetUrl', () => {
    it('is disabled when no URL is configured (local)', () => {
      expect(serviceWith({}).targetUrl()).toBeNull();
    });

    it('uses /health on RENDER_EXTERNAL_URL', () => {
      expect(
        serviceWith({
          RENDER_EXTERNAL_URL: 'https://api.onrender.com/',
        }).targetUrl(),
      ).toBe('https://api.onrender.com/health');
    });

    it('lets KEEP_ALIVE_URL override it, or turn it off', () => {
      const base = { RENDER_EXTERNAL_URL: 'https://api.onrender.com' };
      expect(
        serviceWith({
          ...base,
          KEEP_ALIVE_URL: 'https://x.dev/ping',
        }).targetUrl(),
      ).toBe('https://x.dev/ping');
      expect(
        serviceWith({ ...base, KEEP_ALIVE_URL: 'off' }).targetUrl(),
      ).toBeNull();
    });
  });

  it('pings every interval until shutdown', () => {
    const service = serviceWith({
      RENDER_EXTERNAL_URL: 'https://api.onrender.com',
    });
    service.onApplicationBootstrap();

    jest.advanceTimersByTime(10 * 60_000);
    jest.advanceTimersByTime(10 * 60_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.onrender.com/health',
      expect.anything(),
    );

    service.onApplicationShutdown();
    jest.advanceTimersByTime(30 * 60_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('never throws when the ping fails', async () => {
    fetchMock.mockRejectedValueOnce(new Error('ECONNRESET'));
    fetchMock.mockResolvedValueOnce({ ok: false, status: 429 });
    const service = serviceWith({});

    await expect(service.ping('https://x')).resolves.toBe(false);
    await expect(service.ping('https://x')).resolves.toBe(false);
  });
});
