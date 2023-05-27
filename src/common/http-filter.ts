import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Catch()
export class HttpFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const req = ctx.getRequest<Request>(),
      res = ctx.getResponse<Response>(),
      next = ctx.getNext<NextFunction>();

    res.status(exception.getStatus()).json({
      sucess: false,
      time: new Date(),
      path: req.url,
      status: exception.getStatus(),
      errorMessage: exception.message,
    });
  }
}
