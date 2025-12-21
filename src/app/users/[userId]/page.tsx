"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { ChevronLeft, ThumbsUp, ThumbsDown, Star, User } from "lucide-react";

interface Review {
  id: number;
  reviewer_id: string;
  is_recommended: boolean;
  comment: string | null;
  created_at: string;
  reviewer_name?: string; // We'll fetch this
  reviewer_discord_id?: string;
}

interface UserProfile {
  name: string;
  discord_id: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch User Profile Info (from market_items history)
        // We pick the most recent item to get the latest used name
        console.log("Fetching profile for userId:", userId);
        const { data: userData, error: userError } = await supabase
          .from('market_items')
          .select('seller, seller_discord_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        console.log("Profile data fetch result:", userData, userError);

        if (userData) {
          setProfile({
            name: userData.seller || "알 수 없음",
            discord_id: userData.seller_discord_id || "정보 없음"
          });
        } else {
          // Fallback: Check if user exists as a buyer
          const { data: buyerData, error: buyerError } = await supabase
            .from('market_items')
            .select('buyer, buyer_discord_id')
            .eq('buyer_user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (buyerData) {
            setProfile({
              name: buyerData.buyer || "알 수 없음",
              discord_id: buyerData.buyer_discord_id || "정보 없음"
            });
          } else {
            setProfile(null);
          }
        }

        // 2. Fetch Reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('user_reviews')
          .select('*')
          .eq('reviewee_id', userId)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;

        if (reviewsData && reviewsData.length > 0) {
          // 3. Fetch Reviewer Names (manual join with market_items)
          // Ideally we would have a users table, but we use market_items history or just show "Buyer"
          // Let's try to get buyer name from the related market_item
          const reviewsWithNames = await Promise.all(reviewsData.map(async (review) => {
            const { data: itemData } = await supabase
              .from('market_items')
              .select('buyer, buyer_discord_id')
              .eq('id', review.market_item_id)
              .single();

            // Note: reviewer_id comes from user_reviews table and is already in 'review' object
            return {
              ...review,
              reviewer_name: itemData?.buyer || "구매자",
              reviewer_discord_id: itemData?.buyer_discord_id
            };
          }));
          setReviews(reviewsWithNames);
        } else {
          setReviews([]);
        }

      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const recommendedCount = reviews.filter(r => r.is_recommended).length;
  const notRecommendedCount = reviews.filter(r => !r.is_recommended).length;
  const totalReviews = reviews.length;
  const recommendationRate = totalReviews > 0 ? Math.round((recommendedCount / totalReviews) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-[#222] text-white overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-[#333]">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-400">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="h-6 w-32 bg-[#333] animate-pulse rounded"></div>
        </div>
        <div className="p-8">
          <div className="h-24 w-full bg-[#333] animate-pulse rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-16 w-full bg-[#333] animate-pulse rounded"></div>
            <div className="h-16 w-full bg-[#333] animate-pulse rounded"></div>
            <div className="h-16 w-full bg-[#333] animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#222] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-[#2a2a2a] border-b border-[#3d3d3d]">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-400 hover:text-white">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">유저 정보</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full">
        {/* Profile Card */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 bg-[#333] rounded-full flex items-center justify-center border-2 border-[#444]">
            <User className="h-10 w-10 text-gray-500" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-yellow-500 mb-2">{profile?.name || "알 수 없는 사용자"}</h2>
            <div className="text-gray-400 text-sm mb-4">Discord: {profile?.discord_id}</div>

            <div className="flex items-center justify-center sm:justify-start gap-6">
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-gray-500 text-xs uppercase tracking-wider">이용자 평점</span>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${recommendationRate >= 80 ? 'text-green-500' : recommendationRate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {recommendationRate}%
                  </span>
                  <span className="text-sm text-gray-500">({totalReviews}개의 후기)</span>
                </div>
              </div>
              <div className="w-px h-10 bg-[#333]"></div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-green-400">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="font-bold">{recommendedCount}</span>
                </div>
                <div className="flex items-center gap-1.5 text-red-400">
                  <ThumbsDown className="h-4 w-4" />
                  <span className="font-bold">{notRecommendedCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-current" />
            거래 후기
          </h3>

          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-[#333] text-gray-500">
              아직 등록된 후기가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 transition-colors hover:border-[#444]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center gap-2 cursor-pointer hover:underline hover:text-yellow-500 transition-colors group"
                        role="button"
                        onClick={() => router.push(`/users/${review.reviewer_id}`)}
                      >
                        <span className="font-bold text-gray-200 group-hover:text-yellow-500">{review.reviewer_name}</span>
                        {review.reviewer_discord_id && (
                          <span className="text-xs text-gray-500 font-normal no-underline">({review.reviewer_discord_id})</span>
                        )}
                      </div>
                      <span className="text-gray-600 text-xs">•</span>
                      <span className="text-gray-500 text-xs">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    {review.is_recommended ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-900/20 px-2 py-1 rounded">
                        <ThumbsUp className="h-3 w-3 fill-current" /> 추천
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-900/20 px-2 py-1 rounded">
                        <ThumbsDown className="h-3 w-3 fill-current" /> 비추천
                      </span>
                    )}
                  </div>
                  {review.comment && (
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
