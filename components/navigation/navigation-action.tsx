"use client";

import { Plus } from "lucide-react";
import { ActionTooltip } from "../action-tooltip";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/use-modal-store";

const NavigationAction = () => {
  const { onOpen } = useModal();

  const handleOpen = () => {
    onOpen("createServer");
  };
  return (
    <div>
      <ActionTooltip label="Create a server" align="center" side="right">
        <Button
          onClick={handleOpen}
          size={"icon"}
          variant={"none"}
          className="group mx-3 h-[48px] w-[48px] rounded-[24px] hover:rounded-[16px] overflow-hidden items-center justify-center bg-zinc-50 hover:bg-emerald-500 dark:bg-neutral-700 dark:hover:bg-emerald-500 transition-all"
        >
          <Plus className="w-[25px] h-[25px] group-hover:text-white transition-all text-emerald-500" />
        </Button>
      </ActionTooltip>
    </div>
  );
};

export default NavigationAction;
