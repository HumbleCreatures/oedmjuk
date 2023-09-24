import { forwardRef } from 'react';
import { Group, Text, Select, Loader } from '@mantine/core';
import { IconBox } from '@tabler/icons';
import { api } from '../utils/api';

const data = [
  {
    label: 'Bender Bending Rodríguez',
    value: 'Bender Bending Rodríguez',
    description: 'Fascinated with cooking',
    group: 'Used to be a pickle'
  },
  {
    label: 'Carol Miller',
    value: 'Carol Miller',
    description: 'One of the richest people on Earth',
    group: 'Used to be a pickle'
  },
  {

    label: 'Homer Simpson',
    value: 'Homer Simpson',
    description: 'Overweight, lazy, and often ignorant',
    group: 'Never was a pickle'
  },
  {
    image: 'https://img.icons8.com/clouds/256/000000/spongebob-squarepants.png',
    label: 'Spongebob Squarepants',
    value: 'Spongebob Squarepants',
    description: 'Not just a sponge',
    group: 'Never was a pickle'
  },
];

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  name: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ name, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <IconBox />
        <div>
          <Text size="sm">{name}</Text>
        </div>
      </Group>
    </div>
  )
);

SelectItem.displayName = '@mantine/core/SelectItem';

export function SpaceConnector({ proposalId }:  { proposalId: string }) {
  const utils = api.useContext();
  const spacesResult = api.proposal.getSpacesAvailableToConnect.useQuery({ proposalId });
  const connectSpaceMutation = api.proposal.connectSpaceToProposal.useMutation({
    onSuccess: async () => {
      await spacesResult.refetch();
      await utils.proposal.getProposal.refetch();
    }
  });

  if (spacesResult.isLoading) {
    return <Loader />
  }
  if(!spacesResult.data || spacesResult.data.length === 0) {  
    return <Text size="xs">No space available to connect</Text>
  }
  
  return (
    <Select
      placeholder="Select space to connect"
      itemComponent={SelectItem}
      data={spacesResult.data.map((space) => ({ ...space, value: space.id, group: "Spaces" }))}
      searchable
      maxDropdownHeight={400}
      nothingFound="No space found."
      onChange={(value) => {
        if(!value) return;
        connectSpaceMutation.mutate({ proposalId, spaceId: value })
      }}
      filter={(value, item) =>
        typeof item.name === 'string' && typeof value === 'string' && item.name.toLowerCase().includes(value.toLowerCase().trim())
      }
    />
  );
}