import { Card, Group, Text, Select, createStyles } from "@mantine/core";
import { SelectionAlternative, SelectionVoteEntry } from "@prisma/client";
import { UserButtonWithData, UserLinkWithData } from "./UserButton";
import { forwardRef } from "react";
import { api } from "../utils/api";
import { DateTime } from "luxon";


const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  bodyArea: {
    backgroundColor: theme.white,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.xs,
  },
  mainTitle: {
    color: theme.white,
    fontSize: theme.fontSizes.xxl,
    marginTop: theme.spacing.xl,
  },
  editorWrapper: {
    marginTop: theme.spacing.md,
  },
  inlineText: {
    display: "inline",
  },
}));

type AlternativeListItemProps = {
  alternative: SelectionAlternative & {
    votes: SelectionVoteEntry[];
};
  vote?: SelectionVoteEntry;
  canVote: boolean;
  currentVotingBalance?: number;
  showResults: boolean;
};

export function AlternativeListItem({
  alternative,
  canVote,
  currentVotingBalance,
  vote,
  showResults,
}: AlternativeListItemProps) {
  const { classes } = useStyles();
    const utils = api.useContext();
    const mutation = api.selection.buyVotes.useMutation({
        onSuccess() {
        void utils.selection.getSelection.invalidate({ selectionId: alternative.selectionId });
        void utils.selection.getUserVotes.invalidate({ itemId: alternative.selectionId });
        },
    });
  const maxNumberOfVotes = canVote && currentVotingBalance
    ? Math.floor(Math.pow(currentVotingBalance, 1 / 2))
    : 0;
  const voteData = (maxNumberOfVotes > 0 ?  Array(maxNumberOfVotes) : [])
    .fill(0)
    .map((_, i) => ({
      label: `${i + 1} votes`,
      value: `${i + 1}`,
      description: `Vote costs ${Math.pow(i + 1, 2)} points`,
    }));

    if (vote) {
        if(!voteData.some((v) => vote.numberOfVotes === 0 || v.value === vote.numberOfVotes.toString())){
            voteData.push({
                label: `${vote.numberOfVotes} votes`,
                value: `${vote.numberOfVotes}`,
                description: `Vote costs ${Math.pow(vote.numberOfVotes, 2)} points`,
            });
        }
    }


  return (
    <Card withBorder shadow="sm" radius="md" style={{overflow: 'visible'}}>
      <Card.Section withBorder inheritPadding py="xs">
        <Text fz="sm" fw={300}>
            Created{" "}
            <Text fz="sm" fw={500} className={classes.inlineText}>
              {DateTime.fromJSDate(alternative.createdAt)
                .setLocale("en")
                .toRelative()}
            </Text>{" "}
            by{" "}
            <Text fz="sm" fw={500} className={classes.inlineText}>
              <UserLinkWithData userId={alternative.creatorId} />
            </Text>
          </Text>
      </Card.Section>
      <Card.Section mt="md" inheritPadding py="xs">
        
          <Text fz="lg" fw={500}>
            {alternative.title}
          </Text>
          <div dangerouslySetInnerHTML={{__html:alternative.body }} />
          
          </Card.Section>
          <Card.Section withBorder mt="md" inheritPadding py="xs">
        <Group position="apart">
            {showResults && <Text fz="lg" fw={500}>
                Total number of votes: {alternative.votes.reduce((acc, vote) => acc + vote.numberOfVotes, 0)}
            </Text>}
          {canVote && !showResults && <Select
            label="Buy votes"
            placeholder="Pick one"
            itemComponent={SelectItem}
            data={voteData}
            searchable
            maxDropdownHeight={400}
            nothingFound="You don't have the funds to vote."
            value={vote ? vote.numberOfVotes.toString() : undefined}
            clearable 
            onChange={(value) => {
                if (value) {
                    mutation.mutate({
                    alternativeId: alternative.id,
                    numberOfVotes: parseInt(value),
                    });
                } else {
                    mutation.mutate({
                        alternativeId: alternative.id,
                        numberOfVotes: 0,
                        });
                }
            }}        
          />}
        </Group>
      </Card.Section>
    </Card>
  );
}

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  label: string;
  description: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <div>
          <Text size="sm">{label}</Text>
          <Text size="xs" opacity={0.65}>
            {description}
          </Text>
        </div>
      </Group>
    </div>
  )
);

SelectItem.displayName = "SelectItem";
