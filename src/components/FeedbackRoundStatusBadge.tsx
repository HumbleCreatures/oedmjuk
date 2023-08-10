import { Badge } from "@mantine/core";
import { FeedbackRoundStates } from "../utils/enums";

export function FeedbackRoundStatusBadge({ state }: { state: string }) {
  switch (state) {
    case FeedbackRoundStates.Created:
      return <Badge>Created</Badge>;
    case FeedbackRoundStates.Started:
      return <Badge>Ongoing</Badge>;
    case FeedbackRoundStates.Closed:
      return <Badge>Closed</Badge>;
    default:
        return <Badge>Unknown</Badge>;
  }
}