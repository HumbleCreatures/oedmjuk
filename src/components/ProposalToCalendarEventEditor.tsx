import { Container, MultiSelect, Title, createStyles } from "@mantine/core";
import { useState } from "react";
import { api } from "../utils/api";
import { Proposal } from "@prisma/client";

const useStyles = createStyles((theme) => ({
    area: {
      backgroundColor: theme.colors.gray[0],
      borderRadius: theme.radius.md,
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
    },
    areaTitle: {
      fontSize: theme.fontSizes.md,
      marginBottom: theme.spacing.md,
    },
    editorWrapper: {
      marginTop: theme.spacing.md,
    },
    fullWidth: {
      width: "100%",
    },
  }));

export function ProposalToCalendarEventEditor({spaceId, itemId, selectedProposals}: {spaceId: string, itemId: string, selectedProposals: Proposal[]}) {
    const [searchProposalValue, onSearchProposalChange] = useState("");

    const proposalQuery = api.proposal.getActiveSpaceProposals.useQuery({
        spaceId,
      });

    const { classes } = useStyles();
    const utils = api.useContext();
    const addProposalMutation =
    api.calendarEvents.addProposalToCalendarEvent.useMutation({
      onSuccess() {
        void utils.calendarEvents.getCalendarEvent.invalidate({ itemId });
      },
    });

  const removeProposalMutation =
    api.calendarEvents.removeProposalFromCalendarEvent.useMutation({
      onSuccess() {
        void utils.calendarEvents.getCalendarEvent.invalidate({ itemId });
      },
    });


    if(proposalQuery.isLoading) return <div>Loading...</div>
    if(proposalQuery.isError) return <div>Error...</div>
    if(proposalQuery.data === undefined) return <div>Undefined...</div>

    const proposalSelectValue = selectedProposals.map((proposal) => proposal.id);

    const proposalSelectItems = proposalQuery.data.map((proposal) => ({
        value: proposal.id,
        label: proposal.title,
      }));

    
    return <Container size="sm" className={classes.area}>
    <Title className={classes.areaTitle} order={2}>
      Proposals
    </Title>
    <MultiSelect
      data={proposalSelectItems}
      label="Connect proposals"
      placeholder="You can only select created proposals"
      searchable
      searchValue={searchProposalValue}
      onSearchChange={onSearchProposalChange}
      nothingFound="Nothing found"
      clearable
      onChange={(value) => {
        console.log(value);
        if (value.length === 0) {
          if (proposalSelectValue.length > 0) {
            removeProposalMutation.mutate({
              calendarEventId: itemId,
              proposalIds: proposalSelectValue,
            });
          } else {
            return;
          }
        }

        if(value.length < proposalSelectValue.length) { 
          const removedProposals = proposalSelectValue.filter((proposalId) => !value.includes(proposalId));
          removeProposalMutation.mutate({
            calendarEventId: itemId,
            proposalIds: removedProposals,
          });
          return;
        }

        const lastValue = value[value.length - 1];
        if (lastValue === undefined) return;
        addProposalMutation.mutate({
          calendarEventId: itemId,
          proposalId: lastValue,
        });
      }}
      value={proposalSelectValue}
    />
  </Container>
}