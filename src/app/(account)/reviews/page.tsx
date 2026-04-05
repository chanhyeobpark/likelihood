import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/format";

export const metadata = { title: "내 리뷰" };

export default async function MyReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/reviews");

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, product:products(name_ko, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider mb-8">내 리뷰</h1>

      {reviews && reviews.length > 0 ? (
        <div className="divide-y">
          {reviews.map((review) => (
            <div key={review.id} className="py-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">{(review.product as any)?.name_ko}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
              </div>
              {review.title && <p className="text-sm font-medium mt-2">{review.title}</p>}
              {review.body && <p className="text-sm text-gray-600 mt-1">{review.body}</p>}
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
        <p className="text-sm text-gray-400 text-center py-16">작성한 리뷰가 없습니다</p>
      )}
    </div>
  );
}
