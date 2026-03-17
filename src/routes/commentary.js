import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { createCommentarySchema, listCommentaryQuerySchema } from "../validation/commentary.js";
import { matchIdParamSchema } from "../validation/matches.js";
import { commentary } from "../db/schema.js";
import { db } from "../db/db.js";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 100;

export const commentaryRouter = Router();

commentaryRouter.get('/', async (req, res) => {
    const paramsResult = matchIdParamSchema.safeParse(req.params);
    if (!paramsResult.success) {
        return res.status(400).json({ error: "Invalid params", details: paramsResult.error.issues });
    }

    const queryResult = listCommentaryQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
        return res.status(400).json({ error: "Invalid query", details: queryResult.error.issues });
    }

    try {
        const { id: matchId } = paramsResult.data;
        const { limit = 10 } = queryResult.data;
        
        const safeLimit = Math.min(limit, MAX_LIMIT);

        const results = await db
            .select()
            .from(commentary)
            .where(eq(commentary.matchId, matchId))
            .orderBy(desc(commentary.createdAt))
            .limit(safeLimit);

        res.status(200).json({ data: results });
    } catch (error) {
        console.error('Failed to fetch commentary:', error);
        return res.status(500).json({ error: "Failed to list commentary" });
    }
});

commentaryRouter.post('/', async (req, res) => {
    const paramsResult = matchIdParamSchema.safeParse(req.params);
    if (!paramsResult.success) {
        return res.status(400).json({ error: "Invalid params", details: paramsResult.error.issues });
    }

    const bodyResult = createCommentarySchema.safeParse(req.body);
    if (!bodyResult.success) {
        return res.status(400).json({ error: "Invalid payload", details: bodyResult.error.issues });
    }

    const { id: matchId } = paramsResult.data;
    const data = bodyResult.data;

    try {
        const [result] = await db
            .insert(commentary)
            .values({
                matchId,
                minute: data.minute,
                sequence: data.sequence,
                period: data.period,
                eventType: data.eventType,
                actor: data.actor,
                team: data.team,
                message: data.message,
                metadata: data.metadata,
                tags: data.tags,
            })
            .returning();

        if(res.app.locals.broadcastCommentary) {
            res.app.locals.broadcastCommentary(result.matchId, result);
        }

        return res.status(201).json({ data: result });
    } catch (error) {
        return res.status(500).json({ error: "Failed to create commentary" });
    }
});