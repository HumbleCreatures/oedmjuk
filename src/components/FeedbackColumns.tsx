import type {
  FeedbackColumn,
  FeedbackItem,
  FeedbackRound,
} from "@prisma/client";
import { Grid, Title, createStyles } from "@mantine/core";
import { FeedbackItemCard } from "./FeedbackItemCard";

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
  itemColumn: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    width: 300,
  },
}));
export function FeedbackColumns({
  feedbackColumns,
  feedbackRound,
}: {
  feedbackColumns: (FeedbackColumn & {
    feedbackItems: FeedbackItem[];
  })[];
  feedbackRound: FeedbackRound;
}) {
  const { classes } = useStyles();

  return (
    <>
      {feedbackColumns.map((column) => (
        <Grid.Col key={column.id} span={3}>
          <div className={classes.itemColumn}>
          <Title order={3} className={classes.areaTitle}>
              {column.title}
            </Title>
          {column.feedbackItems.map((item) => (
            <FeedbackItemCard
              key={item.id}
              feedbackItem={item}
              feedbackColumns={feedbackColumns}
              feedbackRound={feedbackRound}
            />
          ))}
          </div>
        </Grid.Col>
      ))}
    </>
  );
}
