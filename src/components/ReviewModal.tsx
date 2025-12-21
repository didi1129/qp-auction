"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewerId: string;
  revieweeId: string;
  marketItemId: number; // Changed from itemId to marketItemId as per request
  onReviewSubmitted: () => void;
}

export function ReviewModal({ isOpen, onClose, reviewerId, revieweeId, marketItemId, onReviewSubmitted }: ReviewModalProps) {
  const [isRecommended, setIsRecommended] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isRecommended === null) {
      alert("추천 여부를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('user_reviews')
        .insert({
          reviewer_id: reviewerId,
          reviewee_id: revieweeId,
          market_item_id: marketItemId,
          is_recommended: isRecommended, // Changed column name
          comment: comment
        });

      if (error) throw error;

      alert("후기가 등록되었습니다.");
      onReviewSubmitted();
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("후기 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#222] border-[#3d3d3d] text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-yellow-500">거래 후기 작성</DialogTitle>
          <DialogDescription className="text-gray-400">
            거래는 만족스러우셨나요? 판매자에 대한 후기를 남겨주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsRecommended(true)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${isRecommended === true
                ? "border-[oklch(0.6_0.15_240)] bg-[#2a3f4a] text-white"
                : "border-[#444] text-gray-400 hover:border-gray-300"
                }`}
            >
              <ThumbsUp className={`h-8 w-8 ${isRecommended === true ? "fill-current" : ""}`} />
              <span className="font-bold">추천해요</span>
            </button>
            <button
              onClick={() => setIsRecommended(false)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${isRecommended === false
                ? "border-red-500 bg-[#3f2a2a] text-white"
                : "border-[#444] text-gray-400 hover:border-gray-300"
                }`}
            >
              <ThumbsDown className={`h-8 w-8 ${isRecommended === false ? "fill-current" : ""}`} />
              <span className="font-bold">비추천해요</span>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-300">
              후기 메시지 <span className="text-gray-500 font-normal">(선택사항)</span>
            </label>
            <Textarea
              placeholder="거래 경험에 대해 이야기해주세요."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-[#333] border-[#444] text-white min-h-[100px] resize-none focus:border-[oklch(0.6_0.15_240)]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isRecommended === null || isSubmitting}
            className="bg-[oklch(0.6_0.15_240)] hover:bg-[oklch(0.55_0.15_240)] text-white"
          >
            {isSubmitting ? "등록 중..." : "후기 등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
