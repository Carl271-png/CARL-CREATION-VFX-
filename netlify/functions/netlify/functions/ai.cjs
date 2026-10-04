
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { tool, prompt } = JSON.parse(event.body || "{}");

    const instructions = {
      chat: "You are CARL AI, a helpful creative assistant.",
      caption: "Create engaging, original social media captions.",
      video: "Create a creative video script with scenes and dialogue.",
      ideas: "Suggest original, funny and engaging content ideas."
    };

    if (!instructions[tool] ||
        typeof prompt !== "string" ||
        !prompt.trim() ||
        prompt.length > 4000) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request" })
      };
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-5-mini",
          instructions: instructions[tool],
          input: prompt.trim(),
          max_output_tokens: 700
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: "AI request failed. Check API settings."
        })
      };
    }

    const text = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ result: text })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Something went wrong."
      })
    };
  }
};
