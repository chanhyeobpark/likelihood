import { createClient } from "@/lib/supabase/server";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/format";

interface Props {
  productId: string;
}

export async function ProductReviews({ productId }: Props) {
  const supabase = await createClient();

  const { data: reviews, count } = await supabase
    .from("reviews")
    .select("*, user:profiles(full_name)", { count: "exact" })
    .eq("product_id", productId)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(20);

  // Calculate average rating
  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  // Size feedback distribution
  const sizeFeedback = {
    SMALL: reviews?.filter((r) => r.size_feedback === "SMALL").length || 0,
    TRUE_TO_SIZE: reviews?.filter((r) => r.size_feedback === "TRUE_TO_SIZE").length || 0,
    LARGE: reviews?.filter((r) => r.size_feedback === "LARGE").length || 0,
  };
  const totalSizeFeedback = sizeFeedback.SMALL + sizeFeedback.TRUE_TO_SIZE + sizeFeedback.LARGE;

  return (
    <div>
      {/* Summary */}
      <div className="flex items-start gap-12 mb-10">
        <div className="text-center">
          <p className="text-4xl font-light">{avgRating}</p>
          <div className="flex gap-0.5 mt-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${star <= Math.round(Number(avgRating)) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">{count || 0}개의 리뷰</p>
        </div>

        {/* Size Feedback */}
        {totalSizeFeedback > 0 && (
          <div className="flex-1 max-w-xs">
            <p className="text-xs text-gray-500 mb-3">사이즈 의견</p>
            <div className="space-y-2">
              {[
                { key: "SMALL", label: "작아요", count: sizeFeedback.SMALL },
                { key: "TRUE_TO_SIZE", label: "정사이즈", count: sizeFeedback.TRUE_TO_SIZE },
                { key: "LARGE", label: "커요", count: sizeFeedback.LARGE },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16">{item.label}</span>
                  <div className="flex-1 bg-gray-100 h-2 rounded">
                    <div
                      className="bg-black h-2 rounded"
                      style={{ width: `${totalSizeFeedback > 0 ? (item.count / totalSizeFeedback) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review List */}
      {reviews && reviews.length > 0 ? (
        <div className="divide-y">
          {reviews.map((review) => (
            <div key={review.id} className="py-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {(review.user as any)?.full_name || "익명"}
                  </span>
                  {review.is_verified_purchase && (
                    <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">구매 인증</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
              </div>

              {/* Size/Body info */}
              <div className="flex gap-4 mb-2 text-xs text-gray-400">
                {review.purchased_size && <span>구매 사이즈: {review.purchased_size}</span>}
                {review.height_cm && <span>키: {review.height_cm}cm</span>}
                {review.size_feedback && (
                  <span>
                    사이즈: {review.size_feedback === "SMALL" ? "작아요" : review.size_feedback === "TRUE_TO_SIZE" ? "정사이즈" : "커요"}
                  </span>
                )}
              </div>

              {review.title && <p className="text-sm font-medium mb-1">{review.title}</p>}
              {review.body && <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>}

              {/* Admin reply */}
              {review.admin_reply && (
                <div className="mt-3 bg-gray-50 p-3 rounded">
                  <p className="text-xs font-medium mb-1">판매자 답변</p>
                  <p className="text-xs text-gray-600">{review.admin_reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-12">아직 리뷰가 없습니다</p>
      )}
    </div>
  );
}
