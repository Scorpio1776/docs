import { Task, Agent, TaskOutput } from '@/lib/types';
import { getOpenAIClient, getOpenAIModel } from '@/lib/openai';

function buildSystemMessage(agent: Agent): string {
  return [
    agent.systemPrompt,
    '',
    `You are operating as the "${agent.name}" agent (role: ${agent.role}).`,
    `Your available tools/capabilities: ${agent.tools.join(', ')}.`,
    '',
    'Produce your output in clean, well-structured markdown unless instructed otherwise.',
  ].join('\n');
}

function buildUserMessage(task: Task): string {
  const parts: string[] = [];

  parts.push(`# Task: ${task.title}`);
  parts.push('');

  if (task.description) {
    parts.push(`## Description`);
    parts.push(task.description);
    parts.push('');
  }

  parts.push(`## Instructions`);
  parts.push(task.input.prompt);
  parts.push('');

  if (task.input.context.length > 0) {
    parts.push(`## Additional Context`);
    task.input.context.forEach((ctx, i) => {
      parts.push(`${i + 1}. ${ctx}`);
    });
    parts.push('');
  }

  if (task.input.newsItems.length > 0) {
    parts.push(`## Reference News Items`);
    task.input.newsItems.forEach((item, i) => {
      parts.push(`### ${i + 1}. ${item.title}`);
      parts.push(`- Source: ${item.source} (${item.url})`);
      parts.push(`- Published: ${item.publishedAt}`);
      if (item.summary) {
        parts.push(`- Summary: ${item.summary}`);
      }
      if (item.whyItMatters) {
        parts.push(`- Why it matters: ${item.whyItMatters}`);
      }
      parts.push('');
    });
  }

  if (task.input.constraints) {
    parts.push(`## Constraints`);
    parts.push(task.input.constraints);
    parts.push('');
  }

  parts.push(`## Deliverable Type: ${task.deliverableType}`);
  parts.push(`## Priority: ${task.priority}`);

  if (task.deadline) {
    parts.push(`## Deadline: ${task.deadline}`);
  }

  return parts.join('\n');
}

export async function executeTask(task: Task, agent: Agent): Promise<TaskOutput> {
  try {
    const client = await getOpenAIClient();
    const model = await getOpenAIModel();

    const systemMessage = buildSystemMessage(agent);
    const userMessage = buildUserMessage(task);

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const choice = response.choices[0];
    const content = choice?.message?.content || 'No content was generated.';
    const tokensUsed =
      (response.usage?.prompt_tokens ?? 0) + (response.usage?.completion_tokens ?? 0);

    return {
      content,
      format: 'markdown',
      tokensUsed,
      model: response.model,
      generatedAt: new Date().toISOString(),
      rating: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: `## Task Execution Error\n\nThe agent encountered an error while processing this task:\n\n\`\`\`\n${message}\n\`\`\`\n\nPlease check your OpenAI API key and model settings, then try again.`,
      format: 'markdown',
      tokensUsed: 0,
      model: 'error',
      generatedAt: new Date().toISOString(),
      rating: null,
    };
  }
}
