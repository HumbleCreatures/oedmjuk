import { Button, Card, Menu, Text } from "@mantine/core";
import { FeedbackColumn, FeedbackItem, FeedbackRound } from "@prisma/client";
import { api } from "../utils/api";
import Link from "next/link";


export function FeedbackItemCard ({feedbackItem, feedbackColumns, feedbackRound} : {feedbackItem: FeedbackItem, feedbackColumns: FeedbackColumn[], feedbackRound: FeedbackRound}) {
  const utils = api.useContext();
  const mutation = api.feedback.moveFeedbackTo.useMutation({
    onSuccess() {
      void utils.feedback.getFeedbackRound.refetch({ itemId: feedbackItem.feedbackRoundId});
      void utils.feedback.getMyFeedbackItems.refetch({ itemId: feedbackItem.feedbackRoundId});
      void utils.feedback.getExternalFeedbackItems.refetch({ itemId: feedbackItem.feedbackRoundId});
    },
  });

    return <Card shadow="sm" padding="lg" radius="md" withBorder mih={200}>
    <Card.Section>
      <Link href={`/app/space/${feedbackRound.spaceId}/feedback/${feedbackRound.id}/item/${feedbackItem.id}`} key={feedbackRound.id}> 
        <Text weight={500}>{feedbackItem.title}</Text>
        </Link>
    </Card.Section>

    <Card.Section>
        <Text size="sm" color="dimmed">
            {feedbackItem.body}
        </Text>
    </Card.Section>

    <Card.Section>


<Menu shadow="md" width={200}>
      <Menu.Target>
        <Button>Toggle menu</Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Move to</Menu.Label>
        {feedbackColumns.map((column) => {
            return <Menu.Item onClick={() => {
                mutation.mutate({feedbackItemId: feedbackItem.id, feedbackColumnId: column.id, itemNextPreviousId: null, itemPositionPreviousId: null})
            }} key={column.id}>{column.title}</Menu.Item>
        })}
      </Menu.Dropdown>
    </Menu>
    </Card.Section>

  </Card>
}