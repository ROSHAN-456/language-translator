export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> {
  const from = sourceLang === "auto" ? "" : sourceLang;
  const langpair = `${from}|${targetLang}`;

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Translation service unavailable. Please try again.");
  }

  const data = await response.json();

  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails || "Translation failed.");
  }

  return {
    translatedText: data.responseData.translatedText,
    detectedLanguage: data.responseData.match?.source,
  };
}
