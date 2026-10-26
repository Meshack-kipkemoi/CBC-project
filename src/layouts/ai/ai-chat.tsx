"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { getToolName, isToolUIPart, type UIMessage } from "ai";
import {
  ArrowUpIcon,
  CircleCheckIcon,
  LoaderCircleIcon,
  MessageCircleDashedIcon,
  RotateCwIcon,
  WrenchIcon,
} from "lucide-react";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function AiChat() {
  const { messages, sendMessage, setMessages, status } = useChat();
  const [text, setText] = React.useState("");
  const formRef = React.useRef<HTMLFormElement>(null);

  const busy = status === "submitted" || status === "streaming";
  const canSend = text.trim().length > 0 && !busy;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;
    void sendMessage({ text: text.trim() });
    setText("");
  }

  return (
    <MessageScrollerProvider>
      <div className="flex h-full min-h-0 w-full flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-4 pt-4">
          <div className="flex flex-col gap-1">
            <div className="font-medium">CBC AI</div>
            <div className="text-sm text-muted-foreground">
              Ask anything to get started.
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Reset conversation"
            onClick={() => {
              setMessages([]);
              setText("");
            }}
            disabled={busy || messages.length === 0}
          >
            <RotateCwIcon />
          </Button>
        </div>

        {/* Messages */}
        <div className="min-h-0 flex-1">
          {messages.length === 0 ? (
            <Empty className="h-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageCircleDashedIcon />
                </EmptyMedia>
                <EmptyTitle>How can I help?</EmptyTitle>
                <EmptyDescription>
                  Type a message below to start a conversation.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent
                  aria-busy={busy}
                  className="gap-6 px-4 py-0"
                >
                  {messages.map((message) => {
                    if (message.role === "user") {
                      return (
                        <MessageScrollerItem
                          key={message.id}
                          messageId={message.id}
                          scrollAnchor
                        >
                          <Message align="end">
                            <MessageContent>
                              <Bubble align="end" variant="muted">
                                <BubbleContent>
                                  {getMessageText(message)}
                                </BubbleContent>
                              </Bubble>
                            </MessageContent>
                          </Message>
                        </MessageScrollerItem>
                      );
                    }

                    const streaming = busy && message === messages.at(-1);
                    const steps = message.parts.filter(
                      (part) => part.type === "reasoning" || isToolUIPart(part),
                    );
                    const reply = getMessageText(message);

                    return (
                      <MessageScrollerItem
                        key={message.id}
                        messageId={message.id}
                      >
                        <Message>
                          <MessageContent className="gap-3">
                            {steps.length > 0 && (
                              <Trace>
                                {steps.map((part, index) => (
                                  <StepRow
                                    key={index}
                                    part={part}
                                    streaming={streaming}
                                  />
                                ))}
                              </Trace>
                            )}
                            {reply && (
                              <p className="whitespace-pre-wrap">{reply}</p>
                            )}
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    );
                  })}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          )}
        </div>

        {/* Input */}
        <div className="px-4 pb-4">
          <form ref={formRef} onSubmit={onSubmit} className="w-full">
            <InputGroup>
              <InputGroupTextarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Ask CBC AI..."
                aria-label="Message"
                className="min-h-14"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
              />
              <InputGroupAddon align="block-end" className="pt-1">
                <InputGroupButton
                  type="submit"
                  variant="default"
                  size="icon-sm"
                  disabled={!canSend}
                  className="ml-auto"
                >
                  <ArrowUpIcon />
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </div>
      </div>
    </MessageScrollerProvider>
  );
}

type Part = UIMessage["parts"][number];

function StepRow({ part, streaming }: { part: Part; streaming: boolean }) {
  if (part.type === "reasoning") {
    return (
      <ReasoningRow text={part.text} running={part.state === "streaming"} />
    );
  }

  if (isToolUIPart(part)) {
    const done = part.state === "output-available";
    const failed = part.state === "output-error";
    const running = !done && !failed && streaming;

    return (
      <TraceLine status={failed ? "error" : running ? "running" : undefined}>
        <TraceIcon>
          {running ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <WrenchIcon />
          )}
        </TraceIcon>
        <TraceTitle>
          {failed ? "Failed" : running ? "Running" : "Ran"} {getToolName(part)}
        </TraceTitle>
      </TraceLine>
    );
  }

  return null;
}

function ReasoningRow({ text, running }: { text: string; running: boolean }) {
  const [open, setOpen] = React.useState<boolean>();

  return (
    <TraceCollapsible open={open ?? running} onOpenChange={setOpen}>
      <TraceCollapsibleTrigger>
        <TraceLine status={running ? "running" : undefined}>
          <TraceIcon>
            {running ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <CircleCheckIcon />
            )}
          </TraceIcon>
          <TraceTitle>{running ? "Thinking" : "Thought"}</TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent className="whitespace-pre-wrap">
        {text}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}
