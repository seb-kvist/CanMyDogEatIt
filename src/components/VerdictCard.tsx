import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertTriangle } from "lucide-react";

interface Citation {
  title: string;
  url: string;
}

interface VerdictCardProps {
  verdict: "SAFE" | "CAUTION" | "UNSAFE" | "UNKNOWN";
  why: string;
  preparation?: string;
  portion?: string;
  symptoms?: string;
  citations?: Citation[];
  confidence?: string;
  foodName: string;
  language?: 'en' | 'sv';
}

// Language translations for VerdictCard
const verdictTranslations = {
  en: {
    title: "Can my dog eat",
    preparation: "Preparation",
    portionSize: "Portion Size",
    symptoms: "Symptoms to Watch For",
    references: "References",
    confidence: "Confidence",
    disclaimer: "Educational only — This information is not a substitute for professional veterinary advice. Always consult with your veterinarian before introducing new foods to your dog's diet."
  },
  sv: {
    title: "Kan min hund äta",
    preparation: "Tillagning",
    portionSize: "Portionsstorlek",
    symptoms: "Symptom att uppmärksamma",
    references: "Källor",
    confidence: "Säkerhet",
    disclaimer: "Endast för utbildning — Denna information är inte en ersättning för professionell veterinär rådgivning. Konsultera alltid med din veterinär innan du introducerar ny mat i din hunds kost."
  }
};

export function VerdictCard({
  verdict,
  why,
  preparation,
  portion,
  symptoms,
  citations,
  confidence,
  foodName,
  language = 'en'
}: VerdictCardProps) {
  const t = verdictTranslations[language];

  const getVerdictStyles = (verdict: string) => {
    switch (verdict) {
      case "SAFE":
        return "verdict-safe border-2";
      case "CAUTION":
        return "verdict-caution border-2";
      case "UNSAFE":
        return "verdict-unsafe border-2";
      default:
        return "verdict-unknown border-2";
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "SAFE":
        return "✅";
      case "CAUTION":
        return "⚠️";
      case "UNSAFE":
        return "❌";
      default:
        return "❓";
    }
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto shadow-card ${getVerdictStyles(verdict)}`}>
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-4xl">{getVerdictIcon(verdict)}</span>
          <Badge variant="secondary" className="text-lg px-4 py-2 font-bold">
            {verdict}
          </Badge>
        </div>
        <h2 className="text-2xl font-bold capitalize">
          {t.title} {foodName}?
        </h2>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-card/50 rounded-lg p-4">
          <p className="text-lg leading-relaxed">{why}</p>
        </div>

        {preparation && (
          <div>
            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
              {t.preparation}
            </h4>
            <p className="bg-card/30 rounded-lg p-3">{preparation}</p>
          </div>
        )}

        {portion && (
          <div>
            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
              {t.portionSize}
            </h4>
            <p className="bg-card/30 rounded-lg p-3">{portion}</p>
          </div>
        )}

        {symptoms && (
          <div>
            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {t.symptoms}
            </h4>
            <p className="bg-card/30 rounded-lg p-3">{symptoms}</p>
          </div>
        )}

        {citations && citations.length > 0 && (
          <div>
            <h4 className="font-semibold text-lg mb-3">{t.references}</h4>
            <div className="space-y-2">
              {citations.map((citation, index) => (
                <a
                  key={index}
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 underline transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {citation.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {confidence && (
          <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
            <span>{t.confidence}: <strong className="capitalize">{confidence}</strong></span>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground border-l-4 border-primary/50">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              <strong>{t.disclaimer}</strong>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}