import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileActionButtonProps {
  onClick?: () => void;
}

export function MobileActionButton({ onClick }: MobileActionButtonProps) {
  return (
    <div className="md:hidden fixed right-5 bottom-20 z-20">
      <Button
        onClick={onClick}
        size="icon"
        className="w-14 h-14 rounded-full bg-primary shadow-lg"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
