import { useState, useEffect } from 'react';
import { generateImage, generateSpeech, playPcmAudio } from '../lib/gemini';
import { ChevronLeft, ChevronRight, Volume2, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Page {
  text: string;
  imagePrompt: string;
  imageUrl?: string;
}

interface Story {
  title: string;
  pages: Page[];
}

export function StoryReader({ story, imageSize }: { story: Story, imageSize: string }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<Page[]>(story.pages);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const page = pages[currentPage];

  useEffect(() => {
    setPages(story.pages);
    setCurrentPage(0);
  }, [story]);

  const handleGenerateImage = async () => {
    if (page.imageUrl || isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      const url = await generateImage(page.imagePrompt, imageSize);
      setPages(prev => {
        const newPages = [...prev];
        newPages[currentPage] = { ...newPages[currentPage], imageUrl: url };
        return newPages;
      });
    } catch (e) {
      console.error("Failed to generate image", e);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleReadAloud = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      const base64Audio = await generateSpeech(page.text);
      await playPcmAudio(base64Audio);
    } catch (e) {
      console.error("Failed to play audio", e);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-amber-100">
      <div className="bg-amber-50 p-6 border-b border-amber-100 text-center">
        <h2 className="text-3xl font-bold text-amber-900 font-serif">{story.title}</h2>
      </div>
      
      <div className="flex flex-col md:flex-row min-h-[400px]">
        {/* Image Section */}
        <div className="md:w-1/2 bg-gray-50 relative flex items-center justify-center p-6 border-r border-gray-100">
          <AnimatePresence mode="wait">
            {page.imageUrl ? (
              <motion.img 
                key={page.imageUrl}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={page.imageUrl} 
                alt="Story illustration" 
                className="w-full h-auto rounded-2xl shadow-md object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center w-full"
              >
                {isGeneratingImage ? (
                  <div className="flex flex-col items-center text-amber-600">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="font-medium animate-pulse">Painting a magical picture...</p>
                  </div>
                ) : (
                  <button 
                    onClick={handleGenerateImage}
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-amber-200 rounded-2xl bg-amber-50 hover:bg-amber-100 transition-colors text-amber-700 group cursor-pointer"
                  >
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-8 h-8 text-amber-500" />
                    </div>
                    <span className="font-semibold text-lg">Generate Illustration</span>
                    <span className="text-sm text-amber-600/70 mt-1">Using {imageSize} resolution</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Text Section */}
        <div className="md:w-1/2 p-8 flex flex-col justify-between bg-white">
          <div className="flex-1 flex items-center">
            <p className="text-2xl leading-relaxed text-gray-800 font-serif">
              {page.text}
            </p>
          </div>
          
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-100">
            <button 
              onClick={handleReadAloud}
              disabled={isPlayingAudio}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                isPlayingAudio 
                  ? 'bg-amber-100 text-amber-400 cursor-not-allowed' 
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200 active:scale-95 cursor-pointer'
              }`}
            >
              {isPlayingAudio ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
              {isPlayingAudio ? 'Reading...' : 'Read Aloud'}
            </button>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-3 rounded-full bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="font-medium text-gray-500 min-w-[3rem] text-center">
                {currentPage + 1} / {pages.length}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
                disabled={currentPage === pages.length - 1}
                className="p-3 rounded-full bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
