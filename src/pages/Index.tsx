import { useState, useCallback } from "react";
import { Languages, ArrowLeftRight, Copy, Volume2, Trash2, Loader2, Check, Globe } from "lucide-react";
import { languages, AUTO_DETECT, type Language } from "@/lib/languages";
import { translateText } from "@/lib/translate";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState<Language>(AUTO_DETECT);
  const [targetLang, setTargetLang] = useState<Language>(languages.find(l => l.code === "es")!);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) {
      setError("Please enter text to translate.");
      return;
    }
    if (sourceLang.code === targetLang.code && sourceLang.code !== "auto") {
      setError("Source and target languages must be different.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const result = await translateText(sourceText, sourceLang.code, targetLang.code);
      setTranslatedText(result.translatedText);
    } catch (err: any) {
      setError(err.message || "Translation failed.");
      setTranslatedText("");
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, sourceLang, targetLang]);

  const handleSwap = () => {
    if (sourceLang.code === "auto") return;
    const tmpLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tmpLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = async () => {
    if (!translatedText) return;
    await navigator.clipboard.writeText(translatedText);
    setCopied(true);
    toast({ title: "Copied!", description: "Translation copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!translatedText) return;
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang.code;
    speechSynthesis.speak(utterance);
  };

  const handleClear = () => {
    setSourceText("");
    setTranslatedText("");
    setError("");
  };

  const charCount = sourceText.length;

  return (
    <div className="min-h-screen hero-gradient">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/60 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="p-2 rounded-xl primary-gradient">
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Lingua</h1>
          <span className="text-sm text-muted-foreground hidden sm:inline">Universal Translator</span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
            Translate Anything, <span className="text-primary">Instantly</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Break language barriers with support for 80+ languages. Fast, free, and beautiful.
          </p>
        </div>

        {/* Language Selectors + Swap */}
        <div className="flex items-center justify-center gap-2 mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <LanguageSelect
            value={sourceLang}
            onChange={setSourceLang}
            languages={[AUTO_DETECT, ...languages]}
            label="From"
          />
          <button
            onClick={handleSwap}
            disabled={sourceLang.code === "auto"}
            className="p-2.5 rounded-full border border-border bg-card card-shadow hover:card-shadow-hover hover:border-primary/30 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed group"
            title="Swap languages"
          >
            <ArrowLeftRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
          <LanguageSelect
            value={targetLang}
            onChange={setTargetLang}
            languages={languages}
            label="To"
          />
        </div>

        {/* Translation Panels */}
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          {/* Source */}
          <div className="bg-card rounded-2xl border border-border card-shadow p-4 flex flex-col">
            <textarea
              value={sourceText}
              onChange={(e) => { setSourceText(e.target.value); setError(""); }}
              placeholder="Enter text to translate..."
              className="flex-1 min-h-[180px] md:min-h-[220px] resize-none bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none text-base leading-relaxed"
            />
            <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-2">
              <span className="text-xs text-muted-foreground">{charCount} / 5000</span>
              <button
                onClick={handleClear}
                disabled={!sourceText}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                title="Clear"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Target */}
          <div className="bg-card rounded-2xl border border-border card-shadow p-4 flex flex-col">
            <div className="flex-1 min-h-[180px] md:min-h-[220px] text-base leading-relaxed">
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground animate-pulse-soft">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Translating...
                </div>
              ) : translatedText ? (
                <p className="text-foreground whitespace-pre-wrap">{translatedText}</p>
              ) : (
                <p className="text-muted-foreground/40">Translation will appear here...</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-1 pt-3 border-t border-border/50 mt-2">
              <button
                onClick={handleSpeak}
                disabled={!translatedText}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                title="Listen"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                disabled={!translatedText}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                title="Copy"
              >
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center animate-fade-in-up">
            {error}
          </div>
        )}

        {/* Translate Button */}
        <div className="flex justify-center mt-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <button
            onClick={handleTranslate}
            disabled={isLoading || !sourceText.trim()}
            className="px-8 py-3 rounded-xl primary-gradient text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Languages className="w-4 h-4" />
            )}
            Translate
          </button>
        </div>
      </main>
    </div>
  );
};

/* Language Select Component */
function LanguageSelect({
  value,
  onChange,
  languages: langs,
  label,
}: {
  value: Language;
  onChange: (lang: Language) => void;
  languages: Language[];
  label: string;
}) {
  return (
    <div className="flex-1 max-w-[200px]">
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1 block text-center">
        {label}
      </label>
      <select
        value={value.code}
        onChange={(e) => {
          const found = langs.find((l) => l.code === e.target.value);
          if (found) onChange(found);
        }}
        className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/30 card-shadow appearance-none cursor-pointer text-center transition-all hover:border-primary/30"
      >
        {langs.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Index;
