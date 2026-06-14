import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from "dotenv";

dotenv.config();

const endpoint = process.env.AZURE_AI_ENDPOINT!;
const apiKey = process.env.AZURE_AI_KEY!;
const deploymentName = process.env.AZURE_AI_MODEL_DEPLOYMENT!;

const client = ModelClient(endpoint, new AzureKeyCredential(apiKey));

export async function chatCompletion(
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean = false
): Promise<string> {
  const response = await client.path("/chat/completions").post({
    body: {
      model: deploymentName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    },
  });

  if (response.status !== "200") {
    throw new Error(`Foundry API error: ${response.status} - ${JSON.stringify(response.body)}`);
  }

  const body = response.body as any;
  return body.choices[0].message.content;
}