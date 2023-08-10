import { FeedbackColumn, FeedbackRound } from "@prisma/client";
import { FeedbackItemCard } from "../components/FeedbackItemCard";
import { api } from "../utils/api";
import {
    Alert
  } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";

export function NamedFeedbackItemCardList({ columnName , feedbackRoundId,feedbackColumns, feedbackRound }: { feedbackRoundId: string, feedbackColumns: FeedbackColumn[], feedbackRound: FeedbackRound, columnName: string }) {
    const myFeedbackItemsResult = api.feedback.getNamedFeedbackItems.useQuery({ itemId: feedbackRoundId, columnName });
    if (myFeedbackItemsResult.isLoading) return <div>loading...</div>;
    if (!myFeedbackItemsResult.data) return <div>Could not load feedback items</div>;
    
    if(columnName === "Ongoing" && myFeedbackItemsResult.data.length === 0) {
        return (<Alert  icon={<IconAlertCircle size="1rem" />} title="Nothing is being discussed!" color="gray" variant="filled">
              Move one of your feedback item to ongoing to start a discussion.
              Or you can move a an external feedback item to ongoing.
              </Alert>)
    }
    return <>{myFeedbackItemsResult.data.map((feedbackItem) => (
        <FeedbackItemCard key={feedbackItem.id} feedbackItem={feedbackItem} feedbackColumns={feedbackColumns} feedbackRound={feedbackRound} />
    ))}</>;
}