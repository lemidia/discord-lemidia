"use client";

import axios from "axios";

import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "../ui/dialog";

import { useModal } from "@/hooks/use-modal-store";
import { Button } from "../ui/button";
import { useState } from "react";
import { ServerWithChannelsAndMembersWithProfiles } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { Channel } from "@prisma/client";

export const DeleteChannelModal = () => {
  const router = useRouter();
  const params = useParams();
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "deleteChannel";

  const { channel } = data as {
    channel?: Channel;
  };

  const [isLoading, setIsLoading] = useState(false);

  const onDeleteConfirm = async () => {
    try {
      setIsLoading(true);

      await axios.delete(`/api/channels/${channel?.id}`);

      onClose();
      router.refresh();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6 gap-y-2">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Channel
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500 text-md">
            Are you sure you want to delete
            <span className="font-semibold text-indigo-500">
              {" "}
              #{channel?.name}
            </span>{" "}
            channel?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-end gap-x-2">
            <Button disabled={isLoading} onClick={onClose} variant={"ghost"}>
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              onClick={onDeleteConfirm}
              variant={"primary"}
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
