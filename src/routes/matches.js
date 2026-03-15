import { Router } from 'express';
import { desc } from 'drizzle-orm';
import { createMatchSchema, listMatchesQuerySchema } from '../validation/matches.js';
import { matches } from '../db/schema.js';
import {db} from '../db/db.js';
import { getMatchStatus } from '../utils/match-status.js';

export const matchRouter = Router();

const MAX_LIMIT = 100;

matchRouter.get('/', async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);

    if(!parsed.success) {
        return res.status(400).json({error: "Invalid query", details: JSON.stringify(parsed.error)});
    }

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT)

    try {
        const data = await db
        .select()
        .from(matches)
        .orderBy((desc(matches.createdAt)))
        .limit(limit)

     return res.json({data})

    } catch(error) {
        res.status(500).json({error: "Failed to list matches."});
    }
});

matchRouter.post('/', async(req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);

    if(!parse.success) {
        return res.status(400).json({error: "Invalid Payload", destails: JSON.stringify(parsed.error)});
    }

    try {
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(parsed.data.startTime),
            endTime: new Date(parsed.data.endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(startTime, endTime),
        }).returning();

        res.status(201).json({data: event});
    } catch (error) {
        res.status(500).json({"error": "Failed to create match", details: json.stringify(error)});
    }
})