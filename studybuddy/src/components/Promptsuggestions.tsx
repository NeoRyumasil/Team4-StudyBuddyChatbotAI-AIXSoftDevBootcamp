import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const prompts = [
  'Make a 2-3 question quiz about a topic of that',
  'Create a flashcard for quick review',
  'Create a mind map for the topic',
  'create a summary of the topic',
];

export function PromptSuggestions({ sendMessage }: { sendMessage: (msg: { text: string }) => void }) {
  return (
    <Card className="w-full bg-blue-50 border-blue-200 shadow-sm rounded-lg my-1 mx-0">
      <CardContent className="flex flex-row flex-wrap justify-center gap-3 p-1">
        {prompts.map((prompt, idx) => (
          <Button
            key={idx}
            type="button"
            variant="secondary"
            size="sm"
            className="flex items-center justify-center min-w-[100px] max-w-[140px] h-[90px] px-2 py-2 text-blue-900 bg-blue-100 border-blue-300 hover:bg-blue-200 text-wrap rounded-lg whitespace-normal break-words"
            onClick={() => sendMessage({ text: prompt })}
          >
            {prompt}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}