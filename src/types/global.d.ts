import type { Request, Response, NextFunction } from 'express';

declare global {
  interface Req extends Request {
    user?: any;
    params?:any;
    body?: any;
    query?: any;
    headers?: any; 
    files?: any;
  }

  interface CustomRes extends Response {
    success: (data?: any, message?: string, statusCode?: number) => CustomRes;
    error: (message?: string, statusCode?: number, errors?: any[]) => CustomRes;
  }

  type Res = CustomRes;
  type Next = NextFunction;
}
