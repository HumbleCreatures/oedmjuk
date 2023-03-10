import { Card, Group, Text } from "@mantine/core";
import Link from "next/link";
import { api } from "../utils/api";

export function SpaceFeed({spaceId}: {spaceId: string }) {
    const feedItems = api.space.getSpaceFeed.useQuery({spaceId:spaceId}).data;
    
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
                <Text fz="sm" mt="xs">
                <div dangerouslySetInnerHTML={{__html: item.content.body}} />
                </Text>
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
    });

    return <>{itemCards}</>
}