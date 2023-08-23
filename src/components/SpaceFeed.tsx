import { Card, Group, Text, ThemeIcon, createStyles } from "@mantine/core";
import Link from "next/link";
import { api } from "../utils/api";
import {
  IconAlignBoxLeftMiddle,
  IconCalendarEvent,
  IconChartBar,
  IconColorSwatch,
  IconNotebook,
  IconPhoto,
  IconRecycle,
} from "@tabler/icons";
import { DateTime } from "luxon";
import { FeedItemContentCard } from "./FeedItemContentCard";
import { FeedItemCalendarEventCard } from "./FeedItemCalendarEventCard";
import { FeedItemProposalCard } from "./FeedItemProposalCard";
import { FeedItemSelectionCard } from "./FeedItemSelectionCard";
import { FeedItemDataIndexCard } from "./FeedItemDataIndexCard";
import { FeedItemFeedbackCard } from "./FeedItemFeedbackCard";
import { FeedItemAccessRequestCard } from "./FeedItemAccessRequestCard";


export function SpaceFeed({ spaceId }: { spaceId: string }) {
  const feedItems = api.space.getSpaceFeed.useQuery({ spaceId: spaceId }).data;
  

  const itemCards = feedItems?.map((item) => {
    if (item.content) {
      return <FeedItemContentCard key={item.id} content={item.content} eventItem={item} />;
    }

    if (item.calendarEvent) {
      return <FeedItemCalendarEventCard key={item.id} calendarEvent={item.calendarEvent} eventItem={item} />;
    }  

    if (item.proposal) {
      return <FeedItemProposalCard key={item.id} proposal={item.proposal} eventItem={item} />;
    }

    if (item.selection) {
      return <FeedItemSelectionCard key={item.id} selection={item.selection} eventItem={item} />;
    }

    if (item.feedbackRound) {
      return <FeedItemFeedbackCard key={item.id} feedbackRound={item.feedbackRound} eventItem={item} />; 
    }

    if (item.dataIndex) {
      return <FeedItemDataIndexCard key={item.id} dataIndex={item.dataIndex} eventItem={item} />;
    }

    if (item.accessRequest) {
      return <FeedItemAccessRequestCard key={item.id} accessRequestType={item.accessRequest.accessRequestType} accessRequest={item.accessRequest} eventItem={item} />;
    }
  });

  return <>{itemCards}</>;
}
