import { Card, Container, Group, SimpleGrid, Text, ThemeIcon, Title, createStyles } from "@mantine/core";
import Link from "next/link";
import { api } from "../utils/api";
import {
  IconAlignBoxLeftMiddle,
  IconCalendarEvent,
  IconChartBar,
  IconClipboardList,
  IconColorSwatch,
  IconNotebook,
  IconRecycle,
} from "@tabler/icons";
import { DateTime } from "luxon";
import { formatDateLengthBetween } from "../utils/dateFormaters";
import { useGeneralStyles } from "../styles/generalStyles";
import { CleanLoader } from "./Loaders/CleanLoader";
import { FeedItemContentCard } from "./FeedItemContentCard";
import { FeedItemCalendarEventCard } from "./FeedItemCalendarEventCard";
import { FeedItemProposalCard } from "./FeedItemProposalCard";
import { FeedItemSelectionCard } from "./FeedItemSelectionCard";
import { FeedItemFeedbackCard } from "./FeedItemFeedbackCard";
import { FeedItemDataIndexCard } from "./FeedItemDataIndexCard";

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  itemTitle: {
    backgroundColor: theme.colors.earth[9],
    borderBottom: 0,
    borderRadius: theme.radius.md,
  },
  inlineText: {
    display: "inline",
  },
  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.md,
  },
}));

export function UserFeed() {
  const feedItemQuery = api.user.getUserFeed.useQuery();
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles();

  if (feedItemQuery.isLoading) {
    return <CleanLoader />;
  }

    if (feedItemQuery.isError) {
    return <div>Error: {feedItemQuery.error.message}</div>;
    }

 //TODO: Add space name och event namn.

  const itemCards = feedItemQuery.data.map((item) => {
    if (item.content) {
      return <FeedItemContentCard key={item.id} content={item.content} eventItem={item} space={item.space} />;
    }

    if (item.calendarEvent) {
      return <FeedItemCalendarEventCard key={item.id} calendarEvent={item.calendarEvent} eventItem={item} space={item.space} />;
    }  

    if (item.proposal) {
      return <FeedItemProposalCard key={item.id} proposal={item.proposal} eventItem={item} space={item.space} />;
    }

    if (item.selection) {
      return <FeedItemSelectionCard key={item.id} selection={item.selection} eventItem={item} space={item.space} />;
    }

    if (item.feedbackRound) {
      return <FeedItemFeedbackCard key={item.id} feedbackRound={item.feedbackRound} eventItem={item} space={item.space} />; 
    }

    if (item.dataIndex) {
      return <FeedItemDataIndexCard key={item.id} dataIndex={item.dataIndex} eventItem={item} space={item.space} />;
    }
  });

  return <Container size="sm" className={generalClasses.clearArea}>
  <Group className={generalClasses.listHeader}>
  
  <IconClipboardList />
  <Title order={2} className={classes.title}>My feed</Title>
  </Group>

     <SimpleGrid cols={1}>
      {itemCards}
     </SimpleGrid>
   
    </Container>;
}
