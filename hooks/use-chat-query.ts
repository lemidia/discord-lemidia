import qs from "query-string";
import { useInfiniteQuery } from "@tanstack/react-query";

type ChatQueryProps = {
  queryKey: string;
  apiUrl: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
};

// apiUrl : /api/messages
// paramKey : channelId | conversationId
// paramValue : real value of each paramKey
export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
}: ChatQueryProps) => {
  const fetchMessages = async ({
    pageParam,
  }: {
    pageParam: undefined | string;
  }) => {
    const url = qs.stringifyUrl(
      {
        url: apiUrl,
        query: {
          cursor: pageParam,
          [paramKey]: paramValue,
        },
      },
      { skipNull: true }
    );

    const res = await fetch(url);
    return res.json();
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: [queryKey],
      initialPageParam: undefined,
      queryFn: fetchMessages,
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
    });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
};
