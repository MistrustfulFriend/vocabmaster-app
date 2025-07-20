import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Filter, ArrowDownWideNarrow, Search, Edit, Trash2, ArrowLeft, Home } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Word } from "@shared/schema";
import MobileHeader from "@/components/layout/mobile-header";
import WordCard from "@/components/word-card";
import EditWordDialog from "@/components/edit-word-dialog";
import { Link } from "wouter";

export default function Library() {
  // Get URL parameters for initial filter state
  const urlParams = new URLSearchParams(window.location.search);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(urlParams.get('language') || "");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDictionary, setSelectedDictionary] = useState<string>(urlParams.get('dictionary') || "");
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: words = [], isLoading } = useQuery<Word[]>({
    queryKey: ["/api/words", searchQuery, selectedLanguage, selectedCategory, selectedDictionary],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedLanguage) params.append('language', selectedLanguage);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedDictionary) params.append('dictionary', selectedDictionary);
      
      const response = await fetch(`/api/words?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch words');
      return response.json();
    },
  });

  const { data: languages = [] } = useQuery<string[]>({
    queryKey: ["/api/languages"],
  });

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["/api/categories"],
  });

  const { data: dictionaries = [] } = useQuery<string[]>({
    queryKey: ["/api/dictionaries"],
  });

  const deleteWordMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/words/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Word deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/words"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete word. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteWord = (id: number) => {
    if (confirm("Are you sure you want to delete this word?")) {
      deleteWordMutation.mutate(id);
    }
  };

  const handleEditWord = (word: Word) => {
    setEditingWord(word);
  };

  const filteredWords = words.filter(word => {
    const matchesSearch = !searchQuery || 
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.translation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = !selectedLanguage || word.language === selectedLanguage;
    const matchesCategory = !selectedCategory || word.category === selectedCategory;
    const matchesDictionary = !selectedDictionary || word.dictionary === selectedDictionary;
    
    return matchesSearch && matchesLanguage && matchesCategory && matchesDictionary;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <MobileHeader title="Word Library" />
        <div className="p-4 space-y-4">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MobileHeader title="Word Library" />
      
      {/* Back Button */}
      <div className="p-4 pb-0">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <main className="p-4 space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Search words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-700 border-slate-600 pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
          
          {/* Dictionary Filters */}
          {selectedDictionary && (
            <div className="mb-4">
              <div className="text-sm text-cyan-400 mb-2">Viewing: {selectedDictionary} Dictionary</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDictionary("")}
                className="text-slate-400"
              >
                View All Dictionaries
              </Button>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Button
              variant={!selectedLanguage && !selectedCategory && !selectedDictionary ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedLanguage("");
                setSelectedCategory("");
                setSelectedDictionary("");
              }}
              className="whitespace-nowrap"
            >
              All ({words.length})
            </Button>
            {!selectedDictionary && dictionaries.map((dictionary) => (
              <Button
                key={dictionary}
                variant={selectedDictionary === dictionary ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedDictionary(selectedDictionary === dictionary ? "" : dictionary);
                  setSelectedLanguage("");
                  setSelectedCategory("");
                }}
                className="whitespace-nowrap"
              >
                {dictionary} ({words.filter(w => w.dictionary === dictionary).length})
              </Button>
            ))}
            {languages.map((language) => (
              <Button
                key={language}
                variant={selectedLanguage === language ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedLanguage(selectedLanguage === language ? "" : language);
                  setSelectedCategory("");
                }}
                className="whitespace-nowrap"
              >
                {language} ({words.filter(w => w.language === language).length})
              </Button>
            ))}
          </div>

          {/* Category filters if language is selected */}
          {selectedLanguage && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <Button
                variant={!selectedCategory ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("")}
                className="whitespace-nowrap"
              >
                All Categories
              </Button>
              {categories
                .filter(cat => words.some(w => w.language === selectedLanguage && w.category === cat))
                .map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === category ? "" : category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Word Cards */}
        <div className="space-y-3">
          {filteredWords.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <div className="text-slate-400">
                {searchQuery || selectedLanguage || selectedCategory ? 
                  "No words found matching your filters." : 
                  "No words in your library yet. Add some words to get started!"
                }
              </div>
            </Card>
          ) : (
            filteredWords.map((word) => (
              <WordCard
                key={word.id}
                word={word}
                onEdit={() => handleEditWord(word)}
                onDelete={() => handleDeleteWord(word.id)}
              />
            ))
          )}
        </div>
        
        {filteredWords.length > 0 && filteredWords.length < words.length && (
          <div className="text-center py-4">
            <div className="text-sm text-slate-400">
              Showing {filteredWords.length} of {words.length} words
            </div>
          </div>
        )}
      </main>
      
      <EditWordDialog
        word={editingWord}
        open={!!editingWord}
        onOpenChange={(open) => !open && setEditingWord(null)}
      />
    </div>
  );
}
