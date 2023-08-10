import { Group, Text, ThemeIcon } from "@mantine/core";
import {Selection, Space } from "@prisma/client";
import Link from "next/link";
import { DateTime } from "luxon";
import { IconColorSwatch } from "@tabler/icons";
import { FeedEventTypes} from "../utils/enums";
import { useGeneralStyles } from "../styles/generalStyles";
import { FeedEventItem } from "../utils/types";
import { SelectionStatusBadge } from "./SelectionStatusBadge";



export function FeedItemSelectionCard({ selection, eventItem, space} : {selection: Selection, eventItem: FeedEventItem, space?: Space}) {
  const { classes: generalClasses } = useGeneralStyles();  
  return (
        <Link
          href={`/app/space/${selection.spaceId}/selection/${selection.id}`}
          key={eventItem.id}
          className={generalClasses.listLinkItem}
        >

              <Group position="apart" className={generalClasses.cardInfoArea}>
                <div>
                <Text fz="md" fw={500}>
                  {eventItem.eventType === FeedEventTypes.SelectionCreated && "Selection created"}
                  {eventItem.eventType === FeedEventTypes.SelectionUpdated && "Selection updated"}
                  {eventItem.eventType === FeedEventTypes.SelectionAlternativeAdded && "Selection alternative added"}
                  {eventItem.eventType === FeedEventTypes.SelectionVoteStarted && "Selection vote started"}
                  {eventItem.eventType === FeedEventTypes.SelectionVoteEnded && "Selection vote finished"}
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
                <IconColorSwatch />
                </ThemeIcon>
              </Group>

              <Group position="apart" className={generalClasses.cardContentArea}>
                <div>
                <Text fz="xl" fw={500} color="earth.9">
                  {selection.title}
                </Text>
               
                </div>
                
                <SelectionStatusBadge state={selection.state} />
                
              </Group>
              

        </Link>
      );
}