import { FeedbackColumn, FeedbackRound } from "@prisma/client";
import { FeedbackItemCard } from "../components/FeedbackItemCard";
import { api } from "../utils/api";

export function ExternalFeedbackItemCardList({ feedbackRoundId, feedbackColumns, feedbackRound}: { feedbackRoundId: string, feedbackColumns: FeedbackColumn[], feedbackRound: FeedbackRound }) {
    const myFeedbackItemsResult = api.feedback.getExternalFeedbackItems.useQuery({ itemId: feedbackRoundId });
    if (myFeedbackItemsResult.isLoading) return <div>loading...</div>;
    if (!myFeedbackItemsResult.data) return <div>Could not load feedback items</div>;
    return <>{myFeedbackItemsResult.data.map((feedbackItem) => (
        <FeedbackItemCard key={feedbackItem.id} feedbackItem={feedbackItem} feedbackColumns={feedbackColumns} feedbackRound={feedbackRound} />
    ))}</>;
}