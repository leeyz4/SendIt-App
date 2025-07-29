import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const handler = context.getHandler().name;
    console.log(`Route: ${handler}, isPublic:`, isPublic);
    if (isPublic) {
      return true;
    }
    if (context.getHandler().name === 'test') {
      console.log('Bypassing guard for test route');
      return true;
    }
    return super.canActivate(context);
  }
}
