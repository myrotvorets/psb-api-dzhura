import { type NextFunction, type Request, RequestHandler, type Response, Router } from 'express';
import { asyncWrapperMiddleware } from '@myrotvorets/express-async-middleware-wrapper';
import { type SearchItem, SearchService } from '../services/search.mjs';
import { environment } from '../lib/environment.mjs';

type DefaultParams = Record<string, unknown>;

interface SearchRequestParams {
    s: string;
}

interface SearchResponse {
    success: true;
    items: SearchItem[];
}

function searchHandler(
    service: SearchService,
): RequestHandler<DefaultParams, SearchResponse, never, SearchRequestParams> {
    return asyncWrapperMiddleware(async function _searchHandler(
        req: Request<DefaultParams, SearchResponse, never, SearchRequestParams>,
        res: Response<SearchResponse>,
        next: NextFunction,
    ): Promise<void> {
        const result = await service.search(req.query.s);
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
    });
}

export function searchController(): Router {
    const router = Router();
    const env = environment();
    const service = new SearchService(env.IMAGE_CDN_PREFIX);

    router.get('/search', searchHandler(service));
    return router;
}
