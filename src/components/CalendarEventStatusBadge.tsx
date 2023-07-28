import { Badge } from "@mantine/core";

export function CalendarBadge({ startAt, endAt }: { startAt: Date; endAt: Date }) {
  const currentTime = new Date();
  if (currentTime.getTime() < startAt.getTime()) {
    if (currentTime.getDate() === startAt.getDate()) {
      return <Badge>Today</Badge>;
    }
    return <></>;
  }
  if (currentTime.getTime() > endAt.getTime()) return <Badge>Passed</Badge>;
  if (currentTime.getTime() < endAt.getTime()) return <Badge>Ongoing</Badge>;

  return <></>;
}