import { NextApiRequest, NextApiResponse } from "next";
import { Task } from "@/models";
import { processUserQuery } from "@/utils/aiHandler";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  console.log("Request body:", req.body);
  const { prompt, userId, conversationHistory } = req.body;

  if (!prompt || !userId || !conversationHistory) {
    console.log("Missing prompt, userId, or conversationHistory");
    return res.status(400).json({ success: false, message: "Prompt, userId, and conversationHistory are required" });
  }

  try {
    const tasks = await Task.findAll({
      where: { userId },
      attributes: ["id", "title", "description", "dueDate", "priority", "status"],
    });

    const detailedPrompt = `
      You are a cheerful and motivating assistant with the personality of a happy and encouraging cat. Interpret the user's intent from the following prompt: "${prompt}" and respond accordingly. Here are the types of responses you can provide:
      1. CREATE_TASK: If the user wants to create a new task. Interpret any additional information the user provides in their response (title, due date, priority, description) and use it to fill in the task details. If any details are missing, ask the user conversationally and come up with a description if the user doesn't provide one.
         - Valid values for "priority" are: "LOW", "MEDIUM", and "HIGH".
         - Valid values for "status" are: "TO_DO", "IN_PROGRESS", and "DONE".
      2. UPDATE_TASK: If the user wants to update an existing task. Provide the task ID and the status update.
      3. DELETE_TASK: If the user wants to delete a task. Ask for confirmation and the task ID.
      4. CHAT: For general conversation, motivational messages, or casual small talk.
      Current tasks: ${JSON.stringify(tasks)}
      Conversation history:
      ${conversationHistory.join("\n")}
      Format your response as follows:
      {
        "intent": "intent_type",
        "payload": {
          "message": "response_message",
          "missingFields": ["field1", "field2"] (if applicable),
          "id": "task_id" (if applicable),
          "title": "task_title" (if applicable),
          "dueDate": "task_due_date" (if applicable),
          "priority": "task_priority" (if applicable),
          "status": "task_status" (if applicable)
        }
      }
      Always use a cheerful and motivational tone, as if you were an encouraging cat. Include cheerful and playful language.
    `;

    const aiResponseText = await processUserQuery(detailedPrompt);
    const sanitizedResponseText = aiResponseText.replace(/```json|```/g, '');

    try {
      const aiResponse = JSON.parse(sanitizedResponseText);

      if (aiResponse.intent === "CREATE_TASK") {
        const { missingFields } = aiResponse.payload;

        if (missingFields && missingFields.length > 0) {
          return res.status(200).json({
            success: false,
            message: aiResponse.payload.message,
            missingFields,
          });
        }

        const taskDetails = {
          ...aiResponse.payload,
          userId,
        };

        const task = await Task.create(taskDetails);
        return res.status(200).json({ success: true, result: task });
      }

      if (aiResponse.intent === "UPDATE_TASK") {
        const task = await Task.update(aiResponse.payload, { where: { id: aiResponse.payload.id } });
        return res.status(200).json({ success: true, result: task });
      }

      if (aiResponse.intent === "DELETE_TASK") {
        await Task.destroy({ where: { id: aiResponse.payload.id } });
        return res.status(200).json({ success: true, message: "Task deleted successfully." });
      }

      return res.status(200).json({ success: true, response: aiResponse.payload.message });
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  } catch (error) {
    console.error("Error processing request:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
