import {
  Button,
  Container,
  createStyles,
  Text,
  Title,
  Group,
  Select,
} from "@mantine/core";
import { api } from "../../utils/api";
import type { AccessRequest, AccessRequestStep } from "@prisma/client";
import EditorJsRenderer from "../EditorJsRenderer";
import { IconLockAccess } from "@tabler/icons";
import { forwardRef, useState } from "react";

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.white,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.sm,
    marginBottom: theme.spacing.md,
  },
  inlineText: {
    display: "inline",
  },
}));
export function ConnectFeedbackRoundStepAction({
  step,
  accessRequest,
}: {
  step: AccessRequestStep;
  accessRequest: AccessRequest;
}) {
  const { classes } = useStyles();
  const utils = api.useContext();
  const [selectedFeedbackRoundId, setSelectedFeedbackRoundId] = useState<
    string | undefined
  >(undefined);
  const stepStatusResult = api.accessRequest.getStepStatusForUser.useQuery({
    stepId: step.id,
    accessRequestId: accessRequest.id,
  });
  const allFeedbackRoundResult = api.feedback.getAllFeedbackRounds.useQuery(
    {}
  );
  const acceptMutation = api.accessRequest.markConnectFeedbackRoundAsDone.useMutation({
    onSuccess() {
      void utils.accessRequest.getAccessRequest.invalidate({
        itemId: accessRequest.id,
      });
    },
  });

  const failedMutation = api.accessRequest.markConnectFeedbackRoundAsFailure.useMutation({
    onSuccess() {
      void utils.accessRequest.getAccessRequest.invalidate({
        itemId: accessRequest.id,
      });
    },
  });

  const skipMutation = api.accessRequest.markConnectFeedbackRoundAsSkipped.useMutation({
    onSuccess() {
      void utils.accessRequest.getAccessRequest.invalidate({
        itemId: accessRequest.id,
      });
    },
  });

  if (stepStatusResult.isLoading) return <div>Loading...</div>;
  if (stepStatusResult.isError) return <div>Error...</div>;

  if (allFeedbackRoundResult.isLoading) return <div>Loading...</div>;
  if (allFeedbackRoundResult.isError) return <div>Error...</div>;

  const { canInteract, hasTakenAction } = stepStatusResult.data;
  const accessRequestSelection = allFeedbackRoundResult.data.map(
    (feedbackRound) => ({
      value: feedbackRound.id,
      accessRequest: feedbackRound,
      name: `${feedbackRound.title}`,
      label: `${feedbackRound.title}`,
    })
  );

  return (
    <Container size="sm" className={classes.area}>
      <Title order={3} className={classes.title}>
        {step.name}
      </Title>
      <Text fz="sm" fw={300}>
        {step.description && <EditorJsRenderer data={step.description} />}
      </Text>


      <Select
        placeholder="Select access request"
        itemComponent={SelectItem}
        data={accessRequestSelection}
        searchable
        maxDropdownHeight={400}
        nothingFound="No access requests found"
        onChange={(value) => {
          if (!value) {
            setSelectedFeedbackRoundId(undefined);
            return;
          }
          if (
            accessRequestSelection.some(
              (accessRequest) => accessRequest.value === value
            )
          ) {
            setSelectedFeedbackRoundId(value);
            return;
          }
        }}
        filter={(value, item) =>
          typeof item.name === "string" &&
          typeof value === "string" &&
          item.name.toLowerCase().includes(value.toLowerCase().trim())
        }
      />

      {canInteract && (
        <Group>
          
          <Button
            disabled={(selectedFeedbackRoundId === undefined)}
            onClick={() => {
              if(selectedFeedbackRoundId === undefined){ 
                return;
              }
              acceptMutation.mutate({
                stepId: step.id,
                accessRequestId: accessRequest.id,
                connectedFeedbackRoundId: selectedFeedbackRoundId,
                comment: "No comment",
              })
            }
            }
          >
            Verify
          </Button>
          <Button
            onClick={() =>
              failedMutation.mutate({
                stepId: step.id,
                accessRequestId: accessRequest.id,
                comment: "No comment",
              })
            }
          >
            Failed
          </Button>
          <Button
            onClick={() =>
              skipMutation.mutate({
                stepId: step.id,
                accessRequestId: accessRequest.id,
                comment: "No comment",
              })
            }
          >
            Not applicable
          </Button>
        </Group>
      )}

      {hasTakenAction && <div>You have already taken action. Thanks!</div>}
    </Container>
  );
}
interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  name: string;
  accessRequest?: AccessRequest;
  label: string;
}
const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ name, accessRequest, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        {accessRequest && <IconLockAccess />}
        <div>
          <Text size="sm">{name}</Text>
        </div>
      </Group>
    </div>
  )
);
SelectItem.displayName = "connectedAccessRequestStepActionSelectItem";
