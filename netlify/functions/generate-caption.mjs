
export default async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { topic, language = "Sheng + English", style = "funny" } =
      await req.json();

    if (!topic || typeof topic !== "string" || topic.length > 500) {
      return new Response(
        JSON.stringify({ error: "Please enter a topic (up to 500 characters)." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const apiKey = Netlify.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI is not configured yet." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Create 3 original social media captions for this topic: ${topic}.
Language: ${language}.
Style: ${style}.
Make them catchy, natural, and suitable for TikTok.
Return only the 3 captions as a numbered list.`,
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "The AI request failed. Please try again." }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const caption = data.output
      ?.flatMap((item) => item.content || [])
      .find((item) => item.type === "output_text")?.text;

    return new Response(
      JSON.stringify({ captions: caption || "No captions generated." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const config = {
  path: "/api/generate-caption",
};
