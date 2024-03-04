import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
      <p className="font-bold text-2xl mx-10 text-primary/90">
        Welcome to discord chat!
      </p>
      <p className="font-bold text-2xl mx-10 text-primary/90">
        Please wait for a sec to load contents
      </p>
    </div>
  );
}
