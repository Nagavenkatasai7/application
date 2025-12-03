"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  MessageCircle,
  Loader2,
  AlertCircle,
  Send,
  Sparkles,
  Star,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/layout/page-transition";
import { CircularProgress } from "@/components/ui/circular-progress";
import { BentoCard } from "@/components/ui/bento-grid";
import {
  SOFT_SKILLS_LIST,
  getEvidenceScoreLabel,
} from "@/lib/validations/soft-skills";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface StartResponse {
  skillId: string;
  message: string;
  questionNumber: number;
}

interface ChatResponse {
  message: string;
  isComplete: boolean;
  questionNumber: number;
  evidenceScore: number | null;
  statement: string | null;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export default function SoftSkillsPage() {
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [skillId, setSkillId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [evidenceScore, setEvidenceScore] = useState<number | null>(null);
  const [statement, setStatement] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input after AI responds
  useEffect(() => {
    if (!isComplete && messages.length > 0 && messages[messages.length - 1].role === "assistant") {
      inputRef.current?.focus();
    }
  }, [messages, isComplete]);

  // Start assessment mutation
  const startMutation = useMutation({
    mutationFn: async (skillName: string) => {
      const res = await fetch("/api/modules/soft-skills/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName }),
      });
      const data: APIResponse<StartResponse> = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || "Failed to start assessment");
      }
      return data.data!;
    },
    onSuccess: (data) => {
      setSkillId(data.skillId);
      setMessages([{ role: "assistant", content: data.message }]);
      setQuestionNumber(data.questionNumber);
    },
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async ({ skillId, message }: { skillId: string; message: string }) => {
      const res = await fetch("/api/modules/soft-skills/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId, message }),
      });
      const data: APIResponse<ChatResponse> = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || "Failed to send message");
      }
      return data.data!;
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      setQuestionNumber(data.questionNumber);
      if (data.isComplete) {
        setIsComplete(true);
        setEvidenceScore(data.evidenceScore);
        setStatement(data.statement);
      }
    },
  });

  const handleStartAssessment = () => {
    if (!selectedSkill) return;
    // Reset state
    setMessages([]);
    setQuestionNumber(0);
    setIsComplete(false);
    setEvidenceScore(null);
    setStatement(null);
    setSkillId(null);
    // Start assessment
    startMutation.mutate(selectedSkill);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !skillId || chatMutation.isPending) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // Send to API
    chatMutation.mutate({ skillId, message: userMessage });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setSelectedSkill("");
    setSkillId(null);
    setMessages([]);
    setInputValue("");
    setQuestionNumber(0);
    setIsComplete(false);
    setEvidenceScore(null);
    setStatement(null);
  };

  const handleCopyStatement = async () => {
    if (!statement) return;
    await navigator.clipboard.writeText(statement);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progress = Math.min((questionNumber / 5) * 100, 100);
  const isLoading = startMutation.isPending || chatMutation.isPending;
  const hasStarted = messages.length > 0;

  return (
    <PageTransition>
      <div className="container max-w-4xl py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Soft Skills Survey</h1>
          </div>
          <p className="text-muted-foreground">
            Have a conversation with AI to assess your soft skills. Get an evidence-based score
            and a resume-ready statement that captures your strengths.
          </p>
        </div>

        {/* Skill Selector - only show if not started */}
        {!hasStarted && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select a Soft Skill to Assess</CardTitle>
              <CardDescription>
                Choose a skill to discuss. The AI will ask you 3-5 questions to understand
                your experience and generate a compelling resume statement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Select
                  value={selectedSkill}
                  onValueChange={setSelectedSkill}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a soft skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOFT_SKILLS_LIST.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleStartAssessment}
                  disabled={!selectedSkill || isLoading}
                >
                  {startMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start Assessment
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {(startMutation.isError || chatMutation.isError) && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>
                  {startMutation.error?.message || chatMutation.error?.message || "Something went wrong"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Interface */}
        {hasStarted && (
          <StaggerContainer className="space-y-6">
            {/* Progress Bar */}
            <StaggerItem>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedSkill}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Question {questionNumber} of ~5
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Start Over
                    </Button>
                  </div>
                  <Progress value={progress} className="h-2" />
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Messages */}
            <StaggerItem>
              <Card className="min-h-[400px] max-h-[500px] flex flex-col">
                <CardContent className="flex-1 overflow-y-auto py-6">
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-3 ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Loading indicator */}
                    {chatMutation.isPending && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>

                {/* Input Area - only show if not complete */}
                {!isComplete && (
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your response..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                      >
                        {chatMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </StaggerItem>

            {/* Results - show when complete */}
            {isComplete && evidenceScore && statement && (
              <StaggerItem>
                <Card className="overflow-hidden">
                  <CardContent className="pt-6 space-y-6">
                    {/* Score Section with CircularProgress */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <CircularProgress
                          value={evidenceScore * 20}
                          size="xl"
                          showLabel
                          animated
                          celebrate={evidenceScore >= 4}
                        />
                        <div>
                          <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                            Evidence Score
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="capitalize text-sm px-3 py-1">
                              {getEvidenceScoreLabel(evidenceScore)}
                            </Badge>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= evidenceScore
                                      ? "text-amber-500 fill-amber-500"
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mt-3 text-sm text-muted-foreground">
                            Based on specific examples and evidence you provided
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-primary">
                        <Sparkles className="h-5 w-5" />
                        <span className="font-medium">{selectedSkill}</span>
                      </div>
                    </div>

                    {/* Generated Statement - Enhanced */}
                    <BentoCard variant="glass" hover={false} animated>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-primary" />
                          <p className="text-xs text-primary uppercase tracking-wide font-medium">
                            Resume Statement
                          </p>
                        </div>
                        <p className="text-sm font-medium text-foreground leading-relaxed">
                          {statement}
                        </p>
                        <div className="pt-2 border-t border-border/50 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyStatement}
                            className="text-xs"
                          >
                            {copied ? (
                              <>
                                <Check className="h-3.5 w-3.5 mr-1.5 text-success" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 mr-1.5" />
                                Copy to Clipboard
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </BentoCard>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <Button onClick={handleReset} variant="outline" className="flex-1">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Assess Another Skill
                      </Button>
                      <Button onClick={handleCopyStatement} className="flex-1">
                        {copied ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Statement
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            )}
          </StaggerContainer>
        )}
      </div>
    </PageTransition>
  );
}
