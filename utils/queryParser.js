import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parseQueryWithLLM(userQuery) {
  const prompt = `
You are a real estate assistant. Extract structured filters from the user query.
User query: "${userQuery}"

Return a JSON object with the following keys:
- city: name of the city (null if not mentioned)
- bhk: number (1, 2, 3, 4) (null if not mentioned)
- maxPrice: maximum price in Crores (number, null if not mentioned)
- possession: "Ready" or "Under Construction" (null if not mentioned)
- locality: locality or neighborhood name (null if not mentioned)
- projectName: exact project name (null if not mentioned)
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a helpful real estate assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 200,
    });

    const text = response.choices[0].message.content.trim();

    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("Failed to parse LLM output:", text);
      return {
        city: null,
        bhk: null,
        maxPrice: null,
        possession: null,
        locality: null,
        projectName: null,
      };
    }
  } catch (error) {
    console.error("Error in LLM query parser:", error);
    return {
      city: null,
      bhk: null,
      maxPrice: null,
      possession: null,
      locality: null,
      projectName: null,
    };
  }
}
