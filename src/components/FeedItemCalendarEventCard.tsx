import { Group, Text, ThemeIcon } from "@mantine/core";
import { CalendarEvent, Content, Space } from "@prisma/client";
import Link from "next/link";
import { DateTime } from "luxon";
import { IconCalendarEvent } from "@tabler/icons";
import { SpaceFeedEventTypes, UserFeedEventTypes } from "../utils/enums";
import { useGeneralStyles } from "../styles/generalStyles";
import { FeedEventItem } from "../utils/types";
import { FormattedEventDateAndTime } from "../pages/app/space/[spaceId]/calendarEvent/[itemId]";
import { CalendarBadge } from "./CalendarEventStatusBadge";



export function FeedItemCalendarEventCard({ calendarEvent, eventItem, space} : {calendarEvent: CalendarEvent, eventItem: FeedEventItem, space?: Space}) {
  const { classes: generalClasses } = useGeneralStyles();  
  return (
        <Link
          href={`/app/space/${calendarEvent.spaceId}/calendarEvent/${calendarEvent.id}`}
          key={eventItem.id}
          className={generalClasses.listLinkItem}
        >

              <Group position="apart" className={generalClasses.cardInfoArea}>
                <div>
                <Text fz="md" fw={500}>
                  {eventItem.eventType === SpaceFeedEventTypes.CalendarEventCreated && "Calendar event created"}
                  {eventItem.eventType === SpaceFeedEventTypes.CalendarEventUpdated && "Calendar event updated"}
                  {eventItem.eventType === UserFeedEventTypes.CalendarEventNotAttending && "Not attending calendar event"}
                  {eventItem.eventType === UserFeedEventTypes.CalendarEventAttending && "Attending calendar event"}
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
                  <IconCalendarEvent />
                </ThemeIcon>
              </Group>

              <Group position="apart" className={generalClasses.cardContentArea}>
                <div>
                <Text fz="xl" fw={500} color="earth.9">
                  {calendarEvent.title}
                </Text>
                <FormattedEventDateAndTime startAt={calendarEvent.startAt} endAt={calendarEvent.endAt} />
                </div>
                
                <CalendarBadge startAt={calendarEvent.startAt} endAt={calendarEvent.endAt} />
                
              </Group>
              

        </Link>
      );
}