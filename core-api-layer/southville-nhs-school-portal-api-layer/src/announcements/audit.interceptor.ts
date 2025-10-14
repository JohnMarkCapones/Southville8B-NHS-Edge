import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            `Audit: ${method} ${url} - User: ${user?.id} - Duration: ${Date.now() - now}ms - Success`,
          );
        },
        error: (error) => {
          this.logger.error(
            `Audit: ${method} ${url} - User: ${user?.id} - Duration: ${Date.now() - now}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
