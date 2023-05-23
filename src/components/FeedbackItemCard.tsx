import { Button, Card, Menu, Text, createStyles, Group } from "@mantine/core";
import { FeedbackColumn, FeedbackItem, FeedbackRound } from "@prisma/client";
import { api } from "../utils/api";
import Link from "next/link";
import { Router, useRouter } from "next/router";
import { FeedbackRoundStates } from "../utils/enums";

const useStyles = createStyles((theme) => ({
  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.xs,
  },
  area: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    width: 300,
  },
}));

export function FeedbackItemCard({
  feedbackItem,
  feedbackColumns,
  feedbackRound,
}: {
  feedbackItem: FeedbackItem;
  feedbackColumns: FeedbackColumn[];
  feedbackRound: FeedbackRound;
}) {
  const { classes } = useStyles();
  const router = useRouter();
  const utils = api.useContext();
  const mutation = api.feedback.moveFeedbackTo.useMutation({
    onSuccess() {
      void utils.feedback.getFeedbackRound.refetch({
        itemId: feedbackItem.feedbackRoundId,
      });
      void utils.feedback.getMyFeedbackItems.refetch({
        itemId: feedbackItem.feedbackRoundId,
      });
      void utils.feedback.getExternalFeedbackItems.refetch({
        itemId: feedbackItem.feedbackRoundId,
      });
    },
  });

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
      <Card.Section p="sm">
        <Link
          href={`/app/space/${feedbackRound.spaceId}/feedback/${feedbackRound.id}/item/${feedbackItem.id}`}
          key={feedbackRound.id}
        >
          <Text fz="md" fw={500}>{feedbackItem.title}</Text>
        </Link>
      </Card.Section>

      <Card.Section inheritPadding>
        <div dangerouslySetInnerHTML={{ __html: feedbackItem.body }} />
      </Card.Section>

      <Card.Section withBorder p="sm">
        <Group>
        {feedbackRound.state === FeedbackRoundStates.Created && <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button>Move</Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Move to</Menu.Label>
            {feedbackColumns.map((column) => {
              return (
                <Menu.Item
                  onClick={() => {
                    mutation.mutate({
                      feedbackItemId: feedbackItem.id,
                      feedbackColumnId: column.id,
                      itemNextPreviousId: null,
                      itemPositionPreviousId: null,
                    });
                  }}
                  key={column.id}
                >
                  {column.title}
                </Menu.Item>
              );
            })}
          </Menu.Dropdown>
        </Menu>}
        <Button onClick={() => void router.push(`/app/space/${feedbackRound.spaceId}/feedback/${feedbackRound.id}/item/${feedbackItem.id}`)}>View</Button>
        </Group>
      </Card.Section>
    </Card>
  );
}
