"use client";

import * as React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useGenerateContent } from "@/features/ai/ai-queries";
import { AIOutputPanel } from "./ai-output-panel";

const CONTENT_TYPES = [
  { value: "linkedin_post", label: "LinkedIn Post" },
  { value: "x_thread", label: "X Thread" },
  { value: "content_idea", label: "Content Idea" },
  { value: "marketing_hook", label: "Marketing Hook" },
  { value: "startup_insight", label: "Startup Insight" },
  { value: "email_draft", label: "Email Draft" },
  { value: "outreach_message", label: "Outreach Message" },
];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "inspiring", label: "Inspiring" },
  { value: "direct", label: "Direct" },
  { value: "storytelling", label: "Storytelling" },
];

export function AIContentForm() {
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  const [contentType, setContentType] = React.useState("linkedin_post");
  const [topic, setTopic] = React.useState("");
  const [tone, setTone] = React.useState("professional");
  const [generatedContent, setGeneratedContent] = React.useState<string | null>(null);

  const mutation = useGenerateContent();

  const handleGenerate = () => {
    if (!workspaceId || !topic.trim()) return;
    mutation.mutate(
      { workspace_id: workspaceId, content_type: contentType, topic: topic.trim(), tone },
      {
        onSuccess: (data) => {
          setGeneratedContent(data.response_text);
        },
      }
    );
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-subtle">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-500">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Content Studio</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Generate startup content in seconds</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Content Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Content Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {CONTENT_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  onClick={() => setContentType(ct.value)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                    contentType === ct.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/50 bg-card hover:border-primary/30 hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Topic</label>
            <Input
              placeholder="e.g. How we got our first 100 users..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-muted/30 border-border/50"
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
          </div>

          {/* Tone */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    tone === t.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!topic.trim() || mutation.isPending}
            className="w-full rounded-xl font-medium h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output */}
      <AIOutputPanel
        content={generatedContent ?? ""}
        onRegenerate={handleRegenerate}
        isRegenerating={mutation.isPending}
      />
    </div>
  );
}
