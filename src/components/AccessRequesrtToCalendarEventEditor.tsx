import { Container, MultiSelect, Title, createStyles } from "@mantine/core";
import { useState } from "react";
import { api } from "../utils/api";
import { AccessRequest, Proposal } from "@prisma/client";

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

export function AccessRequestToCalendarEventEditor({spaceId, itemId, selectedAccessRequests}: {spaceId: string, itemId: string, selectedAccessRequests: AccessRequest[]}) {
    const [searchAccessRequestValue, onSearchAccessRequestChange] = useState("");

    const accessRequestQuery = api.accessRequest.getAllAccessRequestsForSpace.useQuery({
        spaceId,
      });

    const { classes } = useStyles();
    const utils = api.useContext();
    const addAccessRequestMutation =
    api.calendarEvents.addAccessRequestToCalendarEvent.useMutation({
      onSuccess() {
        void utils.calendarEvents.getCalendarEvent.invalidate({ itemId });
      },
    });

  const removeAccessRequestMutation =
    api.calendarEvents.removeAccessRequestFromCalendarEvent.useMutation({
      onSuccess() {
        void utils.calendarEvents.getCalendarEvent.invalidate({ itemId });
      },
    });


    if(accessRequestQuery.isLoading) return <div>Loading...</div>
    if(accessRequestQuery.isError) return <div>Error...</div>
    if(accessRequestQuery.data === undefined) return <div>Undefined...</div>

    const accessRequestSelectValue = selectedAccessRequests.map((accessRequests) => accessRequests.id);

    const accessRequestSelectItems = accessRequestQuery.data.map((accessRequest) => ({
        value: accessRequest.id,
        label: accessRequest.readableId,
      }));

    
    return <Container size="sm" className={classes.area}>
    <Title className={classes.areaTitle} order={2}>
      Access Requests
    </Title>
    <MultiSelect
      data={accessRequestSelectItems}
      label="Connect access requests"
      placeholder="select access request"
      searchable
      searchValue={searchAccessRequestValue}
      onSearchChange={onSearchAccessRequestChange}
      nothingFound="Nothing found"
      clearable
      onChange={(value) => {
        console.log(value);
        if (value.length === 0) {
          if (accessRequestSelectValue.length > 0) {
            removeAccessRequestMutation.mutate({
              calendarEventId: itemId,
              accessRequestIds: accessRequestSelectValue,
            });
          } else {
            return;
          }
        }

        if(value.length < accessRequestSelectValue.length) { 
          const removedAccessRequests = accessRequestSelectValue.filter((proposalId) => !value.includes(proposalId));
          removeAccessRequestMutation.mutate({
            calendarEventId: itemId,
            accessRequestIds: removedAccessRequests,
          });
          return;
        }

        const lastValue = value[value.length - 1];
        if (lastValue === undefined) return;
        addAccessRequestMutation.mutate({
          calendarEventId: itemId,
          proposalId: lastValue,
        });
      }}
      value={accessRequestSelectValue}
    />
  </Container>
}