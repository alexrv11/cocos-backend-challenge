import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram, Counter } from 'prom-client';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_request_duration_seconds')
    private readonly requestDuration: Histogram,
    @InjectMetric('http_requests_total')
    private readonly requestsTotal: Counter,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const route = req.route?.path ?? req.url;
    const end = this.requestDuration.startTimer({ method, route });

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const status = String(res.statusCode);
          end({ status });
          this.requestsTotal.inc({ method, route, status });
        },
        error: (err) => {
          const status = String(err.status ?? 500);
          end({ status });
          this.requestsTotal.inc({ method, route, status });
        },
      }),
    );
  }
}
