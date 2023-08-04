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
import { formatDateLengthBetween } from "../utils/dateFormaters";
import { FeedItemContentCard } from "./FeedItemContentCard";

const useStyles = createStyles((theme) => ({
  itemTitle: {
    backgroundColor: theme.colors.earth[9],
    borderBottom: 0,
    borderRadius: theme.radius.md,
  },
  inlineText: {
    display: "inline",
  }
}));

export function SpaceFeed({ spaceId }: { spaceId: string }) {
  const feedItems = api.space.getSpaceFeed.useQuery({ spaceId: spaceId }).data;
  const { classes } = useStyles();

  const itemCards = feedItems?.map((item) => {
    if (item.content) {
      return <FeedItemContentCard key={item.id} content={item.content} eventItem={item} />;
      /*return (
        <Link
          href={`/app/space/${item.spaceId}/content/${item.content.id}`}
          key={item.id}
        >
          <Card withBorder shadow="sm" radius="md">
            <Card.Section withBorder inheritPadding py="xs">
              <Group position="apart">
                <div>
                  <Text fz="sm" fw={300}>
                    {DateTime.fromJSDate(item.content.createdAt)
                      .setLocale("en")
                      .toRelative()}
                  </Text>

                  <Text fz="md" fw={500}>
                  {item.eventType}
                  </Text>
                </div>

                <ThemeIcon size="xl">
                  <IconAlignBoxLeftMiddle />
                </ThemeIcon>
              </Group>
            </Card.Section>

            <Card.Section mt="md" inheritPadding py="xs">
              <Group position="apart">
                <Text fz="xl" fw={500} color="earth.9">
                  {item.content.title}
                </Text>
              </Group>
            </Card.Section>
          </Card>
        </Link>
      ); */
    }

    if (item.calendarEvent) {
      return (
        <Link
          href={`/app/space/${item.spaceId}/calendarEvent/${item.calendarEvent.id}`}
          key={item.id}
        >
          <Card withBorder shadow="sm" radius="md">
            <Card.Section withBorder inheritPadding py="xs">
              <Group position="apart">
                <div>
                  <Text fz="sm" fw={300}>
                    {DateTime.fromJSDate(item.calendarEvent.createdAt)
                      .setLocale("en")
                      .toRelative()}
                  </Text>

                  <Text fz="md" fw={500}>
                  {item.eventType}
                  </Text>
                </div>

                <ThemeIcon size="xl">
                  <IconCalendarEvent />
                </ThemeIcon>
              </Group>
            </Card.Section>

            <Card.Section mt="md" inheritPadding py="xs">
              <Group position="apart">
                <Text fz="xl" fw={500} color="earth.9">
                  {item.calendarEvent.title}
                </Text>
                <Group position="left">
                  {item.calendarEvent.endAt > new Date() ? (
                    <div>
                      <Text className={classes.inlineText} fz="sm" fw={300}>
                        Starts{" "}
                      </Text>
                      <Text className={classes.inlineText} fz="sm" fw={500}>
                        {DateTime.fromJSDate(item.calendarEvent.startAt)
                          .setLocale("en")
                          .toRelative()}
                      </Text>
                      <Text className={classes.inlineText} fz="sm" fw={300}>
                        {" "}
                        at{" "}
                      </Text>
                      <Text className={classes.inlineText} fz="sm" fw={500}>
                        {DateTime.fromJSDate(
                          item.calendarEvent.startAt
                        ).toFormat("HH:mm")}
                      </Text>
                      <Text className={classes.inlineText} fz="sm" fw={300}>
                        {" "}
                        for{" "}
                      </Text>
                      <Text className={classes.inlineText} fz="sm" fw={500}>
                        {formatDateLengthBetween(
                          item.calendarEvent.startAt,
                          item.calendarEvent.endAt
                        )}
                      </Text>
                    </div>
                  ) : (
                    <Text fz="sm" fw={300}>
                      <Text className={classes.inlineText} fz="sm" fw={500}>
                        Has ended
                      </Text>
                    </Text>
                  )}
                </Group>
              </Group>
            </Card.Section>
          </Card>
        </Link>
      );
    }

    if (item.proposal) {
      return (
        <Link
          href={`/app/space/${item.spaceId}/proposal/${item.proposal.id}`}
          key={item.id}
        >
          <Card withBorder shadow="sm" radius="md">
            <Card.Section withBorder inheritPadding py="xs">
              <Group position="apart">
                <div>
                  <Text fz="sm" fw={300}>
                    {DateTime.fromJSDate(item.proposal.createdAt)
                      .setLocale("en")
                      .toRelative()}
                  </Text>

                  <Text fz="md" fw={500}>
                  {item.eventType}
                  </Text>
                </div>

                <ThemeIcon size="xl">
                  <IconNotebook />
                </ThemeIcon>
              </Group>
            </Card.Section>

            <Card.Section mt="md" inheritPadding py="xs">
              <Group position="apart">
                <Text fz="xl" fw={500} color="earth.9">
                  {item.proposal.title}
                </Text>
                <Text fz="sm" fw={300}>
                  Status: {item.proposal.proposalState}
                </Text>
              </Group>
            </Card.Section>
          </Card>
        </Link>
      );
    }

    if (item.selection) {
      return (
        <Link
          href={`/app/space/${item.spaceId}/selection/${item.selection.id}`}
          key={item.id}
        >
          <Card withBorder shadow="sm" radius="md">
            <Card.Section withBorder inheritPadding py="xs">
              <Group position="apart">
                <div>
                  <Text fz="sm" fw={300}>
                    {DateTime.fromJSDate(item.selection.createdAt)
                      .setLocale("en")
                      .toRelative()}
                  </Text>

                  <Text fz="md" fw={500}>
                  {item.eventType}
                  </Text>
                </div>

                <ThemeIcon size="xl">
                  <IconColorSwatch />
                </ThemeIcon>
              </Group>
            </Card.Section>

            <Card.Section mt="md" inheritPadding py="xs">
              <Group position="apart">
                <Text fz="xl" fw={500} color="earth.9">
                  {item.selection.title}
                </Text>
                <Text fz="sm" fw={300}>
                  Status: {item.selection.state}
                </Text>
              </Group>
            </Card.Section>
          </Card>
        </Link>
      );
    }

    if (item.feedbackRound) {
      return (
        <Link
          href={`/app/space/${item.spaceId}/feedback/${item.feedbackRound.id}`}
          key={item.id}
        >
          <Card withBorder shadow="sm" radius="md">
            <Card.Section withBorder inheritPadding py="xs">
              <Group position="apart">
                <div>
                  <Text fz="sm" fw={300}>
                    {DateTime.fromJSDate(item.feedbackRound.createdAt)
                      .setLocale("en")
                      .toRelative()}
                  </Text>

                  <Text fz="md" fw={500}>
                  {item.eventType}
                  </Text>
                </div>

                <ThemeIcon size="xl">
                  <IconRecycle />
                </ThemeIcon>
              </Group>
            </Card.Section>

            <Card.Section mt="md" inheritPadding py="xs">
              <Group position="apart">
                <Text fz="xl" fw={500} color="earth.9">
                  {item.feedbackRound.title}
                </Text>
                <Text fz="sm" fw={300}>
                  Status: {item.feedbackRound.state}
                </Text>
              </Group>
            </Card.Section>
          </Card>
        </Link>
      );
    }

    if (item.dataIndex) {
      return (
        <Link
          href={`/app/space/${item.spaceId}/dataIndex/${item.dataIndex.id}`}
          key={item.id}
        >
          <Card withBorder shadow="sm" radius="md">
            <Card.Section withBorder inheritPadding py="xs">
              <Group position="apart">
                <div>
                  <Text fz="sm" fw={300}>
                    {DateTime.fromJSDate(item.dataIndex.createdAt)
                      .setLocale("en")
                      .toRelative()}
                  </Text>

                  <Text fz="md" fw={500}>
                  {item.eventType}
                  </Text>
                </div>

                <ThemeIcon size="xl">
                  <IconChartBar />
                </ThemeIcon>
              </Group>
            </Card.Section>

            <Card.Section mt="md" inheritPadding py="xs">
              <Group position="apart">
                <Text fz="xl" fw={500} color="earth.9">
                  {item.dataIndex.title}
                </Text>
                <Text fz="sm" fw={300}>
                  Measured in {item.dataIndex.unitType.unitName}
                </Text>
              </Group>
            </Card.Section>
          </Card>
        </Link>
      );
    }
  });

  return <>{itemCards}</>;
}
