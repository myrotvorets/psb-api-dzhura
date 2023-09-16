import { type NextFunction, type Request, type Response, Router } from 'express';
import { asyncWrapperMiddleware } from '@myrotvorets/express-async-middleware-wrapper';
import { SearchService } from '../services/search.mjs';

async function searchHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    const result = await SearchService.search(req.query.s as string);
    if (result === null) {
        next({
            success: false,
            status: 400,
            code: 'BAD_SEARCH_TERM',
            message: 'Both surname and name are required',
        });
    } else {
        res.json({
            success: true,
            items: result,
        });
    }
}

export function searchController(): Router {
    const router = Router();
    router.get('/search', asyncWrapperMiddleware(searchHandler));
    return router;
}
