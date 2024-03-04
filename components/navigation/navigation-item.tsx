"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ActionTooltip } from "../action-tooltip";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type NavigationItemProps = {
  id: string;
  imageUrl: string;
  name: string;
};

const NavigationItem = ({ id, imageUrl, name }: NavigationItemProps) => {
  const params = useParams();
  const router = useRouter();

  const onClick = () => {
    router.push(`/servers/${id}`);
  };

  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button onClick={onClick} className="group relative flex items-center">
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            params?.serverId === id
              ? "h-[36px]"
              : "h-[8px] group-hover:h-[20px]"
          )}
        />
        <div
          className={cn(
            "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden bg-primary/10",
            params?.serverId === id && "rounded-[16px]"
          )}
        >
          <Image fill src={imageUrl} alt="Server" sizes="100px" className="" />
        </div>
      </button>
    </ActionTooltip>
  );
};

export default NavigationItem;
