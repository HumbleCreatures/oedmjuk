import { Badge } from "@mantine/core";
import { SelectionStates } from "../utils/enums";

export function SelectionStatusBadge({ state }: { state: string }) {
  switch (state) {
    case SelectionStates.Created:
      return <Badge>Open for alternatives</Badge>;
    case SelectionStates.BuyingStarted:
      return <Badge>Voting ongoing</Badge>;
    case SelectionStates.VoteClosed:
      return <Badge>Finished</Badge>;
    default:
        return <Badge>Unknown</Badge>;
  }
}
