import { Request, Response, NextFunction } from 'express';

/**
 * Clase para errores personalizados de la aplicación
 */
export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational: boolean = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Middleware para rutas no encontradas (404)
 * Debe ir ANTES del errorHandler en app.ts
 */
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path
    });
};

/**
 * Middleware global de manejo de errores
 * DEBE IR AL FINAL de app.ts, después de todas las rutas
 * 
 * SEGURIDAD: No expone stack traces en producción
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Determinar si es un error operacional o de programación
    const isOperational = err instanceof AppError && err.isOperational;
    const statusCode = err instanceof AppError ? err.statusCode : 500;

    // En producción, NO enviar detalles del error
    const isDev = process.env.NODE_ENV === 'development';

    // Log del error (sin exponer en la respuesta)
    if (!isOperational) {
        console.error('Error no operacional:', {
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method
        });
    }

    res.status(statusCode).json({
        error: isOperational ? err.message : 'Error interno del servidor',
        ...(isDev && {
            message: err.message,
            stack: err.stack
        })
    });
};
