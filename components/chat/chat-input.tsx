"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Button } from "../ui/button";
import { Loader2, Plus, Send } from "lucide-react";
import { Input } from "../ui/input";
import axios from "axios";
import qs from "query-string";
import { useModal } from "@/hooks/use-modal-store";
import { EmojiPicker } from "../emoji-picker";

type ChatInputProps = {
  apiUrl: string;
  query: Record<string, any>;
  name: string;
  type: "conversation" | "channel";
};

const formSchema = z.object({
  content: z.string().min(1),
});

export const ChatInput = ({ apiUrl, query, name, type }: ChatInputProps) => {
  const { onOpen } = useModal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (value: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: apiUrl,
        query,
      });

      await axios.post(url, value);
      form.reset();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      <div className="relative p-4">
        <Button
          onClick={() => onOpen("messageFile", { apiUrl, query })}
          size={"icon"}
          className="absolute top-7 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1"
        >
          <Plus className="text-white dark:text-[#313338]" />
        </Button>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-center gap-x-3"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="">
                    <Input
                      {...field}
                      placeholder={`Message ${
                        type === "conversation" ? name : "#" + name
                      }`}
                      disabled={isLoading}
                      className="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                    />
                  </div>
                </FormControl>
                <div className="absolute top-3 right-[80px]">
                  <EmojiPicker
                    onChange={(value) => {
                      form.setValue(
                        "content",
                        form.getValues("content") + value
                      );
                    }}
                  />
                </div>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-500 text-white h-12 w-12  rounded-lg hover:bg-indigo-400"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
            ) : (
              <Send className="h-5 w-5 shrink-0" />
            )}
          </Button>
        </form>
      </div>
    </Form>
  );
};
