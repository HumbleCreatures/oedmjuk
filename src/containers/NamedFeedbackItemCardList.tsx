import { FeedbackColumn, FeedbackRound } from "@prisma/client";
import { FeedbackItemCard } from "../components/FeedbackItemCard";
import { api } from "../utils/api";

export function NamedFeedbackItemCardList({ columnName , feedbackRoundId,feedbackColumns, feedbackRound }: { feedbackRoundId: string, feedbackColumns: FeedbackColumn[], feedbackRound: FeedbackRound, columnName: string }) {
    const myFeedbackItemsResult = api.feedback.getNamedFeedbackItems.useQuery({ itemId: feedbackRoundId, columnName });
    if (myFeedbackItemsResult.isLoading) return <div>loading...</div>;
    if (!myFeedbackItemsResult.data) return <div>Could not load feedback items</div>;
    return <>{myFeedbackItemsResult.data.map((feedbackItem) => (
        <FeedbackItemCard key={feedbackItem.id} feedbackItem={feedbackItem} feedbackColumns={feedbackColumns} feedbackRound={feedbackRound} />
    ))}</>;
}