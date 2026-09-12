import React, { useState, useEffect } from 'react';
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
  BarChart2
} from 'lucide-react';
import { Product, Review } from '../types';
import { subscribeProductReviews, addReviewInDb } from '../lib/firebase';
import { INITIAL_REVIEWS_BY_PRODUCT } from '../data/reviewsData';

interface CustomerReviewsProps {
  product: Product;
  onUpdateProductRating?: (newRating: number, newReviewCount: number) => void;
  onAddToast?: (toast: { title: string; message?: string; type: 'success' | 'info' }) => void;
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({
  product,
  onUpdateProductRating,
  onAddToast,
}) => {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS_BY_PRODUCT[product.id] || []);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});

  // Form State
  const [formRating, setFormRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [formAuthor, setFormAuthor] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formIsVerified, setFormIsVerified] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subscribe to real-time Firestore reviews for this product
  useEffect(() => {
    const initialForProd = INITIAL_REVIEWS_BY_PRODUCT[product.id] || [];
    setReviews(initialForProd);

    const unsubscribe = subscribeProductReviews(product.id, (firestoreReviews) => {
      if (firestoreReviews && firestoreReviews.length > 0) {
        setReviews(firestoreReviews);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [product.id]);

  // Calculate rating stats
  const totalReviewsCount = reviews.length;
  const averageRating = totalReviewsCount > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1))
    : product.rating;

  // Rating Distribution breakdown (count & percentage for 5, 4, 3, 2, 1 stars)
  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
    const percentage = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
    return { stars, count, percentage };
  });

  // Filter and Sort Reviews
  const filteredReviews = reviews.filter((r) => {
    if (selectedRatingFilter !== null) {
      return Math.round(r.rating) === selectedRatingFilter;
    }
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'highest') {
      return b.rating - a.rating;
    }
    if (sortBy === 'lowest') {
      return a.rating - b.rating;
    }
    if (sortBy === 'helpful') {
      const votesA = helpfulVotes[a.id] || 0;
      const votesB = helpfulVotes[b.id] || 0;
      return votesB - votesA;
    }
    return 0;
  });

  // Helpful vote handler
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

  // Submit Review Handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAuthor.trim() || !formComment.trim()) return;

    setIsSubmitting(true);

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      author: formAuthor.trim(),
      rating: formRating,
      date: new Date().toISOString(),
      comment: formTitle ? `${formTitle.trim()} — ${formComment.trim()}` : formComment.trim(),
      verifiedPurchase: formIsVerified,
    };

    const updatedList = [newReview, ...reviews];
    const newCount = updatedList.length;
    const newAvg = Number((updatedList.reduce((sum, r) => sum + r.rating, 0) / newCount).toFixed(1));

    // Save to Firestore
    await addReviewInDb(product.id, newReview, newAvg, newCount);

    // Local state updates
    setReviews(updatedList);
    if (onUpdateProductRating) {
      onUpdateProductRating(newAvg, newCount);
    }

    if (onAddToast) {
      onAddToast({
        title: 'Review Published!',
        message: 'Thank you for sharing your feedback with the community.',
        type: 'success',
      });
    }

    // Reset Form
    setFormAuthor('');
    setFormTitle('');
    setFormComment('');
    setFormRating(5);
    setIsFormOpen(false);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 font-sans text-neutral-900 dark:text-neutral-100">
      
      {/* RATING OVERVIEW & DISTRIBUTION HERO */}
      <div className="p-6 sm:p-8 bg-stone-50 dark:bg-neutral-800/60 rounded-3xl border border-stone-200/80 dark:border-neutral-700/80 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Score & Summary Callout (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-2 pr-0 md:pr-6 md:border-r border-stone-200 dark:border-neutral-700">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-5xl font-black text-neutral-900 dark:text-white">
              {averageRating}
            </span>
            <span className="text-sm font-semibold text-neutral-400">/ 5.0</span>
          </div>

          {/* Interactive Star Row */}
          <div className="flex items-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  s <= Math.round(averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-300 dark:text-neutral-600'
                }`}
              />
            ))}
          </div>

          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Based on <strong className="text-neutral-900 dark:text-white font-bold">{totalReviewsCount}</strong> verified buyer reviews
          </p>

          <button
            onClick={() => setIsFormOpen(true)}
            className="mt-3 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-amber-400 dark:text-amber-600" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Rating Breakdown Bars (7 cols) */}
        <div className="md:col-span-7 space-y-2">
          {ratingCounts.map(({ stars, count, percentage }) => (
            <button
              key={stars}
              onClick={() => setSelectedRatingFilter(selectedRatingFilter === stars ? null : stars)}
              className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-all group ${
                selectedRatingFilter === stars
                  ? 'bg-amber-500/10 dark:bg-amber-500/20 ring-1 ring-amber-500/30'
                  : 'hover:bg-stone-200/50 dark:hover:bg-neutral-700/50'
              }`}
            >
              <div className="flex items-center gap-1 w-12 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                <span>{stars}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>

              {/* Progress Bar Container */}
              <div className="flex-1 h-2.5 bg-stone-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 dark:bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <span className="w-12 text-right font-mono text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                {count} ({percentage}%)
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* FILTER & SORT TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-neutral-800">
        
        {/* Rating Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1 mr-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            Filter:
          </span>

          <button
            onClick={() => setSelectedRatingFilter(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              selectedRatingFilter === null
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'bg-stone-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-stone-200'
            }`}
          >
            All Reviews ({reviews.length})
          </button>

          {[5, 4, 3, 2, 1].map((stars) => {
            const cnt = reviews.filter((r) => Math.round(r.rating) === stars).length;
            if (cnt === 0 && selectedRatingFilter !== stars) return null;

            return (
              <button
                key={stars}
                onClick={() => setSelectedRatingFilter(selectedRatingFilter === stars ? null : stars)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
                  selectedRatingFilter === stars
                    ? 'bg-amber-500 text-neutral-950 shadow-xs'
                    : 'bg-stone-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-stone-200'
                }`}
              >
                <span>{stars} Stars</span>
                <span className="text-[10px] opacity-75">({cnt})</span>
              </button>
            );
          })}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-neutral-400 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-stone-100 dark:bg-neutral-800 rounded-xl border border-stone-200 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
          >
            <option value="newest">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* WRITE A REVIEW FORM MODAL / EXPANDABLE */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSubmitReview}
              className="p-6 bg-stone-900 text-white dark:bg-neutral-800 rounded-3xl shadow-xl space-y-5 border border-stone-800 dark:border-neutral-700 my-2"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold">Write Your Product Feedback</h3>
                    <p className="text-xs text-stone-400">
                      Sharing honest experiences helps fellow customers make informed decisions.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Interactive Star Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = (hoverRating !== null ? hoverRating : formRating) >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setFormRating(starVal)}
                        className="p-1 text-amber-400 hover:scale-125 transition-transform"
                        aria-label={`Rate ${starVal} stars`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            isFilled ? 'fill-amber-400 text-amber-400' : 'text-stone-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-bold text-amber-400 ml-2">
                    {formRating === 5
                      ? '5.0 — Excellent!'
                      : formRating === 4
                      ? '4.0 — Very Good'
                      : formRating === 3
                      ? '3.0 — Average'
                      : formRating === 2
                      ? '2.0 — Fair'
                      : '1.0 — Poor'}
                  </span>
                </div>
              </div>

              {/* Author & Title Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-stone-300 uppercase tracking-wider block">
                    Your Name / Alias *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-4 py-3 bg-stone-800 dark:bg-neutral-900 rounded-2xl border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-300 uppercase tracking-wider block">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Outstanding Craftsmanship & Sound"
                    className="w-full px-4 py-3 bg-stone-800 dark:bg-neutral-900 rounded-2xl border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Comment Text Area */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                  Detailed Review Comment *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Describe fit, material quality, performance, or daily usage..."
                  className="w-full px-4 py-3 bg-stone-800 dark:bg-neutral-900 rounded-2xl border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                />
              </div>

              {/* Verified Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="verifiedCheck"
                  checked={formIsVerified}
                  onChange={(e) => setFormIsVerified(e.target.checked)}
                  className="rounded bg-stone-800 border-stone-700 text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <label htmlFor="verifiedCheck" className="text-xs text-stone-300 cursor-pointer flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Flag as Verified Customer Purchase</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 text-xs text-stone-400 hover:text-white font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Publishing...' : 'Publish Feedback'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REVIEWS FEED LIST */}
      <div className="space-y-4 pt-2">
        {sortedReviews.length === 0 ? (
          <div className="py-12 text-center bg-stone-50 dark:bg-neutral-800/40 rounded-3xl border border-dashed border-stone-200 dark:border-neutral-700 space-y-3">
            <MessageSquare className="w-10 h-10 text-neutral-400 mx-auto opacity-50" />
            <h4 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
              No Reviews Match Filter
            </h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              There are no customer reviews matching {selectedRatingFilter} stars. Try selecting a different filter or reset filters.
            </p>
            <button
              onClick={() => setSelectedRatingFilter(null)}
              className="px-4 py-2 bg-stone-200 dark:bg-neutral-700 rounded-xl text-xs font-bold text-neutral-800 dark:text-white hover:bg-stone-300 transition-colors"
            >
              Reset Rating Filters
            </button>
          </div>
        ) : (
          sortedReviews.map((rev) => {
            const voteCount = (helpfulVotes[rev.id] || 0);
            const isVoted = votedReviews[rev.id];

            return (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-stone-50 dark:bg-neutral-800/40 rounded-3xl border border-stone-200/60 dark:border-neutral-800 space-y-3 hover:border-stone-300 dark:hover:border-neutral-700 transition-all"
              >
                {/* Header: Author Info & Stars */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {/* User Avatar Circle */}
                    <div className="w-10 h-10 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold flex items-center justify-center text-xs shadow-xs">
                      {rev.author.substring(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-neutral-900 dark:text-white">
                          {rev.author}
                        </span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified Buyer
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {new Date(rev.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Star Rating Badge */}
                  <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-3 py-1 rounded-full self-start sm:self-auto border border-amber-500/20">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300 dark:text-neutral-600'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-neutral-900 dark:text-white ml-1">
                      {rev.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Review Comment Body */}
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed pt-1">
                  {rev.comment}
                </p>

                {/* Footer: Helpful Action */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 dark:border-neutral-700/60 text-[11px] text-neutral-400">
                  <span>Was this feedback helpful?</span>

                  <button
                    onClick={() => handleToggleHelpful(rev.id)}
                    className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                      isVoted
                        ? 'bg-amber-500 text-neutral-950 shadow-xs'
                        : 'bg-stone-200/60 dark:bg-neutral-700/60 text-neutral-700 dark:text-neutral-300 hover:bg-stone-300'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-neutral-950' : ''}`} />
                    <span>{isVoted ? 'Helpful' : 'Yes'}</span>
                    {voteCount > 0 && <span className="font-mono">({voteCount})</span>}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
