import { useState } from 'react';
import { ApiKeyPrompt } from './components/ApiKeyPrompt';
import { Chatbot } from './components/Chatbot';
import { StoryReader } from './components/StoryReader';
import { generateStory } from './lib/gemini';
import { BookOpen, Sparkles, Loader2, Settings, ChevronLeft } from 'lucide-react';

export default function App() {
  const [isKeySelected, setIsKeySelected] = useState(false);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [story, setStory] = useState<any>(null);
  const [imageSize, setImageSize] = useState('1K');

  const handleGenerateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setStory(null);
    try {
      const newStory = await generateStory(topic);
      setStory(newStory);
    } catch (error) {
      console.error("Error generating story:", error);
      alert("Failed to generate story. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-gray-900 font-sans selection:bg-amber-200">
      <ApiKeyPrompt onKeySelected={() => setIsKeySelected(true)} />
      
      {isKeySelected && (
        <>
          <header className="bg-white border-b border-amber-100 sticky top-0 z-30 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-600">
                <BookOpen className="w-6 h-6" />
                <h1 className="text-xl font-bold tracking-tight">Magic Storybook</h1>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                  <Settings className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-amber-800">Image Size:</span>
                  <select 
                    value={imageSize} 
                    onChange={(e) => setImageSize(e.target.value)}
                    className="bg-transparent font-bold text-amber-700 outline-none cursor-pointer"
                  >
                    <option value="1K">1K</option>
                    <option value="2K">2K</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-4 py-12">
            {!story && !isGenerating && (
              <div className="max-w-2xl mx-auto text-center mt-12">
                <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Sparkles className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-bold mb-4 font-serif text-gray-800">What should we read about today?</h2>
                <p className="text-lg text-gray-600 mb-8">Enter a topic and our magical AI will write a brand new story just for you!</p>
                
                <form onSubmit={handleGenerateStory} className="flex gap-3 max-w-lg mx-auto">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. A brave little toaster..."
                    className="flex-1 px-6 py-4 rounded-2xl border-2 border-amber-100 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-50 outline-none transition-all text-lg shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={!topic.trim()}
                    className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 transition-all shadow-lg shadow-amber-200 active:scale-95 cursor-pointer"
                  >
                    Create
                  </button>
                </form>
              </div>
            )}

            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-32 text-amber-600">
                <Loader2 className="w-16 h-16 animate-spin mb-6" />
                <h3 className="text-2xl font-serif font-bold animate-pulse">Writing your magical story...</h3>
                <p className="text-amber-700/70 mt-2">Dreaming up characters and adventures</p>
              </div>
            )}

            {story && (
              <div className="space-y-8">
                <div className="flex justify-center">
                  <button 
                    onClick={() => setStory(null)}
                    className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Write a new story
                  </button>
                </div>
                <StoryReader story={story} imageSize={imageSize} />
              </div>
            )}
          </main>

          <Chatbot />
        </>
      )}
    </div>
  );
}
