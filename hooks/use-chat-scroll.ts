import { useEffect, useRef, useState } from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  shouldLoadMore: boolean;
  loadMore: () => void;
  count: number;
  isFetchingNextPage: boolean;
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  count,
  loadMore,
  isFetchingNextPage,
}: ChatScrollProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized) return;

    const topDiv = chatRef?.current;

    const handleScroll = () => {
      const scrollTop = topDiv?.scrollTop;

      if (scrollTop === 0 && shouldLoadMore) {
        loadMore();
      }
    };

    topDiv?.addEventListener("scroll", handleScroll);

    return () => {
      topDiv?.removeEventListener("scroll", handleScroll);
    };
  }, [chatRef, shouldLoadMore, hasInitialized]);

  useEffect(() => {
    const bottomDiv = bottomRef?.current;
    const topDiv = chatRef.current;
    const shouldAutoScroll = () => {
      if (!hasInitialized && bottomDiv) {
        setHasInitialized(true);
        return true;
      }

      if (!topDiv) {
        return false;
      }

      const distanceFromBottom =
        topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;
      return distanceFromBottom <= 130;
    };

    if (shouldAutoScroll()) {
      bottomRef?.current?.scrollIntoView(
        hasInitialized && {
          behavior: "smooth",
        }
      );
    }
  }, [bottomRef, chatRef, count]);

  // Below code for retaining current position after fetching next page
  const previousChatHeight = useRef<number>(0);

  useEffect(() => {
    if (!chatRef?.current) return;

    if (isFetchingNextPage) {
      previousChatHeight.current = chatRef.current.scrollHeight || 0;
    } else {
      const scrollTo =
        chatRef.current.scrollHeight - previousChatHeight.current;
      chatRef.current.scrollTo(0, scrollTo);
    }
  }, [isFetchingNextPage]);
};
