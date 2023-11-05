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
export function ConnectAccessRequestStepAction({
  step,
  accessRequest,
}: {
  step: AccessRequestStep;
  accessRequest: AccessRequest;
}) {
  const { classes } = useStyles();
  const utils = api.useContext();
  const [selectedAccessRequestId, setSelectedAccessRequestId] = useState<
    string | undefined
  >(undefined);
  const stepStatusResult = api.accessRequest.getStepStatusForUser.useQuery({
    stepId: step.id,
    accessRequestId: accessRequest.id,
  });
  const accessRequestsResult = api.accessRequest.getAllAccessRequests.useQuery(
    {}
  );
  const acceptMutation = api.accessRequest.markConnectAccessRequestAsDone.useMutation({
    onSuccess() {
      void utils.accessRequest.getAccessRequest.invalidate({
        itemId: accessRequest.id,
      });
    },
  });

  const failedMutation = api.accessRequest.markConnectAccessRequestAsFailure.useMutation({
    onSuccess() {
      void utils.accessRequest.getAccessRequest.invalidate({
        itemId: accessRequest.id,
      });
    },
  });

  const skipMutation = api.accessRequest.markConnectAccessRequestAsSkipped.useMutation({
    onSuccess() {
      void utils.accessRequest.getAccessRequest.invalidate({
        itemId: accessRequest.id,
      });
    },
  });

  if (stepStatusResult.isLoading) return <div>Loading...</div>;
  if (stepStatusResult.isError) return <div>Error...</div>;

  if (accessRequestsResult.isLoading) return <div>Loading...</div>;
  if (accessRequestsResult.isError) return <div>Error...</div>;

  const { canInteract, hasTakenAction } = stepStatusResult.data;
  const accessRequestSelection = accessRequestsResult.data.map(
    (accessRequest) => ({
      value: accessRequest.id,
      accessRequest: accessRequest,
      name: `${accessRequest.accessRequestType?.name} (${accessRequest.readableId})`,
      label: `${accessRequest.accessRequestType?.name} (${accessRequest.readableId})`,
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
            setSelectedAccessRequestId(undefined);
            return;
          }
          if (
            accessRequestSelection.some(
              (accessRequest) => accessRequest.value === value
            )
          ) {
            setSelectedAccessRequestId(value);
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
            disabled={(selectedAccessRequestId === undefined)}
            onClick={() => {
              if(selectedAccessRequestId === undefined){ 
                return;
              }
              acceptMutation.mutate({
                stepId: step.id,
                accessRequestId: accessRequest.id,
                connectedAccessRequestId: selectedAccessRequestId,
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
