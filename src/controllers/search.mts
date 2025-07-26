import { type NextFunction, type Request, type Response, Router } from 'express';
import { ApiError } from '@myrotvorets/express-microservice-middlewares';
import type { SearchItem } from '../services/searchservice.mjs';
import { LocalsWithContainer } from '../lib/container.mjs';

type DefaultParams = Record<string, unknown>;

interface SearchRequestParams {
    s: string;
}

interface SearchResponse {
    success: true;
    items: SearchItem[];
}

async function searchHandler(
    req: Request<DefaultParams, SearchResponse, never, SearchRequestParams>,
    res: Response<SearchResponse, LocalsWithContainer>,
    next: NextFunction,
): Promise<void> {
    const service = res.locals.container.resolve('searchService');
    const result = await service.search(req.query.s);
    if (result === null) {
        next(new ApiError(400, 'BAD_SEARCH_TERM', 'Both surname and name are required'));
    } else {
        res.json({
            success: true,
            items: result,
        });
    }
}

export function searchController(): Router {
    const router = Router();
    router.get('/search', searchHandler);
    return router;
}
