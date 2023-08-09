import { Group, Text, ThemeIcon } from "@mantine/core";
import { CalendarEvent, Content, Proposal, Space } from "@prisma/client";
import Link from "next/link";
import { DateTime } from "luxon";
import { IconNotebook } from "@tabler/icons";
import { FeedEventTypes } from "../utils/enums";
import { useGeneralStyles } from "../styles/generalStyles";
import { FeedEventItem } from "../utils/types";
import { ProposalStatusBadge } from "./ProposalStatusBadge";



export function FeedItemProposalCard({ proposal: proposal, eventItem, space} : {proposal: Proposal, eventItem: FeedEventItem, space?: Space}) {
  const { classes: generalClasses } = useGeneralStyles();  
  return (
        <Link
          href={`/app/space/${proposal.spaceId}/proposal/${proposal.id}`}
          key={eventItem.id}
          className={generalClasses.listLinkItem}
        >

              <Group position="apart" className={generalClasses.cardInfoArea}>
                <div>
                <Text fz="md" fw={500}>
                  {eventItem.eventType === FeedEventTypes.ProposalEventCreated && "Proposal created"}
                  {eventItem.eventType === FeedEventTypes.ProposalEventUpdated && "Proposal updated"}
                  {eventItem.eventType === FeedEventTypes.ProposalObjectionAdded && "Proposal objection added"}
                  {eventItem.eventType === FeedEventTypes.ProposalVotingStarted && "Proposal voting started"}
                  {eventItem.eventType === FeedEventTypes.ProposalVotingEnded && "Proposal vote finished"}
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
                  {proposal.title}
                </Text>
               
                </div>
                <ProposalStatusBadge state={proposal.state} />
                
              </Group>
              

        </Link>
      );
}