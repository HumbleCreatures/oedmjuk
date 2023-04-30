import { Card, Group, Text } from "@mantine/core";
import Link from "next/link";
import { api } from "../utils/api";

export function SpaceFeed({spaceId}: {spaceId: string }) {
    const feedItems = api.space.getSpaceFeed.useQuery({spaceId:spaceId}).data;

    console.log(feedItems);
    
    const itemCards = feedItems?.map((item) => {
        if(item.content){
            return <Link href={`/app/space/${item.spaceId}/content/${item.content.id}`} key={item.id}>
                <Card withBorder shadow="sm" radius="md" >
                <Card.Section mt="md" inheritPadding py="xs">
                <Group position="apart">
                <Text fz="lg" fw={500}>
                    {item.content.title }
                </Text>
                </Group>
            </Card.Section>
            </Card>
            </Link>
        }

        if(item.calendarEvent){
            return <Link href={`/app/space/${item.spaceId}/calendarEvent/${item.calendarEvent.id}`} key={item.id}>
                <Card withBorder shadow="sm" radius="md" >
                <Card.Section mt="md" inheritPadding py="xs">
                <Group position="apart">
                <Text fz="lg" fw={500}>
                    {item.calendarEvent.title }
                </Text>
                <Text fz="lg" fw={500}>
                    {item.calendarEvent.startAt.toISOString() }
                </Text>
                <Text fz="lg" fw={500}>
                    {item.calendarEvent.endAt.toISOString() }
                </Text>
                
                </Group>
                <Text fz="sm" mt="xs">
                <div dangerouslySetInnerHTML={{__html: item.calendarEvent.body}} />
                </Text>
            </Card.Section>
            </Card>
            </Link>
        }

        if(item.proposal){
            return <Link href={`/app/space/${item.spaceId}/proposal/${item.proposal.id}`} key={item.id}>
                <Card withBorder shadow="sm" radius="md" >
                <Card.Section mt="md" inheritPadding py="xs">
                <Group position="apart">
                <Text fz="lg" fw={500}>
                    {item.proposal.title }
                </Text>
        
                </Group>
            </Card.Section>
            </Card>
            </Link>
        }

        if(item.selection){
            return <Link href={`/app/space/${item.spaceId}/selection/${item.selection.id}`} key={item.id}>
                <Card withBorder shadow="sm" radius="md" >
                <Card.Section mt="md" inheritPadding py="xs">
                <Group position="apart">
                <Text fz="lg" fw={500}>
                    {item.selection.title }
                </Text>
        
                </Group>
            </Card.Section>
            </Card>
            </Link>
        }
    });

    return <>{itemCards}</>
}