import { Group, Text, ThemeIcon } from "@mantine/core";
import {  DataIndex, Space } from "@prisma/client";
import Link from "next/link";
import { DateTime } from "luxon";
import { IconChartBar } from "@tabler/icons";
import { FeedEventTypes } from "../utils/enums";
import { useGeneralStyles } from "../styles/generalStyles";
import { FeedEventItem } from "../utils/types";

export function FeedItemDataIndexCard({dataIndex, eventItem, space} : {dataIndex: DataIndex, eventItem: FeedEventItem, space?: Space}) {
  const { classes: generalClasses } = useGeneralStyles();  
  return (
        <Link
          href={`/app/space/${dataIndex.spaceId}/dataIndex/${dataIndex.id}`}
          key={eventItem.id}
          className={generalClasses.listLinkItem}
        >

              <Group position="apart" className={generalClasses.cardInfoArea}>
                <div>
                <Text fz="md" fw={500}>
                  {eventItem.eventType === FeedEventTypes.DataIndexUpdated && "Data index created"}
                  {eventItem.eventType === FeedEventTypes.DataIndexCreated && "Data index updated"}
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
                <IconChartBar />
                </ThemeIcon>
              </Group>

              <Group position="apart" className={generalClasses.cardContentArea}>
                <Text fz="xl" fw={500} color="earth.9">
                  {dataIndex.title}
                </Text>
              </Group>

        </Link>
      );
}