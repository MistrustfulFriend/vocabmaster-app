import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertWordSchema, type InsertWord, type Word } from "@shared/schema";

interface EditWordDialogProps {
  word: Word | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditWordDialog({ word, open, onOpenChange }: EditWordDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertWord>({
    resolver: zodResolver(insertWordSchema),
    defaultValues: word ? {
      word: word.word,
      translation: word.translation,
      category: word.category,
      dictionary: word.dictionary,
      language: word.language,
    } : {
      word: "",
      translation: "",
      category: "",
      dictionary: "",
      language: "",
    },
  });

  const updateWordMutation = useMutation({
    mutationFn: async (data: InsertWord) => {
      if (!word) throw new Error("No word to update");
      const response = await apiRequest("PUT", `/api/words/${word.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Word updated successfully!",
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/words"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update word. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertWord) => {
    updateWordMutation.mutate(data);
  };

  // Reset form when word changes
  React.useEffect(() => {
    if (word) {
      form.reset({
        word: word.word,
        translation: word.translation,
        category: word.category,
        dictionary: word.dictionary,
        language: word.language,
      });
    }
  }, [word, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Word</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                        <SelectItem value="Italian">Italian</SelectItem>
                        <SelectItem value="Portuguese">Portuguese</SelectItem>
                        <SelectItem value="Japanese">Japanese</SelectItem>
                        <SelectItem value="Korean">Korean</SelectItem>
                        <SelectItem value="Chinese">Chinese</SelectItem>
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
                        <SelectItem value="Greetings">Greetings</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Numbers">Numbers</SelectItem>
                        <SelectItem value="Colors">Colors</SelectItem>
                        <SelectItem value="Family">Family</SelectItem>
                        <SelectItem value="Time">Time</SelectItem>
                        <SelectItem value="Animals">Animals</SelectItem>
                        <SelectItem value="Home">Home</SelectItem>
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
                disabled={updateWordMutation.isPending}
                className="flex-1 gradient-button text-white hover:shadow-lg transition-all duration-200"
              >
                {updateWordMutation.isPending ? "Updating..." : "Update Word"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-6 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}