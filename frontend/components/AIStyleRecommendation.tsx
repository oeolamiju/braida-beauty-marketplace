import { useState } from "react";
import { Upload, Sparkles, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import backend from "~backend/client";
import { useNavigate } from "react-router-dom";

interface AIStyleRecommendationProps {
  variant?: "hero" | "compact";
}

export default function AIStyleRecommendation({ variant = "compact" }: AIStyleRecommendationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const navigate = useNavigate();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    try {
      const response = await backend.ai_recommendations.analyze({
        imageUrl: imagePreview,
        analysisType: "full",
      });
      setResults(response);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview("");
    setResults(null);
  };

  if (variant === "hero") {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-500 rounded-full">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">AI Style Recommendations</h3>
            <p className="text-sm text-gray-700 mb-4">
              Upload your photo and let our AI analyze your face shape and skin tone to recommend 
              the perfect hairstyles and makeup that suit you best.
            </p>
            <Button 
              onClick={() => setIsOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Get Personalized Recommendations
            </Button>
          </div>
        </div>
        {renderDialog()}
      </Card>
    );
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        AI Style Match
      </Button>
      {renderDialog()}
    </>
  );

  function renderDialog() {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              AI Style Recommendations
            </DialogTitle>
            <DialogDescription>
              Upload your photo to get personalized hairstyle and makeup recommendations
            </DialogDescription>
          </DialogHeader>

          {!results ? (
            <div className="space-y-6">
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-orange-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm font-medium mb-1">Click to upload your photo</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full max-h-96 object-contain rounded-lg"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={handleReset}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze & Get Recommendations
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="p-4 bg-orange-50 border-orange-200">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  Analysis Results
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Face Shape:</span>
                    <p className="font-semibold capitalize">{results.analysis.faceShape}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Skin Tone:</span>
                    <p className="font-semibold capitalize">{results.analysis.skinTone}</p>
                  </div>
                  {results.analysis.estimatedHairTexture && (
                    <div>
                      <span className="text-gray-600">Hair Texture:</span>
                      <p className="font-semibold capitalize">{results.analysis.estimatedHairTexture}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Confidence:</span>
                    <p className="font-semibold">{Math.round(results.analysis.confidence * 100)}%</p>
                  </div>
                </div>
              </Card>

              <div>
                <h3 className="font-semibold mb-3">Recommended Hairstyles</h3>
                <div className="grid gap-3">
                  {results.hairstyleRecommendations.map((rec: any, index: number) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/discover?keyword=${encodeURIComponent(rec.styleName)}`);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{rec.styleName}</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {rec.category}
                          </Badge>
                        </div>
                        <Badge className="bg-orange-500">{rec.matchScore}% match</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{rec.reason}</p>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Makeup Recommendations</h3>
                <div className="grid gap-3">
                  {results.makeupRecommendations.map((rec: any, index: number) => (
                    <Card key={index} className="p-4">
                      <h4 className="font-semibold mb-2">{rec.type}</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Recommended shades:</span>
                          <p className="text-gray-800">{rec.shades.join(", ")}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Techniques:</span>
                          <ul className="list-disc list-inside text-gray-800">
                            {rec.techniques.map((tech: string, i: number) => (
                              <li key={i}>{tech}</li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-xs text-gray-500 italic">{rec.reason}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Card className="p-4 bg-blue-50 border-blue-200">
                <h3 className="font-semibold mb-2 text-sm">💡 General Tips</h3>
                <ul className="space-y-1 text-xs text-gray-700">
                  {results.generalTips.map((tip: string, index: number) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </Card>

              <div className="flex gap-3">
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  Try Another Photo
                </Button>
                <Button 
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/discover");
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Find Stylists
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }
}
