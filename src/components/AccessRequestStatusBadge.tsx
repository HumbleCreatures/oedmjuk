import { Badge } from "@mantine/core";
import { AccessRequestStates } from "../utils/enums";

export function AccessRequestStatusBadge({ state }: { state: string }) {
  switch (state) {
    case AccessRequestStates.Created:
      return <Badge>Created</Badge>;
    case AccessRequestStates.Approved:
      return <Badge>Approved</Badge>;
    case AccessRequestStates.Denied:
      return <Badge>Denied</Badge>;
    case AccessRequestStates.Finished:
      return <Badge>Finished</Badge>;
    default:
        return <Badge>Unknown</Badge>;
  }
}
