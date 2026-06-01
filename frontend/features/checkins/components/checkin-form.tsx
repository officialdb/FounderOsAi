"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/feedback/form-error";
import { useCheckInStore } from "@/store/checkin-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useCreateCheckIn } from "../checkin-queries";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

const checkInSchema = z.object({
  completed_today: z.string().min(1, "Please tell us what you completed today."),
  blockers: z.string().min(1, "Please identify any blockers, or enter 'None'."),
  next_priorities: z.string().min(1, "Please set tomorrow's priorities."),
});

type CheckInFormValues = z.infer<typeof checkInSchema>;

export function CheckInForm() {
  const { isCheckInModalOpen, setCheckInModalOpen, setShowSummaryAfterSubmit } = useCheckInStore();
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const { mutateAsync: createCheckIn, isPending } = useCreateCheckIn();

  const [step, setStep] = React.useState<1 | 2 | 3>(1);

  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      completed_today: "",
      blockers: "",
      next_priorities: "",
    },
  });

  React.useEffect(() => {
    if (isCheckInModalOpen) {
      form.reset();
      setStep(1);
    }
  }, [isCheckInModalOpen, form]);

  const onSubmit = async (values: CheckInFormValues) => {
    if (!workspaceId) return;
    
    try {
      await createCheckIn({
        workspace_id: workspaceId,
        ...values,
      });
      setCheckInModalOpen(false);
      setShowSummaryAfterSubmit(true);
    } catch (error) {
      console.error("Failed to submit check-in", error);
    }
  };

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger("completed_today");
    } else if (step === 2) {
      isValid = await form.trigger("blockers");
    }
    
    if (isValid) {
      setStep((s) => (s + 1) as 2 | 3);
    }
  };

  return (
    <Dialog open={isCheckInModalOpen} onOpenChange={setCheckInModalOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background border-border/50">
        <div className="flex h-1.5 w-full bg-muted">
          <div 
            className="bg-primary transition-all duration-300 ease-in-out" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Daily Check-In
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Step 1 */}
            <div className={step === 1 ? "block space-y-4 animate-in fade-in slide-in-from-right-4" : "hidden"}>
              <div className="space-y-1">
                <h3 className="text-lg font-medium">What progress did you make today?</h3>
                <p className="text-sm text-muted-foreground">List the key tasks and milestones you completed.</p>
              </div>
              <Textarea
                placeholder="e.g., Completed landing page redesign, sent 10 outreach messages..."
                className="min-h-[120px] resize-none text-base p-4 focus-visible:ring-primary/50"
                autoFocus
                {...form.register("completed_today")}
              />
              <FormError message={form.formState.errors.completed_today?.message} />
              <div className="flex justify-end pt-2">
                <Button type="button" onClick={handleNext} className="rounded-full px-6">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className={step === 2 ? "block space-y-4 animate-in fade-in slide-in-from-right-4" : "hidden"}>
              <div className="space-y-1">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive/80" />
                  What slowed you down?
                </h3>
                <p className="text-sm text-muted-foreground">Identify any blockers, distractions, or technical issues.</p>
              </div>
              <Textarea
                placeholder="e.g., Waiting for client feedback, got distracted by emails..."
                className="min-h-[120px] resize-none text-base p-4 focus-visible:ring-primary/50"
                autoFocus
                {...form.register("blockers")}
              />
              <FormError message={form.formState.errors.blockers?.message} />
              <div className="flex justify-between pt-2">
                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="rounded-full">
                  Back
                </Button>
                <Button type="button" onClick={handleNext} className="rounded-full px-6">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Step 3 */}
            <div className={step === 3 ? "block space-y-4 animate-in fade-in slide-in-from-right-4" : "hidden"}>
              <div className="space-y-1">
                <h3 className="text-lg font-medium">What must get done tomorrow?</h3>
                <p className="text-sm text-muted-foreground">Set clear priorities for your next execution block.</p>
              </div>
              <Textarea
                placeholder="e.g., Finish outreach campaign, launch homepage..."
                className="min-h-[120px] resize-none text-base p-4 focus-visible:ring-primary/50"
                autoFocus
                {...form.register("next_priorities")}
              />
              <FormError message={form.formState.errors.next_priorities?.message} />
              <div className="flex justify-between pt-2">
                <Button type="button" variant="ghost" onClick={() => setStep(2)} className="rounded-full">
                  Back
                </Button>
                <Button type="submit" disabled={isPending} className="rounded-full px-6">
                  {isPending ? "Generating Feedback..." : "Submit Check-In"}
                </Button>
              </div>
            </div>

          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
