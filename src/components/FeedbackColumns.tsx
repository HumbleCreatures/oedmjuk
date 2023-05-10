import type { FeedbackColumn, FeedbackItem, FeedbackRound } from "@prisma/client";
import { Grid, Text, createStyles } from "@mantine/core";
import { FeedbackItemCard } from "./FeedbackItemCard";


const useStyles = createStyles((theme) => ({
  column: {
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[4],
    borderRadius: theme.radius.md,
    marginRight: theme.spacing.md,
  }
}));
export function FeedbackColumns({
  feedbackColumns,
  feedbackRound
}: {
  feedbackColumns: (FeedbackColumn & {
    feedbackItems: FeedbackItem[];
    
})[], feedbackRound: FeedbackRound;
}) {
  const { classes } = useStyles();

  return (
    <Grid >
      {feedbackColumns.map((column) => (
        <Grid.Col key={column.id} className={classes.column} span={3}>
        <Text>{column.title}</Text>
        {column.feedbackItems.map((item) => (<FeedbackItemCard key={item.id} feedbackItem={item} feedbackColumns={feedbackColumns} feedbackRound={feedbackRound} />))}
      </Grid.Col>
      ))}
      
      
    </Grid>
  );
}
