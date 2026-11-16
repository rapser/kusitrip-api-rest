import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const DEFAULT_INTERVAL_MINUTES = 10;
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Render (plan Free) apaga el servicio tras 15 min sin tráfico entrante.
 * Este servicio llama a la URL PÚBLICA de la propia app cada 10 min: la
 * petición sale a internet y vuelve a entrar por el proxy de Render, así que
 * cuenta como tráfico y la instancia nunca se duerme.
 *
 * No depende de pingers externos (cron-job.org, UptimeRobot…), cuyas IPs
 * comparten miles de usuarios y Render termina limitando con 429.
 *
 * Se activa solo si hay URL: Render inyecta RENDER_EXTERNAL_URL en cada
 * servicio; KEEP_ALIVE_URL la sobrescribe. En local no existe ninguna, así
 * que no hace nada. KEEP_ALIVE_URL=off lo desactiva en Render.
 */
@Injectable()
export class KeepAliveService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(KeepAliveService.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly config: ConfigService) {}

  onApplicationBootstrap() {
    const target = this.targetUrl();
    if (!target) return;

    const minutes =
      Number(this.config.get('KEEP_ALIVE_INTERVAL_MINUTES')) ||
      DEFAULT_INTERVAL_MINUTES;

    this.timer = setInterval(() => void this.ping(target), minutes * 60_000);
    this.logger.log(`Pinging ${target} every ${minutes} min`);
  }

  onApplicationShutdown() {
    clearInterval(this.timer);
  }

  targetUrl(): string | null {
    const override = this.config.get<string>('KEEP_ALIVE_URL')?.trim();
    if (override?.toLowerCase() === 'off') return null;

    const base = override || this.config.get<string>('RENDER_EXTERNAL_URL');
    if (!base) return null;

    return override ? base : `${base.replace(/\/+$/, '')}/health`;
  }

  async ping(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'kusitrip-keep-alive' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) {
        this.logger.warn(`Keep-alive got HTTP ${response.status}`);
      }
      return response.ok;
    } catch (error) {
      this.logger.warn(`Keep-alive failed: ${String(error)}`);
      return false;
    }
  }
}
