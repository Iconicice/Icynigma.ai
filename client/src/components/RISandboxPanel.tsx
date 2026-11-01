import { useState } from "react";
import { ShieldCheck, Sparkles, Check, FlaskConical } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function RISandboxPanel() {
  const [message, setMessage] = useState("");
  const analysis = trpc.ri.analyze.useMutation();
  const approveMemory = trpc.ri.approveMemory.useMutation();
  const queueProposal = trpc.ri.queueCodeProposal.useMutation();

  const runAnalysis = () => {
    if (message.trim()) analysis.mutate({ message });
  };

  return (
    <section className="space-y-4 rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/5 p-4" aria-labelledby="ri-title">
      <div className="flex items-start gap-3">
        <div className="rounded-lg border border-fuchsia-300/20 bg-fuchsia-400/10 p-2"><FlaskConical className="h-5 w-5 text-fuchsia-200" aria-hidden="true" /></div>
        <div>
          <h3 id="ri-title" className="font-semibold text-foreground">R.I. Sandbox</h3>
          <p className="text-xs text-muted-foreground">Adaptive suggestions and reversible engineering proposals. Nothing executes automatically.</p>
        </div>
      </div>
      <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe a preference or improvement you want Icynigma to explore…" aria-label="R.I. sandbox task" />
      <Button type="button" onClick={runAnalysis} disabled={!message.trim() || analysis.isPending} className="w-full"><Sparkles className="mr-2 h-4 w-4" />{analysis.isPending ? "Analyzing…" : "Analyze safely"}</Button>
      {analysis.data && <div className="space-y-3 rounded-lg border border-border/60 bg-background/40 p-3">
        <p className="text-sm text-foreground">{analysis.data.summary}</p>
        {analysis.data.memorySuggestions.length > 0 && <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suggested memory</p>{analysis.data.memorySuggestions.map((suggestion) => <div key={`${suggestion.key}-${suggestion.value}`} className="flex items-center justify-between gap-2 rounded-md border border-border/50 p-2"><div className="min-w-0"><p className="text-sm text-foreground">{suggestion.value}</p><p className="text-xs text-muted-foreground">{suggestion.reason}</p></div><Button type="button" size="sm" variant="outline" onClick={() => approveMemory.mutate({ key: suggestion.key, value: suggestion.value })} disabled={approveMemory.isPending}><Check className="mr-1 h-3 w-3" />Save</Button></div>)}</div>}
        <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Code proposal</p><p className="text-sm font-medium text-foreground">{analysis.data.codeProposal.title}</p><p className="text-xs text-muted-foreground">{analysis.data.codeProposal.rationale}</p><Button type="button" size="sm" variant="outline" onClick={() => queueProposal.mutate({ title: analysis.data.codeProposal.title })} disabled={queueProposal.isPending}><ShieldCheck className="mr-1 h-3 w-3" />Queue for review</Button></div>
        <p className="text-xs text-muted-foreground">Approval is required. Code is never generated into or executed against production from this panel.</p>
      </div>}
    </section>
  );
}
