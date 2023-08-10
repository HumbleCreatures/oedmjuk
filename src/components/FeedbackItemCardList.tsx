import type { FeedbackColumn, FeedbackItem, FeedbackRound } from "@prisma/client";
import { FeedbackItemCard } from "../components/FeedbackItemCard";


export function FeedbackItemCardList({ feedbackItems, feedbackColumns, feedbackRound }: { feedbackColumns: FeedbackColumn[], feedbackRound: FeedbackRound, feedbackItems: FeedbackItem[] }) {
    return <>{feedbackItems.map((feedbackItem) => (
        <FeedbackItemCard key={feedbackItem.id} feedbackItem={feedbackItem} feedbackColumns={feedbackColumns} feedbackRound={feedbackRound} />
    ))}</>;
}