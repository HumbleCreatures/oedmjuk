import { Badge } from "@mantine/core";
import { ProposalStates } from "../utils/enums";

export function ProposalStatusBadge({ state }: { state: string }) {
  switch (state) {
    case ProposalStates.ProposalCreated:
      return <Badge>Draft</Badge>;
    case ProposalStates.ProposalOpen:
      return <Badge>Open for objections</Badge>;
    case ProposalStates.ObjectionsResolved:
      return <Badge>Voting</Badge>;
    case ProposalStates.VoteClosed:
      return <Badge>Finished</Badge>;
    default:
        return <Badge>Unknown</Badge>;
  }
}
