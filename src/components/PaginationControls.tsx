import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  // if (totalPages <= 1) return null; // ItemTable shows it even if 0/0 or 1/1, let's keep it consistent or follow user pref. 
  // User said "exactly like search tab". ItemTable shows "0/0" if empty.
  // But ItemTable logic is: `items.length === 0 ? "0 / 0" : ...`

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-gray-400"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1 || totalPages === 0}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-gray-400"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || totalPages === 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-white text-sm font-bold bg-[#1a1a1a] px-3 py-0.5 rounded border border-[#3d3d3d]">
        {totalPages === 0 ? "0 / 0" : `${currentPage} / ${totalPages}`}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-gray-400"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-gray-400"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
