import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertWordSchema, type InsertWord } from "@shared/schema";
import { Link } from "wouter";
import MobileHeader from "@/components/layout/mobile-header";

export default function AddWord() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertWord>({
    resolver: zodResolver(insertWordSchema),
    defaultValues: {
      word: "",
      translation: "",
      category: "",
      dictionary: "",
      language: "",
    },
  });

  const { data: categories } = useQuery<string[]>({
    queryKey: ["/api/categories"],
  });

  const { data: languages } = useQuery<string[]>({
    queryKey: ["/api/languages"],
  });

  const { data: dictionaries } = useQuery<string[]>({
    queryKey: ["/api/dictionaries"],
  });

  const createWordMutation = useMutation({
    mutationFn: async (data: InsertWord) => {
      const response = await apiRequest("POST", "/api/words", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Word added successfully!",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/words"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/languages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dictionaries"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add word. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertWord) => {
    createWordMutation.mutate(data);
  };

  const clearForm = () => {
    form.reset();
  };

  return (
    <div className="min-h-screen">
      <MobileHeader />
      
      <main className="p-4 space-y-6">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-xl font-bold text-white">Add New Word</h2>
        </div>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="word"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-300">Word</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the word..."
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="translation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-300">Translation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter translation..."
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-300">Language</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white focus:border-blue-500">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {(() => {
                            const defaultLanguages = ["French", "Spanish", "German", "Italian", "Portuguese", "Japanese", "Korean", "Chinese"];
                            const allLanguages = [...new Set([...defaultLanguages, ...(languages || [])])];
                            return allLanguages.map((lang) => (
                              <SelectItem key={lang} value={lang}>
                                {lang}
                              </SelectItem>
                            ));
                          })()}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-300">Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white focus:border-blue-500">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {(() => {
                            const defaultCategories = ["Greetings", "Food", "Travel", "Business", "Numbers", "Colors", "Family", "Time"];
                            const allCategories = [...new Set([...defaultCategories, ...(categories || [])])];
                            return allCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ));
                          })()}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dictionary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-300">Dictionary</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Collins, Oxford..."
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={createWordMutation.isPending}
                  className="flex-1 gradient-button text-white hover:shadow-lg transition-all duration-200"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createWordMutation.isPending ? "Saving..." : "Save Word"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearForm}
                  className="px-6 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </main>
    </div>
  );
}
