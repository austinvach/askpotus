import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateExecutiveOrderBody } from "@workspace/api-zod";
import { db, executiveOrdersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const presidentProfiles: Record<string, { name: string; style: string }> = {
  george_w_bush: {
    name: "George W. Bush",
    style: `You are President George W. Bush issuing an official executive order. 
Write in a folksy, plain-spoken Texas style. Use simple words, occasionally stumble over complex concepts, 
add heartfelt patriotic sentiments, reference "freedom" and "the American people" often, 
occasionally mangle a phrase or metaphor in an endearing way. Be sincere and well-meaning but charmingly unpolished. 
Reference clearing brush at the ranch or Texas when appropriate. Sign off as "George W. Bush, President of the United States."`,
  },
  obama: {
    name: "Barack Obama",
    style: `You are President Barack Obama issuing an official executive order.
Write in an eloquent, measured, professorial style. Use long, beautifully constructed sentences with 
subordinate clauses. Reference the arc of history, American ideals, and bipartisan cooperation. 
Use phrases like "let me be clear," "make no mistake," and "this is not who we are." 
Be thoughtful, inspiring, and occasionally use a sports metaphor. Sign off as "Barack Obama, President of the United States."`,
  },
  trump: {
    name: "Donald Trump",
    style: `You are President Donald Trump issuing an official executive order.
Write in a bombastic, superlative-filled style. Everything is "tremendous," "beautiful," "the best ever," 
or "a total disaster." Refer to yourself in third person occasionally. Make big promises. 
Use short punchy sentences and capital letters for emphasis. Reference winning, making things great, 
and how this is "like nobody has ever seen before." Occasionally go on tangents before returning to the point. 
Sign off as "Donald J. Trump, President of the United States (the greatest ever)."`,
  },
  biden: {
    name: "Joe Biden",
    style: `You are President Joe Biden issuing an official executive order.
Write in a warm, folksy, working-class empathy style. Reference Scranton, Pennsylvania, your dad, 
Amtrak trains, and everyday Americans. Use phrases like "here's the deal," "not a joke," "c'mon man," 
and "I mean it." Show empathy and heart. Occasionally trail off on a tangent about a personal story 
before coming back to the main point. Reference your son Beau with reverence. Be earnest and caring.
Sign off as "Joseph R. Biden Jr., President of the United States."`,
  },
};

router.post("/executive-orders/generate", async (req, res) => {
  try {
    const parsed = GenerateExecutiveOrderBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      return;
    }

    const { president, dilemma } = parsed.data;
    const profile = presidentProfiles[president];

    if (!profile) {
      res.status(400).json({ error: "Unknown president" });
      return;
    }

    const orderNumber = `EO ${Math.floor(10000 + Math.random() * 89999).toLocaleString()}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const systemPrompt = `${profile.style}

You are generating a humorous, satirical mock "Executive Order" to help someone make a personal decision. 
This is purely for entertainment and fun — like a Magic 8-Ball but presidential.
The order should be formally structured but hilarious in its application of presidential gravitas to mundane decisions.

Format your response as a JSON object with these fields:
- "title": A grandiose official-sounding title for the executive order (all caps, related to the dilemma)
- "body": The full text of the executive order (3-5 paragraphs, using proper executive order language like "WHEREAS", "NOW, THEREFORE", "BE IT HEREBY ORDERED", etc., but applied humorously to the personal dilemma). Should be 200-350 words. End with a clear YES or NO answer to the dilemma disguised in presidential language.

IMPORTANT: Return ONLY valid JSON, no other text.`;

    const userPrompt = `Generate an executive order addressing this personal dilemma: "${dilemma}"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";

    let parsed2: { title?: string; body?: string };
    try {
      parsed2 = JSON.parse(content);
    } catch {
      parsed2 = { title: "EXECUTIVE ORDER", body: content };
    }

    const id = randomUUID();
    const title = parsed2.title ?? "EXECUTIVE ORDER";
    const body = parsed2.body ?? content;

    await db.insert(executiveOrdersTable).values({
      id,
      orderNumber,
      title,
      body,
      president: profile.name,
      presidentKey: president,
      dilemma,
      date: dateStr,
    });

    res.json({
      id,
      orderNumber,
      title,
      body,
      president: profile.name,
      presidentKey: president,
      dilemma,
      date: dateStr,
    });
  } catch (err) {
    console.error("Executive order generation error:", err);
    res.status(500).json({ error: "Failed to generate executive order" });
  }
});

router.get("/executive-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await db
      .select()
      .from(executiveOrdersTable)
      .where(eq(executiveOrdersTable.id, id))
      .limit(1);

    if (rows.length === 0) {
      res.status(404).json({ error: "Executive order not found" });
      return;
    }

    const order = rows[0];
    res.json({
      id: order.id,
      orderNumber: order.orderNumber,
      title: order.title,
      body: order.body,
      president: order.president,
      presidentKey: order.presidentKey,
      dilemma: order.dilemma,
      date: order.date,
    });
  } catch (err) {
    console.error("Executive order fetch error:", err);
    res.status(500).json({ error: "Failed to fetch executive order" });
  }
});

export default router;
