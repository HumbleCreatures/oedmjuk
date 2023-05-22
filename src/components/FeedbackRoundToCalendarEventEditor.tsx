import { Container, Select, Title, createStyles } from "@mantine/core";
import { useState } from "react";
import { api } from "../utils/api";
import { Proposal } from "@prisma/client";

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.colors.gray[0],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.md,
  },
  editorWrapper: {
    marginTop: theme.spacing.md,
  },
  fullWidth: {
    width: "100%",
  },
}));

export function FeedbackRoundToCalendarEventEditor({
  spaceId,
  itemId,
  selectedFeedbackRoundId,
}: {
  spaceId: string;
  itemId: string;
  selectedFeedbackRoundId: string | null;
}) {
  const [searchFeedbackRoundValue, onSearchFeedbackRoundChange] = useState("");

  const feedbackRoundQuery = api.feedback.getActiveFeedbackRoundsForSpace.useQuery({
    spaceId,
  });

  const { classes } = useStyles();
  const utils = api.useContext();
  const addFeedbackRoundMutation =
    api.calendarEvents.addFeedbackRoundToCalendarEvent.useMutation({
      onSuccess() {
        void utils.calendarEvents.getCalendarEvent.invalidate({ itemId });
      },
    });

  const removeFeedbackRoundMutation =
    api.calendarEvents.removeFeedbackRoundFromCalendarEvent.useMutation({
      onSuccess() {
        void utils.calendarEvents.getCalendarEvent.invalidate({ itemId });
      },
    });

  if (feedbackRoundQuery.isLoading) return <div>Loading...</div>;
  if (feedbackRoundQuery.isError) return <div>Error...</div>;
  if (feedbackRoundQuery.data === undefined) return <div>Undefined...</div>;

  const proposalSelectItems = feedbackRoundQuery.data.map((proposal) => ({
    value: proposal.id,
    label: proposal.title,
  }));

  return (
    <Container size="sm" className={classes.area}>
      <Title className={classes.areaTitle} order={2}>
        Feedback round
      </Title>
      <Select
        data={proposalSelectItems}
        label="Connect feedback round"
        placeholder="You can only one active feedback event"
        searchable
        searchValue={searchFeedbackRoundValue}
        onSearchChange={onSearchFeedbackRoundChange}
        nothingFound="Nothing found"
        clearable
        onChange={(value) => {
          console.log(value);
          if (!value) {
            if (selectedFeedbackRoundId) {
              removeFeedbackRoundMutation.mutate({
                calendarEventId: itemId,
                feedbackRoundId: selectedFeedbackRoundId,
              });
            }

            return;
          }

          addFeedbackRoundMutation.mutate({
            calendarEventId: itemId,
            feedbackRoundId: value,
          });
        }}
        value={selectedFeedbackRoundId}
      />
    </Container>
  );
}
