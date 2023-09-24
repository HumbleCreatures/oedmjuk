import { Group, Text, ThemeIcon } from "@mantine/core";
import { AccessRequest, AccessRequestType, Space } from "@prisma/client";
import Link from "next/link";
import { DateTime } from "luxon";
import { IconNotebook } from "@tabler/icons";
import { FeedEventTypes } from "../utils/enums";
import { useGeneralStyles } from "../styles/generalStyles";
import { FeedEventItem } from "../utils/types";
import { AccessRequestStatusBadge } from "./AccessRequestStatusBadge";
import { SpaceLinkWithData } from "./SpaceButton";



export function FeedItemAccessRequestCard({ accessRequest, accessRequestType, eventItem, space} : {accessRequest: AccessRequest, accessRequestType: AccessRequestType, eventItem: FeedEventItem, space?: Space}) {
  const { classes: generalClasses } = useGeneralStyles();  
  return (
        <Link
          href={`/app/space/${accessRequest.spaceId}/accessRequest/${accessRequest.id}`}
          key={eventItem.id}
          className={generalClasses.listLinkItem}
        >

              <Group position="apart" className={generalClasses.cardInfoArea}>
                <div>
                <Text fz="md" fw={500}>
                  {eventItem.eventType === FeedEventTypes.AccessRequestCreated && "Access request created"}
                  {eventItem.eventType === FeedEventTypes.AccessRequestOnBehalfOfSpace && "Space added on a access request"}
                  {eventItem.eventType === FeedEventTypes.AccessRequestOnBehalfOfUser && "User added on a access request"}
                  {eventItem.eventType === FeedEventTypes.AccessRequestCreator && "You created an access request"}
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
                <IconNotebook />
                </ThemeIcon>
              </Group>

              <Group position="apart" className={generalClasses.cardContentArea}>
                <div>
                <Text fz="xl" fw={500} color="earth.9">
                  {accessRequestType.name}
                </Text>
                <Text fz="sm" fw={500} color="earth.6">
                  {accessRequest.readableId}
                </Text>

                {eventItem.eventType === FeedEventTypes.AccessRequestOnBehalfOfSpace && accessRequest.onBehalfOfSpaceId && 
                <><Text fz="sm" fw={500} color="earth.9">
                  Owning space
                </Text>
                <Text fz="sm" fw={300} color="earth.9">
                <SpaceLinkWithData spaceId={accessRequest.onBehalfOfSpaceId} />
                </Text>
                </>}
               
                </div>
                <AccessRequestStatusBadge state={accessRequest.state} />
                
              </Group>
        </Link>
      );
}