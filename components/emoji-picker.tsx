"use client";

import { Smile } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useTheme } from "next-themes";

type EmojiPickerProps = {
  onChange: (value: string) => void;
};

export const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
  const theme = useTheme();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size={"icon"}
          variant={"ghost"}
          className="hover:bg-zinc-600 dark:hover:bg-zinc/90 transition rounded-full"
        >
          <Smile />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={40}
        className="bg-transparent border-none shadow-none drop-shadow-none mb-16"
      >
        <Picker
          data={data}
          theme={theme.theme}
          onEmojiSelect={(emoji: any) => onChange(emoji.native)}
        />
      </PopoverContent>
    </Popover>
  );
};
