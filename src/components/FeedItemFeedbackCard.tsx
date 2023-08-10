import { Group, Text, ThemeIcon } from "@mantine/core";
import {FeedbackRound, Selection, Space } from "@prisma/client";
import Link from "next/link";
import { DateTime } from "luxon";
import { IconRecycle } from "@tabler/icons";
import { FeedEventTypes } from "../utils/enums";
import { useGeneralStyles } from "../styles/generalStyles";
import { FeedEventItem } from "../utils/types";
import { FeedbackRoundStatusBadge } from "./FeedbackRoundStatusBadge";



export function FeedItemFeedbackCard({ feedbackRound, eventItem, space} : {feedbackRound: FeedbackRound, eventItem: FeedEventItem, space?: Space}) {
  const { classes: generalClasses } = useGeneralStyles();  
  return (
        <Link
          href={`/app/space/${feedbackRound.spaceId}/feedback/${feedbackRound.id}`}
          key={eventItem.id}
          className={generalClasses.listLinkItem}
        >

              <Group position="apart" className={generalClasses.cardInfoArea}>
                <div>
                <Text fz="md" fw={500}>
                  {eventItem.eventType === FeedEventTypes.FeedbackRoundCreated && "Feedback round created"}
                  {eventItem.eventType === FeedEventTypes.FeedbackRoundUpdated && "Feedback round updated"}                  
                  </Text>
                  <Text fz="sm" fw={300}>
                    {DateTime.fromJSDate(eventItem.createdAt)
                      .setLocale("en")
                      .toRelative()}
                      {space && <>{" "}in{" "} 
                      <Text fw={500} className={generalClasses.inlineText}>{space.name}</Text></>}
                  </Text>

                  
                </div>

                <ThemeIcon size="xl" color="gray">
                <IconRecycle />
                </ThemeIcon>
              </Group>

              <Group position="apart" className={generalClasses.cardContentArea}>
                <div>
                <Text fz="xl" fw={500} color="earth.9">
                  {feedbackRound.title}
                </Text>
               
                </div>
                
                <FeedbackRoundStatusBadge state={feedbackRound.state} />
                
              </Group>
              

        </Link>
      );
}