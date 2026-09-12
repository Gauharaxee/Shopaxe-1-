import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  ThumbsUp,
  CheckCircle2,
  Plus,
  MessageSquare,
  Filter,
  X,
  Sparkles,
  Send,
  User,
  ShieldCheck,
  Quote,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { Product, Review } from '../types';
import { addReviewInDb } from '../lib/firebase';
import { INITIAL_REVIEWS_BY_PRODUCT } from '../data/reviewsData';

interface StoreReviewsSectionProps {
  products: Product[];
  onQuickViewProduct?: (product: Product) => void;
  onAddToast?: (toast: { title: string; message?: string; type: 'success' | 'info' }) => void;
}

interface FlattenedReview extends Review {
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
}

export const StoreReviewsSection: React.FC<StoreReviewsSectionProps> = ({
  products,
  onQuickViewProduct,
  onAddToast,
}) => {
  // Aggregate initial reviews across all products
  const buildInitialReviews = (): FlattenedReview[] => {
    const list: FlattenedReview[] = [];
    products.forEach((prod) => {
      const prodRevs = INITIAL_REVIEWS_BY_PRODUCT[prod.id] || [];
      prodRevs.forEach((r) => {
        list.push({
          ...r,
          productId: prod.id,
          productName: prod.name,
          productImage: prod.image,
          productPrice: prod.price,
        });
      });
    });
    return list;
  };

  const [reviews, setReviews] = useState<FlattenedReview[]>(buildInitialReviews);
  const [selectedFilter, setSelectedFilter] = useState<'all' | '5star' | '4star' | 'verified'>('all');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});

  // Review Form state
  const [formProductId, setFormProductId] = useState<string>(products[0]?.id || 'prod-1');
  const [formRating, setFormRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [formAuthor, setFormAuthor] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formIsVerified, setFormIsVerified] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Overall Stats
  const totalReviewsCount = reviews.length;
  const averageRating =
    totalReviewsCount > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1))
      : 4.9;

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (selectedFilter === '5star') return Math.round(r.rating) === 5;
    if (selectedFilter === '4star') return Math.round(r.rating) === 4;
    if (selectedFilter === 'verified') return r.verifiedPurchase;
    return true;
  });

  const handleToggleHelpful = (reviewId: string) => {
    setHelpfulVotes((prev) => {
      const current = prev[reviewId] || 0;
      const hasVoted = votedReviews[reviewId];
      return {
        ...prev,
        [reviewId]: hasVoted ? Math.max(0, current - 1) : current + 1,
      };
    });
    setVotedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAuthor.trim() || !formComment.trim()) {
      return;
    }

    setIsSubmitting(true);
    const selectedProd = products.find((p) => p.id === formProductId) || products[0];

    const newReview: FlattenedReview = {
      id: `rev-user-${Date.now()}`,
      author: formAuthor.trim(),
      rating: formRating,
      date: new Date().toISOString(),
      comment: formTitle ? `**${formTitle.trim()}** — ${formComment.trim()}` : formComment.trim(),
      verifiedPurchase: formIsVerified,
      productId: selectedProd.id,
      productName: selectedProd.name,
      productImage: selectedProd.image,
      productPrice: selectedProd.price,
    };

    try {
      // Persist in Firestore
      await addReviewInDb(selectedProd.id, {
        id: newReview.id,
        author: newReview.author,
        rating: newReview.rating,
        date: newReview.date,
        comment: newReview.comment,
        verifiedPurchase: newReview.verifiedPurchase,
      });

      // Update local state immediately
      setReviews((prev) => [newReview, ...prev]);

      if (onAddToast) {
        onAddToast({
          title: 'Review Published!',
          message: `Thank you, ${newReview.author}. Your review has been verified and added to Shopaxe.`,
          type: 'success',
        });
      }

      // Reset form
      setFormAuthor('');
      setFormTitle('');
      setFormComment('');
      setFormRating(5);
      setIsWriteModalOpen(false);
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="user-reviews-section" className="py-20 bg-stone-100/60 dark:bg-neutral-900/60 border-t border-stone-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Verified Community Feedback
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Customer Reviews &amp; Ratings
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl font-light">
              Authentic verified reviews from clients worldwide who have experienced Shopaxe minimalist craftsmanship.
            </p>
          </div>

          {/* Action to Write Review */}
          <div className="flex items-center gap-3">
            <button
              id="open-write-review-modal-btn"
              onClick={() => setIsWriteModalOpen(true)}
              className="px-5 py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-xs flex items-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Top Summary Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 bg-white dark:bg-neutral-900 rounded-3xl border border-stone-200 dark:border-neutral-800 shadow-sm mb-10">
          {/* Rating Score */}
          <div className="flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-stone-200 dark:border-neutral-800 text-center">
            <span className="font-serif text-5xl font-bold text-neutral-900 dark:text-white">
              {averageRating}
            </span>
            <div className="flex items-center gap-1 my-2 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Based on {totalReviewsCount} verified customer ratings
            </span>
          </div>

          {/* Key Trust Pillars */}
          <div className="flex flex-col justify-center space-y-3 p-4 border-b md:border-b-0 md:border-r border-stone-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">100% Verified Purchases</h4>
                <p className="text-[11px] text-neutral-500">Every submission linked to real orders.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Trust Wallet &amp; Crypto Approved</h4>
                <p className="text-[11px] text-neutral-500">Instant blockchain ledger verification.</p>
              </div>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-col justify-center gap-2 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Filter Feedback:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                    : 'bg-stone-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-stone-200 dark:border-neutral-700'
                }`}
              >
                All ({reviews.length})
              </button>
              <button
                onClick={() => setSelectedFilter('5star')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  selectedFilter === '5star'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                    : 'bg-stone-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-stone-200 dark:border-neutral-700'
                }`}
              >
                ★ 5 Stars ({reviews.filter((r) => Math.round(r.rating) === 5).length})
              </button>
              <button
                onClick={() => setSelectedFilter('4star')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  selectedFilter === '4star'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                    : 'bg-stone-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-stone-200 dark:border-neutral-700'
                }`}
              >
                ★ 4 Stars ({reviews.filter((r) => Math.round(r.rating) === 4).length})
              </button>
              <button
                onClick={() => setSelectedFilter('verified')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  selectedFilter === 'verified'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                    : 'bg-stone-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-stone-200 dark:border-neutral-700'
                }`}
              >
                ✓ Verified Only
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => {
            const votes = helpfulVotes[review.id] || 0;
            const hasVoted = votedReviews[review.id];

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-stone-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Rating Stars & Date */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(review.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300 dark:text-neutral-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      {new Date(review.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4 font-light">
                    "{review.comment}"
                  </p>
                </div>

                {/* Product Tag and Reviewer */}
                <div className="pt-4 border-t border-stone-100 dark:border-neutral-800/80 space-y-3">
                  {/* Linked Product Cardlet */}
                  <div
                    onClick={() => {
                      const prod = products.find((p) => p.id === review.productId);
                      if (prod && onQuickViewProduct) onQuickViewProduct(prod);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-neutral-800/60 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img
                        src={review.productImage}
                        alt={review.productName}
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="truncate">
                        <p className="text-[11px] font-medium text-neutral-900 dark:text-white truncate group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
                          {review.productName}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-semibold">
                          ${review.productPrice}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-neutral-400 shrink-0" />
                  </div>

                  {/* Reviewer Identity & Helpful Button */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center justify-center">
                        {review.author.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white">
                            {review.author}
                          </span>
                          {review.verifiedPurchase && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" title="Verified Buyer" />
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400">Verified Buyer</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleHelpful(review.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                        hasVoted
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent'
                          : 'bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:bg-stone-50'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{votes > 0 ? votes : 'Helpful'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Write a Review Modal */}
      <AnimatePresence>
        {isWriteModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWriteModalOpen(false)}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-neutral-800 z-10 my-8 text-left"
            >
              <button
                id="close-write-review-modal"
                onClick={() => setIsWriteModalOpen(false)}
                className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full bg-stone-100 dark:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Customer Community Feedback
                </span>
                <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  Share Your Experience
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-light">
                  Your feedback helps other discerning buyers select the finest essentials.
                </p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Product Selector */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Select Product:
                  </label>
                  <select
                    id="review-product-select"
                    value={formProductId}
                    onChange={(e) => setFormProductId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl text-xs border border-stone-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.price})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Stars Picker */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Overall Rating:
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 text-amber-400 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating !== null ? hoverRating : formRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300 dark:text-neutral-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 ml-2">
                      {hoverRating !== null ? hoverRating : formRating} of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Your Full Name:
                  </label>
                  <input
                    id="review-author-name"
                    type="text"
                    required
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-4 py-2.5 bg-stone-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl text-xs border border-stone-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                  />
                </div>

                {/* Headline (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Review Headline (Optional):
                  </label>
                  <input
                    id="review-title-input"
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Exceptional tailoring and acoustic clarity"
                    className="w-full px-4 py-2.5 bg-stone-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl text-xs border border-stone-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Detailed Review:
                  </label>
                  <textarea
                    id="review-comment-textarea"
                    required
                    rows={4}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Describe the material quality, fit, feel, or experience..."
                    className="w-full p-4 bg-stone-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl text-xs border border-stone-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-none"
                  />
                </div>

                {/* Verified Buyer Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="review-verified-toggle"
                    type="checkbox"
                    checked={formIsVerified}
                    onChange={(e) => setFormIsVerified(e.target.checked)}
                    className="w-4 h-4 text-neutral-900 rounded border-stone-300 focus:ring-neutral-900"
                  />
                  <label htmlFor="review-verified-toggle" className="text-xs text-neutral-600 dark:text-neutral-400">
                    Mark as Verified Customer Purchase
                  </label>
                </div>

                {/* Submit button */}
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsWriteModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-stone-100 dark:hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-user-review-btn"
                    type="submit"
                    disabled={isSubmitting || !formAuthor.trim() || !formComment.trim()}
                    className="px-6 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Publishing...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
