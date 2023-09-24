import { forwardRef } from 'react';
import { Group, Text, Select, Loader } from '@mantine/core';
import { IconBox, IconColorSwatch, IconLockAccess, IconNotebook } from '@tabler/icons';
import { api } from '../utils/api';
import { AccessRequest, Proposal } from '@prisma/client';



interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  name: string;
  proposal?: Proposal;
  selection?: Selection;
  accessRequest?: AccessRequest;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ name, selection, proposal, accessRequest,  ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        {proposal && <IconNotebook />}
        {selection && <IconColorSwatch />}
        {accessRequest && <IconLockAccess />}
        <div>
          <Text size="sm">{name}</Text>
        </div>
      </Group>
    </div>
  )
);

SelectItem.displayName = '@mantine/core/SelectItem';

export function AgendaConnector({ calendarEventId }:  { calendarEventId: string}) {
  const utils = api.useContext();
  const calendarEventResult = api.calendarEvents.getPossibleAgendaItems.useQuery({ calendarEventId });


  const addProposalToAgenda = api.calendarEvents.addProposalToCalendarEvent.useMutation({
    onSuccess: async () => {
      await calendarEventResult.refetch();
      await utils.calendarEvents.getCalendarEvent.refetch({ itemId: calendarEventId});
    }
  });

  const addSelectionToAgenda = api.calendarEvents.addSelectionToCalendarEvent.useMutation({
    onSuccess: async () => {
      await calendarEventResult.refetch();
      await utils.calendarEvents.getCalendarEvent.refetch({ itemId: calendarEventId});
    }
  });

  const addAccessRequestToAgenda = api.calendarEvents.addAccessRequestToCalendarEvent.useMutation({
    onSuccess: async () => {
      await calendarEventResult.refetch();
      await utils.calendarEvents.getCalendarEvent.refetch({ itemId: calendarEventId});
    }
  });

  if (calendarEventResult.isLoading) {
    return <Loader />
  }
  if(!calendarEventResult.data ) {  
    return <Text size="xs">No Result To Connect</Text>
  }

  const proposalSelection = calendarEventResult.data.proposals.map((proposal) => ({
    value: proposal.id, 
    group: "Proposals",
    proposal: proposal,
    name: proposal.title
  }));

  const selectionSelection = calendarEventResult.data.selections.map((selection) => ({
    value: selection.id, 
    group: "Selections",
    selection: selection,
    name: selection.title
  }));

  const accessRequestSelection = calendarEventResult.data.accessRequests.map((accessRequest) => ({ 
    value: accessRequest.id, 
    group: "Access Requests",
    accessRequest: accessRequest,
    name: accessRequest.readableId
  }));
  
  return (
    <Select
      placeholder="Select items to add to agenda"
      itemComponent={SelectItem}
      data={[...proposalSelection, ...selectionSelection, ...accessRequestSelection]}
      searchable
      maxDropdownHeight={400}
      nothingFound="No space found."
      onChange={(value) => {
        if(!value) return;
        if(proposalSelection.some((proposal) => proposal.value === value)) {
          addProposalToAgenda.mutate({ calendarEventId, proposalId: value });
          return;
        }
        if(selectionSelection.some((selection) => selection.value === value)) {
          addSelectionToAgenda.mutate({ calendarEventId, selectionId: value });
          return;
        }
        if(accessRequestSelection.some((accessRequest) => accessRequest.value === value)) {
          addAccessRequestToAgenda.mutate({ calendarEventId, accessRequestId: value });
          return;
        }

      }}
      filter={(value, item) =>
        item.name.toLowerCase().includes(value && value.toLowerCase().trim())
      }
    />
  );
}